import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  useTheme,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/authcontext";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const { login } = useAuth(); // ✅ REAL AUTH

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // 🔐 BACKEND LOGIN
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        (err as unknown as { response?: { data?: { message?: string } } })?.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={2}
      bgcolor={isDark ? "#121212" : "#f5f5f5"}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 380,
          p: { xs: 3, sm: 4 },
          textAlign: "center",
          borderRadius: 2,
          border: "1px solid",
          borderColor: isDark ? "#333" : "#e0e0e0",
        }}
      >
        <Typography variant="h5" mb={2}>
          Login
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Password"
            margin="normal"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            sx={{
              mt: 2,
              py: 1.2,
              backgroundColor: isDark ? "#fff" : "#000",
              color: isDark ? "#000" : "#fff",
              "&:hover": {
                backgroundColor: isDark ? "#e0e0e0" : "#222",
              },
            }}
          >
            LOGIN
          </Button>
        </form>

        <Box mt={2}>
          <Link
            component={RouterLink}
            to="/forgot-password/init"
            sx={{
              color: isDark ? "#fff" : "#000",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Forgot Password?
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
