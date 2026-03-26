import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../services/api/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ✅ BUTTON VALIDATION (UNCHANGED)
  const isFormValid =
    newPassword.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    newPassword === confirmPassword;

  const handleReset = async () => {
    if (!token) {
      setError("Invalid or expired reset link");
      return;
    }

    try {
      await API.post("/auth/reset-password", {
        token,
        newPassword,
      });

      // ✅ SHOW SUCCESS TOAST
      setSuccess(true);

      // ✅ REDIRECT TO LOGIN
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Reset password failed");
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      px={2}
    >
      <Paper sx={{ width: "100%", maxWidth: 420, p: { xs: 3, sm: 4 }, textAlign: "center" }}>
        <Typography variant="h5" mb={2}>
          Reset Password
        </Typography>

        {error && (
          <Typography color="error" mb={1}>
            {error}
          </Typography>
        )}

        <TextField
          fullWidth
          label="New Password"
          type="password"
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={!isFormValid}
          onClick={handleReset}
        >
          Reset Password
        </Button>
      </Paper>

      {/* ✅ SUCCESS TOAST (MATCHES PROFILE & CHANGE PASSWORD) */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled">
          Password reset successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;
