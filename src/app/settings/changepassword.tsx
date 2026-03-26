import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";

interface ChangePasswordProps {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const HEADER_HEIGHT = 64;
const FOOTER_HEIGHT = 64;

const ChangePassword = ({ toggleTheme, mode }: ChangePasswordProps) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ BUTTON VALIDATION
  const isFormValid =
    form.currentPassword.trim() !== "" &&
    form.newPassword.trim() !== "" &&
    form.confirmPassword.trim() !== "" &&
    form.newPassword === form.confirmPassword;

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.currentPassword.trim())
      newErrors.currentPassword = "Current password is required";

    if (!form.newPassword.trim())
      newErrors.newPassword = "New password is required";

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      await API.put("/profile/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      // ✅ SUCCESS TOAST
      setSuccess("Password updated successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setErrors({
        currentPassword:
          (err as any)?.response?.data?.message || "Password update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box height="100vh">
      {/* HEADER */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          zIndex: 1200,
        }}
      >
        <Header toggleTheme={toggleTheme} mode={mode} />
      </Box>

      {/* CENTER CONTENT */}
      <Box
        sx={{
          position: "fixed",
          top: HEADER_HEIGHT,
          bottom: FOOTER_HEIGHT,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 2.5, sm: 4 },
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Change Password
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="Current Password"
            name="currentPassword"
            margin="normal"
            value={form.currentPassword}
            onChange={handleChange}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
          />

          <TextField
            fullWidth
            type="password"
            label="New Password"
            name="newPassword"
            margin="normal"
            value={form.newPassword}
            onChange={handleChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />

          <TextField
            fullWidth
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? "Updating..." : "Submit"}
          </Button>
        </Paper>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: FOOTER_HEIGHT,
          zIndex: 1200,
        }}
      >
        <Footer />
      </Box>

      {/* ✅ SUCCESS TOAST */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePassword;
