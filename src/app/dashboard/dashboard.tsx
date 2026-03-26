import { Box, Typography } from "@mui/material";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import { useEffect } from "react";
import { getSocket } from "../../services/socket";

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

interface Order {
  _id: string;
  customerName: string;
}


const Dashboard = ({ toggleTheme, mode }: Props) => {

   useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new_order", (order: Order) => {
      console.log("📦 New Order:", order);
      alert(`New order from ${order.customerName}`);
    });

    return () => {
      socket.off("new_order");
    };
  }, []);
  return (
    <>
      <Header toggleTheme={toggleTheme} mode={mode} />

      <Box
        sx={{
          mt: { xs: 8, sm: 9 },
          mb: { xs: 10, sm: 9 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="h4">Dashboard</Typography>
      </Box>

      <Footer />
    </>
  );
};

export default Dashboard;
