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
  IconButton,
  TextField,
  Button,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Search, PersonAdd } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

/* ================= TYPES ================= */

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  role: string;
  createdBy: string;
}

interface UsersApiResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

/* ================= COMPONENT ================= */

const Users = ({ toggleTheme, mode }: Props) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [effectiveSearch, setEffectiveSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // ✅ Track last request to prevent StrictMode duplicate
  const lastRequestRef = useRef<string>("");

  /* ================= FETCH USERS ================= */

  const fetchUsers = async () => {
    const requestKey = `${page}-${rowsPerPage}-${effectiveSearch}`;

    // 🚫 BLOCK duplicate StrictMode call
    if (lastRequestRef.current === requestKey) return;
    lastRequestRef.current = requestKey;

    try {
      setLoading(true);

      const res = await API.get<UsersApiResponse>("/users", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: effectiveSearch,
        },
      });

      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error("Fetch users failed:", error);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, effectiveSearch]);

  /* ================= DELETE ================= */

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await API.delete(`/users/${selectedUser.id}`);

      setToast({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });

      setOpenDelete(false);
      setSelectedUser(null);

      // Force refresh
      lastRequestRef.current = "";
      fetchUsers();
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Failed to delete user",
        severity: "error",
      });
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {/* HEADER */}
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <Header toggleTheme={toggleTheme} mode={mode} />
      </Box>

      {/* CONTENT AREA (BETWEEN HEADER & FOOTER) */}
      <Box
        sx={{
          mt: `${HEADER_HEIGHT}px`,
          mb: `${FOOTER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
          p: { xs: 1.5, sm: 2, md: 3 },

          /* 🔥 ADDED — center the Paper */
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* PAPER (THIS SCROLLS, NOT THE PAGE) */}
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            height: "100%",          // 🔥 ADDED — equal top & bottom gap
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",    // 🔥 ADDED — prevent page scroll
          }}
        >
          {/* TOP BAR */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexWrap: "wrap",
              gap: 2,
              p: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Users
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
                placeholder="Search users"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  setPage(0);
                  setEffectiveSearch(value.length >= 3 ? value : "");
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 260 } }}
              />

              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate("/users/add")}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {/* TABLE SCROLL AREA */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 920 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><b>First Name</b></TableCell>
                    <TableCell><b>Last Name</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Phone</b></TableCell>
                    <TableCell><b>Role</b></TableCell>
                    <TableCell><b>Created By</b></TableCell>
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
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.mobile}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.createdBy}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/users/edit/${user.id}`)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenDelete(true);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* PAGINATION */}
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* FOOTER */}
      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </Box>

      {/* DELETE CONFIRM */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
};

export default Users;
