// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   IconButton,
//   TextField,
//   Button,
//   TablePagination,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   CircularProgress,
//   Snackbar,
//   Alert,
//   InputAdornment,
// } from "@mui/material";
// import { Edit, Delete, Search, Add } from "@mui/icons-material";
// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import Header from "../../modules/layout/header";
// import Footer from "../../modules/layout/footer";
// import API from "../../services/api/axios";

// const HEADER_HEIGHT = 48;
// const FOOTER_HEIGHT = 48;

// /* ================= TYPES ================= */

// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   quantity: number;
//   unit: string;
//   ownerName?: string;
// }

// interface BackendProduct {
//   id?: any;
//   _id?: any;
//   name: string;
//   description: string;
//   price: number;
//   quantity: number;
//   unit?: string | {
//     name: string;
//     displayName?: string;
//   };
//   owner?: { name?: string };
// }

// interface Props {
//   toggleTheme: () => void;
//   mode: "light" | "dark";
// }

// /* ================= COMPONENT ================= */

// const ProductsList = ({ toggleTheme, mode }: Props) => {
//   const navigate = useNavigate();

//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const ownerId = user?.id;
//   const role = user?.role;

//   const [products, setProducts] = useState<Product[]>([]);
//   const [search, setSearch] = useState("");
//   const [effectiveSearch, setEffectiveSearch] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const [openDelete, setOpenDelete] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

//   const [toast, setToast] = useState({
//     open: false,
//     message: "",
//     severity: "success" as "success" | "error",
//   });

//   const lastRequestRef = useRef("");

//   const isAdmin = role === "ADMIN" || role === "SUPER ADMIN";


//   /* ================= SEARCH ================= */

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setPage(0);
//       setEffectiveSearch(search.length >= 3 ? search : "");
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [search]);

//   /* ================= FETCH PRODUCTS ================= */

//   const fetchProducts = async () => {
//     if (!role) return;

//     const key = `${role}-${ownerId}-${page}-${rowsPerPage}-${effectiveSearch}`;
//     if (lastRequestRef.current === key) return;
//     lastRequestRef.current = key;

//     try {
//       setLoading(true);


//       const url = isAdmin
//         ? "/products"
//         : `/products/owner/${ownerId}`;

//       const res = await API.get(url, {
//         params: {
//           page: page + 1,
//           limit: rowsPerPage,
//           search: effectiveSearch,
//         },
//       });

//       const list: BackendProduct[] = Array.isArray(res.data?.data)
//         ? res.data.data
//         : [];

//       setTotal(res.data?.total || 0);

//       setProducts(
//         list.map((item) => ({
//           id: String(item.id || item._id),
//           name: item.name,
//           description: item.description,
//           price: item.price,
//           quantity: item.quantity,
//           unit:
//             typeof item.unit === "string"
//               ? item.unit
//               : item.unit?.displayName || item.unit?.name || "-",
//           ownerName: isAdmin ? item.owner?.name || "-" : undefined,
//         }))
//       );
//     } catch (error) {
//       console.error("FETCH PRODUCTS ERROR:", error);
//       setProducts([]);
//       setTotal(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [role, ownerId, page, rowsPerPage, effectiveSearch]);

//   /* ================= DELETE ================= */

//   const handleDeleteConfirm = async () => {
//     if (!selectedProduct) return;

//     try {
//       await API.delete(`/products/${selectedProduct.id}`);
//       setToast({
//         open: true,
//         message: "Product deleted successfully",
//         severity: "success",
//       });
//       setOpenDelete(false);
//       setSelectedProduct(null);
//       lastRequestRef.current = "";
//       fetchProducts();
//     } catch {
//       setToast({
//         open: true,
//         message: "Delete failed",
//         severity: "error",
//       });
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <>
//       {/* HEADER */}
//       <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
//         <Header toggleTheme={toggleTheme} mode={mode} />
//       </Box>

//       {/* CONTENT */}
//       <Box
//         sx={{
//           mt: `${HEADER_HEIGHT}px`,
//           mb: `${FOOTER_HEIGHT}px`,
//           height: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
//           p: 3,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Paper
//           elevation={3}
//           sx={{
//             width: "100%",
//             height: "100%",
//             display: "flex",
//             flexDirection: "column",
//             overflow: "hidden",
//           }}
//         >
//           <Box display="flex" justifyContent="space-between" p={2}>
//             <Typography variant="h5" fontWeight="bold">
//               Products
//             </Typography>

//             <Box display="flex" gap={2}>
//               <TextField
//                 size="small"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder={
//                   isAdmin
//                     ? "Search by name, owner, or unit"
//                     : "Search by name or unit"
//                 }
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <Search fontSize="small" />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//               <Button
//                 variant="contained"
//                 startIcon={<Add />}
//                 onClick={() => navigate("/products/add")}
//               >
//                 Add Product
//               </Button>
//             </Box>
//           </Box>

//           <Box sx={{ flex: 1, overflowY: "auto" }}>
//             <TableContainer>
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell><b>Name</b></TableCell>
//                     {(role === "ADMIN" || role === "SUPER ADMIN") && (
//                       <TableCell><b>Owner</b></TableCell>
//                     )}
//                     <TableCell><b>Description</b></TableCell>
//                     <TableCell><b>Price</b></TableCell>
//                     <TableCell><b>Quantity</b></TableCell>
//                     <TableCell><b>Unit</b></TableCell>
//                     <TableCell align="center"><b>Actions</b></TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {loading ? (
//                     <TableRow>
//                       <TableCell colSpan={7} align="center">
//                         <CircularProgress size={24} />
//                       </TableCell>
//                     </TableRow>
//                   ) : products.length === 0 ? (
//                     <TableRow>
//                       <TableCell colSpan={7} align="center">
//                         No products found
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     products.map((product) => (
//                       <TableRow key={product.id}>
//                         <TableCell>{product.name}</TableCell>
//                         {(role === "ADMIN" || role === "SUPER ADMIN") && (
//                           <TableCell>{product.ownerName || "-"}</TableCell>
//                         )}
//                         <TableCell>{product.description}</TableCell>
//                         <TableCell>{product.price}</TableCell>
//                         <TableCell>{product.quantity}</TableCell>
//                         <TableCell>{product.unit}</TableCell>
//                         <TableCell align="center">
//                           <IconButton
//                             size="small"
//                             onClick={() =>
//                               navigate(`/products/edit/${product.id}`)
//                             }
//                           >
//                             <Edit fontSize="small" />
//                           </IconButton>
//                           <IconButton
//                             size="small"
//                             color="error"
//                             onClick={() => {
//                               setSelectedProduct(product);
//                               setOpenDelete(true);
//                             }}
//                           >
//                             <Delete fontSize="small" />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Box>

//           <TablePagination
//             component="div"
//             count={total}
//             page={page}
//             rowsPerPage={rowsPerPage}
//             onPageChange={(_, n) => setPage(n)}
//             onRowsPerPageChange={(e) => {
//               setRowsPerPage(parseInt(e.target.value, 10));
//               setPage(0);
//             }}
//             rowsPerPageOptions={[5, 10, 25, 50]}
//           />
//         </Paper>
//       </Box>

//       <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
//         <Footer />
//       </Box>

//       <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           Are you sure you want to delete this product?
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
//           <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={toast.open}
//         autoHideDuration={3000}
//         onClose={() => setToast((p) => ({ ...p, open: false }))}
//       >
//         <Alert severity={toast.severity} variant="filled">
//           {toast.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default ProductsList;


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
import { Edit, Delete, Search, Add } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";

const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 48;

/* ================= TYPES ================= */

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  ownerName?: string;
}

interface BackendProduct {
  id?: any;
  _id?: any;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit?: string | {
    name: string;
    displayName?: string;
  };
  owner?: { name?: string };
}

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

/* ================= COMPONENT ================= */

const ProductsList = ({ toggleTheme, mode }: Props) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const ownerId = user?.id;
  const role = user?.role;

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [effectiveSearch, setEffectiveSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const lastRequestRef = useRef("");

  const isAdmin = role === "ADMIN" || role === "SUPER ADMIN";


  /* ================= SEARCH ================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setEffectiveSearch(search.length >= 3 ? search : "");
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = async () => {
    if (!role) return;

    const key = `${role}-${ownerId}-${page}-${rowsPerPage}-${effectiveSearch}`;
    if (lastRequestRef.current === key) return;
    lastRequestRef.current = key;

    try {
      setLoading(true);


      const url = isAdmin
        ? "/products"
        : `/products/owner/${ownerId}`;

      const res = await API.get(url, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: effectiveSearch,
        },
      });

      const list: BackendProduct[] = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setTotal(res.data?.total || 0);

      setProducts(
        list.map((item) => ({
          id: String(item.id || item._id),
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          unit:
            typeof item.unit === "string"
              ? item.unit
              : item.unit?.displayName || item.unit?.name || "-",
          ownerName: isAdmin ? item.owner?.name || "-" : undefined,
        }))
      );
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [role, ownerId, page, rowsPerPage, effectiveSearch]);

  /* ================= DELETE ================= */

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await API.delete(`/products/${selectedProduct.id}`);
      setToast({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
      setOpenDelete(false);
      setSelectedProduct(null);
      lastRequestRef.current = "";
      fetchProducts();
    } catch {
      setToast({
        open: true,
        message: "Delete failed",
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

      {/* CONTENT */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              flexWrap: "wrap",
              gap: 2,
              p: 2,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Products
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isAdmin
                    ? "Search by name, owner, or unit"
                    : "Search by name or unit"
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 300 } }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/products/add")}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Add Product
              </Button>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: isAdmin ? 1080 : 920 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Name</b></TableCell>
                    {(role === "ADMIN" || role === "SUPER ADMIN") && (
                      <TableCell><b>Owner</b></TableCell>
                    )}
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Price</b></TableCell>
                    <TableCell><b>Quantity</b></TableCell>
                    <TableCell><b>Unit</b></TableCell>
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
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No products found
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        {(role === "ADMIN" || role === "SUPER ADMIN") && (
                          <TableCell>{product.ownerName || "-"}</TableCell>
                        )}
                        <TableCell>{product.description}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/products/edit/${product.id}`)
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedProduct(product);
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

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductsList;
