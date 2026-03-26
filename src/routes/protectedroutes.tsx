import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import { Box, CircularProgress } from "@mui/material";

type Role = "SUPER_ADMIN" | "ADMIN" | "SHOP_OWNER";

interface Props {
  roles?: Role[];
}

const ProtectedRoutes = ({ roles }: Props) => {
  const { user, loading } = useAuth();

  // ⏳ Show loader while auth initializes
  if (loading) {
    return (
      <Box
        height="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 🔐 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Role not allowed
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authorized
  return <Outlet />;
};

export default ProtectedRoutes;
