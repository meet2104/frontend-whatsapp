import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  MenuItem,
  Menu,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import { PhotoCamera, Edit, Delete } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";
import { useAuth } from "../../context/authcontext";

interface ProfileProps {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const HEADER_HEIGHT = 64;
const FOOTER_HEIGHT = 64;

const Profile = ({ toggleTheme, mode }: ProfileProps) => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  /* ================= STRICT MODE FETCH GUARD ================= */
  const fetchedRef = useRef(false);

  /* ================= PROFILE DISPLAY ================= */
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    role: "",
  });

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    companayName: "",
  });

  const [toast, setToast] = useState(false);

  /* ================= IMAGE STATES ================= */
  const [profileImage, setProfileImage] = useState<string | null>(null); // saved
  const [draftProfileImage, setDraftProfileImage] = useState<string | null>(null); // preview

  /* ================= MENU ================= */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initials =
    profile.firstName && profile.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
      : "";

  /* ================= FETCH PROFILE ================= */
  const fetchProfile = async () => {
    const res = await API.get("/profile");
    const user = res.data;

    setProfile({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      role: typeof user.role === "string" ? user.role : user.role?.name ?? "",
    });

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      role: typeof user.role === "string" ? user.role : user.role?.name ?? "",
      address: user.address ?? "",
      latitude: user.lat?.toString() ?? "",
      longitude: user.lng?.toString() ?? "",
      phone: user.mobile ?? "",
      companayName: user.companayName ?? "",
    });

    const imageUrl = user.profileImage?.url || null;

    setProfileImage(imageUrl);
    setDraftProfileImage(imageUrl);

    // 🔑 sync Header avatar ONLY from saved data
    updateUser({
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      profileImage: user.profileImage,
    });
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchProfile();
  }, []);

  /* ================= FORM CHANGE ================= */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= MENU ================= */
  const openMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  /* ================= UPLOAD PHOTO (PREVIEW ONLY) ================= */
  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) return;
      setDraftProfileImage(reader.result as string);
    };

    reader.readAsDataURL(file);
    closeMenu();
  };

  /* ================= REMOVE PHOTO (PREVIEW ONLY) ================= */
  const handleRemovePhoto = () => {
    setDraftProfileImage(null);
    closeMenu();
  };

  /* ================= VALIDATION ================= */
  const isPhoneValid = /^\d{10}$/.test(form.phone);

  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.companayName &&
    form.address &&
    isPhoneValid;

  /* ================= SAVE PROFILE (ONLY HERE UPDATE DB) ================= */
  const handleSave = async () => {
    if (!isFormValid) return;

    await API.put("/profile/update", {
      firstName: form.firstName,
      lastName: form.lastName,
      mobile: form.phone,
      companayName: form.companayName,
      address: form.address,
      lat: Number(form.latitude) || 0,
      lng: Number(form.longitude) || 0,
      profileImage: { url: draftProfileImage || "" },
    });

    await fetchProfile();
    setToast(true);
  };

  return (
    <Box height="100vh" bgcolor={mode === "dark" ? "#121212" : "#f4f6f8"}>
      {/* HEADER */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, height: HEADER_HEIGHT }}>
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
            height: { xs: "100%", sm: "95%" },
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* CARD HEADER (NOT SCROLLING) */}
          <Box
            px={{ xs: 2, sm: 3, md: 4 }}
            py={1.5}
            display="flex"
            alignItems={{ xs: "flex-start", sm: "center" }}
            flexDirection={{ xs: "column", sm: "row" }}
            gap={2}
          >
            <IconButton onClick={openMenu}>
              <Avatar src={draftProfileImage || undefined} sx={{ width: 72, height: 72 }}>
                {!draftProfileImage && initials}
              </Avatar>
            </IconButton>

            <Box>
              <Typography fontWeight="bold" fontSize={20}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography fontSize={13} color="primary.main" fontWeight={600}>
                {profile.role}
              </Typography>
            </Box>
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
            {!profileImage ? (
              <MenuItem>
                <label style={{ display: "flex", cursor: "pointer" }}>
                  <ListItemIcon>
                    <PhotoCamera fontSize="small" />
                  </ListItemIcon>
                  Upload Photo
                  <input hidden type="file" accept="image/*" onChange={handleUploadPhoto} />
                </label>
              </MenuItem>
            ) : [
              <MenuItem key="edit">
                <label style={{ display: "flex", cursor: "pointer" }}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  Edit Photo
                  <input hidden type="file" accept="image/*" onChange={handleUploadPhoto} />
                </label>
              </MenuItem>,
              <MenuItem key="remove" onClick={handleRemovePhoto}>
                <ListItemIcon>
                  <Delete fontSize="small" />
                </ListItemIcon>
                Remove Photo
              </MenuItem>,
            ]}
          </Menu>

          <Divider />

          {/* ✅ SCROLLABLE CONTENT */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3, md: 4 },
            }}
          >
            <Typography fontWeight="bold" mb={2}>
              Basic Information
            </Typography>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
              <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
              <TextField label="Email" value={form.email} disabled />
              <TextField label="Role" value={form.role} disabled />
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography fontWeight="bold" mb={2}>
              Company Details
            </Typography>

            <TextField
              fullWidth
              label="Company Name"
              name="companayName"
              value={form.companayName}
              onChange={handleChange}
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
            />

            <Divider sx={{ my: 4 }} />

            <Typography fontWeight="bold" mb={2}>
              Contact & Location
            </Typography>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
              gap={3}
            >
              <TextField
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={form.phone !== "" && !isPhoneValid}
                required
              />
              <TextField label="Latitude" value={form.latitude} disabled />
              <TextField label="Longitude" value={form.longitude} disabled />
            </Box>

            <Box
              display="flex"
              justifyContent="flex-end"
              gap={2}
              mt={4}
              flexWrap="wrap"
            >
              <Button variant="outlined" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={!isFormValid}>
                Save Profile
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* FOOTER */}
      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, height: FOOTER_HEIGHT }}>
        <Footer />
      </Box>

      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity="success" variant="filled">
          Profile updated successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
