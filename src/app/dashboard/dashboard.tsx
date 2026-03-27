import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from "@mui/material";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import { useEffect, useState } from "react";
import { getSocket } from "../../services/socket";
import { Close } from "@mui/icons-material";
import API from "../../services/api/axios";

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

interface NewOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface NewOrderPayload {
  id: string;
  orderId: number;
  customerName: string;
  items: NewOrderItem[];
  totalAmount: number;
  summary?: string;
  createdAt: string;
}

const Dashboard = ({ toggleTheme, mode }: Props) => {
  const [newOrder, setNewOrder] = useState<NewOrderPayload | null>(null);
  const [openNewOrderDialog, setOpenNewOrderDialog] = useState(false);
  const [updatingDialogStatus, setUpdatingDialogStatus] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewOrder = (order: NewOrderPayload) => {
      setNewOrder(order);
      setOpenNewOrderDialog(true);
    };

    socket.on("new-order", handleNewOrder);
    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("new_order", handleNewOrder);
    };
  }, []);

  const updateStatus = async (status: "ACCEPTED" | "REJECTED") => {
    if (!newOrder) return;

    try {
      setUpdatingDialogStatus(true);
      await API.put(`/orders/${newOrder.id}/status`, { status });
      setOpenNewOrderDialog(false);
      setNewOrder(null);
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);
    } finally {
      setUpdatingDialogStatus(false);
    }
  };

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

      <Dialog
        open={openNewOrderDialog}
        onClose={() => {
          if (!updatingDialogStatus) {
            setOpenNewOrderDialog(false);
          }
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={500}>
              Order Details
            </Typography>
            <IconButton
              onClick={() => setOpenNewOrderDialog(false)}
              disabled={updatingDialogStatus}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          {newOrder && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Order ID: {newOrder.orderId}
                </Typography>
                <Typography variant="h6" fontWeight={400} sx={{ mt: 1 }}>
                  Customer: {newOrder.customerName}
                </Typography>
              </Box>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: "divider" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {newOrder.items.map((item) => (
                      <TableRow key={`${newOrder.id}-${item.productId}`}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>
                        Grand Total
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(newOrder.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" color="text.secondary">
                Order On: {formatDateTime(newOrder.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "flex-end", gap: 1.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            disabled={!newOrder || updatingDialogStatus}
            onClick={() => updateStatus("REJECTED")}
            sx={{
              minWidth: 110,
              fontWeight: 700,
              borderColor: "text.primary",
              color: "text.primary",
            }}
          >
            {updatingDialogStatus ? "Saving..." : "Reject"}
          </Button>
          <Button
            variant="contained"
            disabled={!newOrder || updatingDialogStatus}
            onClick={() => updateStatus("ACCEPTED")}
            sx={{
              minWidth: 110,
              fontWeight: 700,
              bgcolor: "#111",
              "&:hover": {
                bgcolor: "#000",
              },
            }}
          >
            {updatingDialogStatus ? "Saving..." : "Accept"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;