import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

/* ================= TYPES ================= */

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companayName: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
}

const emptyForm: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  companayName: "",
  address: "",
  phone: "",
  latitude: "",
  longitude: "",
};

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

/* ======================================================
   🔒 STRICT MODE SAFE FETCH (DEDUPED PER USER ID)
   ====================================================== */
const userFetchMap = new Map<string, Promise<any>>();

const fetchUserOnce = (userId: string) => {
  if (!userFetchMap.has(userId)) {
    userFetchMap.set(
      userId,
      API.get(`/users/${userId}`).finally(() => {
        userFetchMap.delete(userId);
      })
    );
  }
  return userFetchMap.get(userId)!;
};

/* ================= COMPONENT ================= */

const UserForm = ({ toggleTheme, mode }: Props) => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const isEdit = Boolean(userId);

  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  /* ================= FETCH USER (EDIT) ================= */
  useEffect(() => {
    if (!isEdit || !userId) return;

    const loadUser = async () => {
      try {
        const res = await fetchUserOnce(userId);
        const u = res.data;

        setForm({
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          email: u.email ?? "",
          role: typeof u.role === "string" ? u.role : u.role?.name ?? "",
          companayName: u.companayName ?? "",
          address: u.address ?? "",
          phone: u.mobile ?? "",
          latitude: u.lat ? String(u.lat) : "",
          longitude: u.lng ? String(u.lng) : "",
        });
      } catch {
        setToast({
          open: true,
          message: "Failed to load user details",
          severity: "error",
        });
      }
    };

    loadUser();
  }, [isEdit, userId]);

  /* ================= HANDLERS ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= VALIDATION ================= */
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneValid = /^\d{10}$/.test(form.phone);

  const isCreateValid =
    form.firstName &&
    form.lastName &&
    emailValid &&
    form.role &&
    form.companayName &&
    form.address &&
    phoneValid;

  const isEditValid =
    form.firstName &&
    form.lastName &&
    form.companayName &&
    form.address &&
    phoneValid;

  const isFormValid = isEdit ? isEditValid : isCreateValid;

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!isFormValid) return;

    setLoading(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role,
      companayName: form.companayName,
      address: form.address,
      mobile: form.phone,
      lat: form.latitude ? Number(form.latitude) : 0,
      lng: form.longitude ? Number(form.longitude) : 0,
    };

    try {
      if (isEdit && userId) {
        await API.put(`/users/${userId}`, payload);
        setToast({
          open: true,
          message: "User updated successfully",
          severity: "success",
        });
      } else {
        await API.post("/users", payload);
        setToast({
          open: true,
          message: "User added successfully",
          severity: "success",
        });
      }

      setTimeout(() => {
        navigate("/users");
      }, 1200);
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "User save failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box height="100vh" bgcolor={mode === "dark" ? "#121212" : "#f4f6f8"}>
      {/* HEADER */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0 }}>
        <Header toggleTheme={toggleTheme} mode={mode} />
      </Box>

      {/* CENTER AREA */}
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
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", xl: 1480 },
            height: { xs: "100%", sm: "90%" },
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* TITLE (NOT SCROLLABLE) */}
          <Box px={{ xs: 2, sm: 3, md: 4 }} py={2}>
            <Typography fontWeight="bold" fontSize={20}>
              {isEdit ? "Edit User" : "Add User"}
            </Typography>
          </Box>

          <Divider />

          {/* SCROLLABLE CONTENT */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                disabled={isEdit}
                onChange={handleChange}
                required
              />

              {!isEdit && (
                <TextField
                  select
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="SUPER ADMIN">SUPER ADMIN</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="SHOP OWNER">SHOP OWNER</MenuItem>
                </TextField>
              )}
            </Box>

            <Divider sx={{ my: 4 }} />

            <TextField
              fullWidth
              label="Company Name"
              name="companayName"
              value={form.companayName}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              multiline
              rows={2}
              required
            />

            <Divider sx={{ my: 4 }} />

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              <TextField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <TextField
                label="Latitude"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
              />
              <TextField
                label="Longitude"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
              />
            </Box>

            <Box
              display="flex"
              justifyContent="flex-end"
              gap={2}
              mt={4}
              flexWrap="wrap"
            >
              <Button variant="outlined" onClick={() => navigate("/users")}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
              >
                {isEdit ? "Update User" : "Save User"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* FOOTER */}
      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </Box>

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserForm;
