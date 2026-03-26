import { Box, Button, TextField, Typography, Link as MuiLink, Paper } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../../services/api/axios";

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFinishStep = location.pathname.includes("finish");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // ✅ EMAIL VALIDATION
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid = emailRegex.test(email);

  const handleSendLink = async () => {
    try {
      await API.post("/auth/forgot-password", { email });
      navigate("/forgot-password/finish");
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" px={2}>
      <Paper sx={{ width: "100%", maxWidth: 420, p: { xs: 3, sm: 4 }, textAlign: "center" }}>
        <Typography variant="h5" mb={2}>
          Forgot Password
        </Typography>

        {!isFinishStep ? (
          <>
            <TextField
              fullWidth
              label="Registered Email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!isFormValid}
              onClick={handleSendLink}
            >
              Send Link
            </Button>

            {message && <Typography color="error">{message}</Typography>}
          </>
        ) : (
          <>
            <Typography color="primary">
              Password reset link sent to your email
            </Typography>

            <MuiLink component={Link} to="/login" sx={{ mt: 2, display: "block" }}>
              Back to Login
            </MuiLink>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
