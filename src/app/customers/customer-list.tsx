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
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useEffect, useRef, useState } from "react";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";
import { useAuth } from "../../context/authcontext";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastOrderAt: string;
  shopOwnerName: string;
}

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;
const PAGE_PADDING = 24;

const CustomersList = ({ toggleTheme, mode }: any) => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [effectiveSearch, setEffectiveSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const lastRequestRef = useRef("");

  const role = user?.role?.toString().toLowerCase();
  const isAdmin = role?.includes("admin") || role?.includes("super");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setEffectiveSearch(search.trim().length >= 3 ? search.trim() : "");
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchCustomers = async () => {
    if (!user) return;

    const key = `${page}-${rowsPerPage}-${effectiveSearch}-${user.id}-${role}`;
    if (lastRequestRef.current === key) return;
    lastRequestRef.current = key;

    try {
      setLoading(true);

      const url = isAdmin ? "/customers" : `/customers/shop/${user.id}`;
      const res = await API.get(url, {
        params: {
          page: 1,
          limit: 1000,
        },
      });

      let data: Customer[] = (res.data.data || []).map((c: any) => ({
        id: c.id || c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        lastOrderAt: c.lastOrderOn?.createdAt || null,
        shopOwnerName: c.shopOwner?.name || "-",
      }));

      if (effectiveSearch) {
        const value = effectiveSearch.toLowerCase();

        data = data.filter((c) => {
          const nameMatch = c.name?.toLowerCase().includes(value) || false;
          const emailMatch = c.email?.toLowerCase().includes(value) || false;
          const phoneMatch = c.phone?.toLowerCase().includes(value) || false;
          const ownerMatch = isAdmin
            ? c.shopOwnerName?.toLowerCase().includes(value) || false
            : false;

          return nameMatch || emailMatch || phoneMatch || ownerMatch;
        });
      }

      setTotal(data.length);
      setCustomers(
        data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      );
    } catch (error) {
      console.error("FETCH CUSTOMERS ERROR:", error);
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, effectiveSearch, isAdmin]);

  if (!isAdmin && !user) {
    return (
      <>
        <Header toggleTheme={toggleTheme} mode={mode} />
        <Box
          sx={{
            minHeight: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
            mt: `${HEADER_HEIGHT}px`,
            mb: `${FOOTER_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="error" fontWeight="bold">
            Access Denied
          </Typography>
        </Box>
        <Footer />
      </>
    );
  }

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
          px: { xs: 1.5, sm: 2, md: `${PAGE_PADDING}px` },
          py: { xs: 1.5, sm: 2, md: `${PAGE_PADDING}px` },
          backgroundColor: mode === "dark" ? "#121212" : "#f4f6f8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
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
              Customers
            </Typography>

            <TextField
              size="small"
              placeholder={
                isAdmin
                  ? "Search by name, email, phone, or shop owner"
                  : "Search by name, email, or phone"
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
              sx={{ width: { xs: "100%", sm: 300 } }}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Name</b></TableCell>
                    <TableCell><b>Email</b></TableCell>
                    <TableCell><b>Phone</b></TableCell>
                    <TableCell><b>Last Order On</b></TableCell>
                    <TableCell><b>Shop Owner</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c) => (
                      <TableRow key={c.id} hover>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell>
                          {new Date(c.lastOrderAt)
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
                        <TableCell>{c.shopOwnerName}</TableCell>
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
            onPageChange={(_, p) => setPage(p)}
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

      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </Box>
    </>
  );
};

export default CustomersList;
