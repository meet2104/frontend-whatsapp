import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useEffect, useState, useRef  } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";

/* =========================
   TYPES
========================= */
interface Order {
  id: string;
  orderId: number;
  customerId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

const OrderDetails = ({ toggleTheme, mode }: any) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  /* =========================
     FETCH ORDER + ITEMS
  ========================= */
  // useEffect(() => {
  //   if (!id) return;

  //   const fetchOrder = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await API.get(`/orders/${id}`);
  //       setOrder(res.data.order);
  //       setItems(res.data.items || []);
  //     } catch (error) {
  //       console.error("FETCH ORDER ERROR:", error);
  //       navigate("/unauthorized");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchOrder();
  // }, [id, navigate]);

  useEffect(() => {
  if (!id) return;

  // ✅ prevent double API call (React 18 StrictMode)
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data.order);
      setItems(res.data.items || []);
    } catch (error) {
      console.error("FETCH ORDER ERROR:", error);
      navigate("/unauthorized");
    } finally {
      setLoading(false);
    }
  };

  fetchOrder();
}, [id, navigate]);

  if (loading) {
    return (
      <>
        <Header toggleTheme={toggleTheme} mode={mode} />
        <Box
          sx={{
            height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
            mt: `${HEADER_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  if (!order) return null;

  /* =========================
     TOTAL (UNCHANGED)
  ========================= */
  const totalAmount = items.reduce(
    (sum, i) => sum + i.quantity * i.product.price,
    0
  );

  return (
    <>
      {/* HEADER */}
      <Header toggleTheme={toggleTheme} mode={mode} />

      {/* CONTENT */}
      <Box
        sx={{
          position: "fixed",
          top: HEADER_HEIGHT,
          bottom: FOOTER_HEIGHT,
          left: 0,
          right: 0,
          overflowY: "auto",
          backgroundColor: mode === "dark" ? "#121212" : "#f4f6f8",
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: "100%", boxSizing: "border-box" }}>
          <Paper
            elevation={6}
            sx={{
              height: "100%",
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight="bold" variant="h6" mb={2}>
              Order Details
            </Typography>

            {/* ================= DETAILS ================= */}
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
              gap={2}
            >
              <TextField label="Order ID" value={order.orderId} disabled />
              <TextField label="Customer ID" value={order.customerId} disabled />
              <TextField label="Status" value={order.status} disabled />
              <TextField label="Total Amount" value={totalAmount} disabled />
            </Box>
            <Box mt={2}>
              <TextField
                label="Summary"
                value={order.summary || "-"}
                disabled
                fullWidth
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* ================= ITEMS ================= */}
            <Typography fontWeight="bold" mb={1}>
              Order Items
            </Typography>

            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                flexGrow: 1,
                minHeight: 80,
                overflow: "auto",
              }}
            >
              <Table size="small" stickyHeader sx={{ minWidth: 560 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={1} align="center">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.product.price}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.quantity * item.product.price}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ================= ACTION ================= */}
            <Box mt={1} display="flex" justifyContent="flex-end" flexWrap="wrap">
              <Button variant="outlined" onClick={() => navigate("/orders")}>
                Back
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* FOOTER */}
      <Footer />
    </>
  );
};

export default OrderDetails;
