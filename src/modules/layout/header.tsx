import {
  AppBar,
  Toolbar,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  ListItemIcon,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  PersonOutline,
  LockReset,
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useState, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import NeuronetLogo from "../../assets/neuronet-black.png";
import { useAuth } from "../../context/authcontext";

export interface HeaderProps {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const Header = ({ toggleTheme, mode }: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [navAnchorEl, setNavAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  /* ================= NAME NORMALIZATION ================= */

  const { firstName, lastName } = useMemo(() => {
    if (!user) return { firstName: "", lastName: "" };

    if ((user as any).firstName && (user as any).lastName) {
      return {
        firstName: (user as any).firstName.trim().split(" ")[0],
        lastName: (user as any).lastName.trim().split(" ").slice(-1)[0],
      };
    }

    if ((user as any).name) {
      const parts = (user as any).name.trim().split(" ");
      return {
        firstName: parts[0],
        lastName: parts[parts.length - 1],
      };
    }

    return { firstName: "", lastName: "" };
  }, [user]);

  const userInitial =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : "";

  const displayName =
    firstName && lastName ? `${firstName} ${lastName}` : "";

  const profileImageUrl = (user as any)?.profileImage?.url || "";
  const textColor = mode === "dark" ? "#ffffff" : "#000000";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setAnchorEl(null);
  };

  const handleNavMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNavAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setNavAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    handleClose();
    handleNavMenuClose();
    navigate(path);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  /* ================= ROLE NORMALIZATION ================= */
  const normalizedRole = useMemo(() => {
    if (!user?.role) return null;

    const r = user.role.toString().toLowerCase();

    if (r.includes("super")) return "SUPER_ADMIN";
    if (r.includes("admin")) return "ADMIN";
    if (r.includes("shop")) return "SHOP_OWNER";

    return null;
  }, [user?.role]);

  /* ================= NAV LINK STYLE ================= */
  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    textDecoration: "none",
    color: textColor,
    fontWeight: isActive ? "bold" : "normal",
  });

  const navItems = [
    { label: "DASHBOARD", path: "/dashboard", show: true },
    {
      label: "USERS",
      path: "/users",
      show: normalizedRole === "SUPER_ADMIN" || normalizedRole === "ADMIN",
    },
    { label: "CUSTOMERS", path: "/customers", show: true },
    { label: "PRODUCTS", path: "/products", show: true },
    { label: "ORDERS", path: "/orders", show: true },
  ].filter((item) => item.show);

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        backgroundColor: mode === "dark" ? "#1e1e1e" : "#ffffff",
        color: textColor,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "auto auto", md: "auto 1fr auto" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1, md: 1.25 },
          minHeight: { xs: "auto", md: 64 },
        }}
      >
        {/* LOGO */}
        <Box
          sx={{
            width: { xs: 180, sm: 220 },
            height: { xs: 36, sm: 44 },
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            gridColumn: "1 / 2",
          }}
        >
          <img
            src={NeuronetLogo}
            alt="Neuronet Systems Private Limited"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: mode === "dark" ? "invert(1)" : "none",
            }}
          />
        </Box>

        {/* CENTER MENU */}
        {!loading && user && !isMobile && (
          <Box
            sx={{
              gridColumn: "2 / 3",
              width: "auto",
              display: "flex",
              justifyContent: "center",
              gap: 5,
              whiteSpace: "nowrap",
            }}
          >
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} style={navLinkStyle}>
                {item.label}
              </NavLink>
            ))}
          </Box>
        )}

        {/* RIGHT ACTIONS */}
        <Box
          display="flex"
          alignItems="center"
          gap={{ xs: 1, sm: 2 }}
          sx={{
            ml: "auto",
            flexShrink: 0,
            gridColumn: { xs: "2 / 3", md: "3 / 4" },
            justifySelf: "end",
          }}
        >
          {!loading && user && isMobile && (
            <>
              <IconButton onClick={handleNavMenuOpen} sx={{ color: textColor }}>
                <MenuIcon />
              </IconButton>

              <Menu
                anchorEl={navAnchorEl}
                open={Boolean(navAnchorEl)}
                onClose={handleNavMenuClose}
                disableRestoreFocus
                PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"}>
            <Box onClick={toggleTheme} sx={{ cursor: "pointer" }}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </Box>
          </Tooltip>

          {!loading && user && (
            <>
              <Avatar
                src={profileImageUrl || undefined}
                onClick={handleMenuOpen}
                sx={{
                  cursor: "pointer",
                  bgcolor: profileImageUrl ? "transparent" : textColor,
                  color: mode === "dark" ? "#000" : "#fff",
                  fontWeight: "bold",
                }}
              >
                {!profileImageUrl && userInitial}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableRestoreFocus
                PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
              >
                <MenuItem disabled sx={{ fontWeight: "bold" }}>
                  {displayName}
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => handleNavigate("/setting/profile")}>
                  <ListItemIcon>
                    <PersonOutline fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>

                <MenuItem onClick={() => handleNavigate("/setting/change-password")}>
                  <ListItemIcon>
                    <LockReset fontSize="small" />
                  </ListItemIcon>
                  Change Password
                </MenuItem>

                <Divider />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: "error.main",
                    "& .MuiListItemIcon-root": { color: "error.main" },
                  }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
