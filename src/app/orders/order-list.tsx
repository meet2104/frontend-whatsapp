import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TablePagination,
  CircularProgress,
  IconButton,
  Tooltip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
  Divider,
  Stack,
} from "@mui/material";
import {
  Search,
  CheckCircleOutline,
  CancelOutlined,
  VisibilityOutlined,
  Close,
} from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";
import { getSocket } from "../../services/socket";

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

interface Order {
  id: string;
  orderId: number;
  customerId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  summary?: string;
  createdAt: string;
  owner?: { name?: string };
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

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const OrdersList = ({ toggleTheme, mode }: Props) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  const isAdmin = role === "ADMIN" || role === "SUPER ADMIN";
  const canManageOrders = !isAdmin;

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [effectiveSearch, setEffectiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "ACCEPTED" | "REJECTED"
  >("ALL");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openNewOrderDialog, setOpenNewOrderDialog] = useState(false);
  const [newOrder, setNewOrder] = useState<NewOrderPayload | null>(null);
  const [updatingDialogStatus, setUpdatingDialogStatus] = useState(false);

  const lastRequestRef = useRef("");

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
    const timer = setTimeout(() => {
      setPage(0);
      setEffectiveSearch(search.trim().length >= 3 ? search.trim() : "");
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = async () => {
    const key = `${page}-${rowsPerPage}-${effectiveSearch}-${statusFilter}-${role}`;
    if (lastRequestRef.current === key) return;
    lastRequestRef.current = key;

    try {
      setLoading(true);
      const res = isAdmin
        ? await API.get("/orders", {
            params: {
              page: 1,
              limit: 1000,
            },
          })
        : await API.get("/orders/owner", {
            params: {
              page: 1,
              limit: 1000,
            },
          });

      let data: Order[] = res.data?.data || [];

      if (effectiveSearch) {
        const value = effectiveSearch.toLowerCase();

        data = data.filter((o) => {
          const orderIdMatch = String(o.orderId).includes(value);

          if (isAdmin) {
            const ownerMatch =
              o.owner?.name?.toLowerCase().includes(value) || false;
            return orderIdMatch || ownerMatch;
          }

          return orderIdMatch;
        });
      }

      if (statusFilter !== "ALL") {
        data = data.filter((o) => o.status === statusFilter);
      }

      setTotal(data.length);
      setOrders(
        data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      );
    } catch (err) {
      console.error("FETCH ORDERS ERROR:", err);
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, effectiveSearch, statusFilter, role]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new-order", (payload: NewOrderPayload) => {
      setNewOrder(payload);
      setOpenNewOrderDialog(true);
      lastRequestRef.current = "";
      fetchOrders();
    });

    return () => {
      socket.off("new-order");
    };
  }, []);

  const updateStatus = async (
    orderId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      if (newOrder?.id === orderId) {
        setUpdatingDialogStatus(true);
      }
      await API.put(`/orders/${orderId}/status`, { status });
      lastRequestRef.current = "";
      if (newOrder?.id === orderId) {
        setOpenNewOrderDialog(false);
        setNewOrder(null);
      }
      fetchOrders();
    } catch (error) {
      console.error("UPDATE STATUS ERROR:", error);
    } finally {
      setUpdatingDialogStatus(false);
    }
  };

  return (
    <>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Header toggleTheme={toggleTheme} mode={mode} />
      </Box>

      <Box
        sx={{
          mt: `${HEADER_HEIGHT}px`,
          mb: `${FOOTER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
          p: { xs: 1.5, sm: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {isAdmin ? "All Orders" : "My Orders"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "stretch", md: "flex-end" },
              }}
            >
              <TextField
                size="small"
                placeholder={
                  isAdmin ? "Search by order ID or owner" : "Search by order ID"
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 280 } }}
              />

              <TextField
                size="small"
                select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                sx={{ minWidth: { xs: "100%", sm: 140 } }}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="ACCEPTED">Accepted</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: isAdmin ? 1100 : 980 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Order ID</b></TableCell>
                    {isAdmin && <TableCell><b>Owner</b></TableCell>}
                    <TableCell><b>Customer</b></TableCell>
                    <TableCell><b>Status</b></TableCell>
                    <TableCell><b>Summary</b></TableCell>
                    <TableCell><b>Placed At</b></TableCell>
                    <TableCell align="center"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o) => (
                      <TableRow key={o.id} hover>
                        <TableCell>{o.orderId}</TableCell>
                        {isAdmin && <TableCell>{o.owner?.name || "-"}</TableCell>}
                        <TableCell>{o.customerId}</TableCell>
                        <TableCell>{o.status}</TableCell>
                        <TableCell>{o.summary || "-"}</TableCell>
                        <TableCell>
                          {new Date(o.createdAt)
                            .toLocaleString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .replace(",", " |")
                            .replace("am", "AM")
                            .replace("pm", "PM")}
                        </TableCell>
                        <TableCell align="center">
                          {canManageOrders && o.status === "PENDING" && (
                            <>
                              <Tooltip title="Accept">
                                <IconButton
                                  color="success"
                                  onClick={() => updateStatus(o.id, "ACCEPTED")}
                                >
                                  <CheckCircleOutline />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reject">
                                <IconButton
                                  color="error"
                                  onClick={() => updateStatus(o.id, "REJECTED")}
                                >
                                  <CancelOutlined />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}

                          <Tooltip
                            title={
                              o.status === "PENDING"
                                ? "Available after decision"
                                : "View"
                            }
                          >
                            <span>
                              <IconButton
                                disabled={o.status === "PENDING"}
                                onClick={() => navigate(`/orders/view/${o.id}`)}
                              >
                                <VisibilityOutlined />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, n) => setPage(n)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              ".MuiTablePagination-toolbar": {
                flexWrap: "wrap",
                justifyContent: "center",
                rowGap: 1,
                px: { xs: 1, sm: 2 },
              },
            }}
          />
        </Paper>
      </Box>

      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </Box>

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
                sx={{
                  borderRadius: 2,
                  borderColor: "divider",
                }}
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
                      <TableCell
                        colSpan={3}
                        align="right"
                        sx={{ fontWeight: 700, borderBottom: 0 }}
                      >
                        Grand Total
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, borderBottom: 0 }}
                      >
                        {formatCurrency(newOrder.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {newOrder.summary ? (
                <>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    Summary: {newOrder.summary}
                  </Typography>
                </>
              ) : null}

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
            onClick={() => newOrder && updateStatus(newOrder.id, "REJECTED")}
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
            onClick={() => newOrder && updateStatus(newOrder.id, "ACCEPTED")}
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

export default OrdersList;