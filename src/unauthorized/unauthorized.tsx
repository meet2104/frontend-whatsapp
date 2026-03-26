import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface UnauthorizedProps {
  notFound?: boolean;
}

const Unauthorized = ({ notFound = false }: UnauthorizedProps) => {
  const navigate = useNavigate();

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={2}
      textAlign="center"
    >
      <Typography variant="h3" mb={1}>
        {notFound ? "404" : "Access Denied"}
      </Typography>

      <Typography mb={3}>
        {notFound ? "Page not found" : "You are not authorized"}
      </Typography>

      <Button variant="contained" onClick={() => navigate("/")}>
        Go Back
      </Button>
    </Box>
  );
};

export default Unauthorized;
