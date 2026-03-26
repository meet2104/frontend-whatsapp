// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   Snackbar,
//   Alert,
//   MenuItem,
//   Divider,
// } from "@mui/material";
// import { useEffect, useState, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import Header from "../../modules/layout/header";
// import Footer from "../../modules/layout/footer";
// import API from "../../services/api/axios";

// const HEADER_HEIGHT = 64;
// const FOOTER_HEIGHT = 64;

// /* ================= TYPES ================= */

// interface ProductFormData {
//   productName: string;
//   description: string;
//   price: string;
//   quantity: string;
//   unitId: string;
// }

// interface Unit {
//   _id: string;
//   name: string;
// }

// const emptyForm: ProductFormData = {
//   productName: "",
//   description: "",
//   price: "",
//   quantity: "",
//   unitId: "",
// };

// interface Props {
//   toggleTheme: () => void;
//   mode: "light" | "dark";
// }

// /* ================= COMPONENT ================= */

// const ProductForm = ({ toggleTheme, mode }: Props) => {
//   const navigate = useNavigate();
//   const { id: productId } = useParams();
//   const isEdit = Boolean(productId);

//   const [form, setForm] = useState<ProductFormData>(emptyForm);
//   const [units, setUnits] = useState<Unit[]>([]);
//   const [loading, setLoading] = useState(false);

//   const unitsFetchedRef = useRef(false);
//   const productFetchedRef = useRef(false);

//   const [toast, setToast] = useState({
//     open: false,
//     message: "",
//     severity: "success" as "success" | "error",
//   });

//   // logged-in user
//   const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
//   const ownerId =
//     storedUser?.id || storedUser?.userId || storedUser?._id;

//   /* ================= FETCH UNITS ================= */
//   useEffect(() => {
//     if (unitsFetchedRef.current) return;
//     unitsFetchedRef.current = true;

//     const fetchUnits = async () => {
//       try {
//         const res = await API.get("/units");
//         setUnits(res.data.data || []);
//       } catch {
//         setToast({
//           open: true,
//           message: "Failed to load units",
//           severity: "error",
//         });
//       }
//     };

//     fetchUnits();
//   }, []);

//   /* ================= FETCH PRODUCT (EDIT MODE) ================= */
//   useEffect(() => {
//     if (!isEdit || !productId || productFetchedRef.current) return;
//     productFetchedRef.current = true;

//     const loadProduct = async () => {
//       try {
//         const res = await API.get(`/products/${productId}`);
//         const p = res.data.data;

//         setForm({
//           productName: p.name || "",
//           description: p.description || "",
//           price: String(p.price || ""),
//           quantity: String(p.quantity || ""),
//           unitId: p.unit?._id || "",
//         });
//       } catch {
//         setToast({
//           open: true,
//           message: "Failed to load product details",
//           severity: "error",
//         });
//       }
//     };

//     loadProduct();
//   }, [isEdit, productId]);

//   /* ================= HANDLERS ================= */

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     if ((name === "price" || name === "quantity") && !/^\d*$/.test(value)) {
//       return;
//     }

//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   /* ================= VALIDATION ================= */

//   const isFormValid =
//     form.productName.trim() &&
//     form.description.trim() &&
//     form.price &&
//     form.quantity &&
//     form.unitId;

//   /* ================= SUBMIT ================= */

//   const handleSubmit = async () => {
//     if (!isFormValid) return;

//     setLoading(true);

//     const payload = {
//       name: form.productName,
//       description: form.description,
//       price: Number(form.price),
//       quantity: Number(form.quantity),
//       unit: form.unitId,
//       ownerId,
//     };

//     try {
//       if (isEdit && productId) {
//         await API.put(`/products/${productId}`, payload);
//         setToast({
//           open: true,
//           message: "Product updated successfully",
//           severity: "success",
//         });
//       } else {
//         await API.post("/products", payload);
//         setToast({
//           open: true,
//           message: "Product added successfully",
//           severity: "success",
//         });
//       }

//       setTimeout(() => navigate("/products"), 1200);
//     } catch (err: any) {
//       setToast({
//         open: true,
//         message:
//           err.response?.data?.message || "Product save failed",
//         severity: "error",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box height="100vh" bgcolor={mode === "dark" ? "#121212" : "#f4f6f8"}>
//       {/* HEADER */}
//       <Box sx={{ position: "fixed", top: 0, left: 0, right: 0 }}>
//         <Header toggleTheme={toggleTheme} mode={mode} />
//       </Box>

//       {/* CENTER AREA */}
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
//         {/* PAPER */}
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
//           {/* 🔒 FIXED TITLE */}
//           <Box px={4} py={2}>
//             <Typography fontWeight="bold" fontSize={20}>
//               {isEdit ? "Edit Product" : "Add Product"}
//             </Typography>
//           </Box>

//           <Divider />

//           {/* ✅ SCROLLABLE CONTENT (buttons INCLUDED) */}
//           <Box
//             sx={{
//               flex: 1,
//               overflowY: "auto",
//               px: 4,
//               py: 4,
//             }}
//           >
//             <TextField
//               fullWidth
//               label="Product Name"
//               name="productName"
//               value={form.productName}
//               onChange={handleChange}
//               sx={{ mb: 3 }}
//             />

//             <TextField
//               fullWidth
//               label="Description"
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               multiline
//               rows={2}
//               sx={{ mb: 3 }}
//             />

//             <TextField
//               fullWidth
//               label="Price"
//               name="price"
//               value={form.price}
//               onChange={handleChange}
//               sx={{ mb: 3 }}
//             />

//             <TextField
//               fullWidth
//               label="Quantity"
//               name="quantity"
//               value={form.quantity}
//               onChange={handleChange}
//               sx={{ mb: 3 }}
//             />

//             <TextField
//               select
//               fullWidth
//               label="Unit"
//               value={form.unitId}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, unitId: e.target.value }))
//               }
//               sx={{ mb: 3 }}
//             >
//               {units.map((u) => (
//                 <MenuItem key={u._id} value={u._id}>
//                   {u.name}
//                 </MenuItem>
//               ))}
//             </TextField>

//             {/* ✅ BUTTONS SCROLL (SAME AS USER FORM) */}
//             <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
//               <Button variant="outlined" onClick={() => navigate("/products")}>
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 onClick={handleSubmit}
//                 disabled={!isFormValid || loading}
//               >
//                 {isEdit ? "Update Product" : "Save Product"}
//               </Button>
//             </Box>
//           </Box>
//         </Paper>
//       </Box>

//       {/* FOOTER */}
//       <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
//         <Footer />
//       </Box>

//       {/* TOAST */}
//       <Snackbar
//         open={toast.open}
//         autoHideDuration={3000}
//         onClose={() => setToast((p) => ({ ...p, open: false }))}
//         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//       >
//         <Alert severity={toast.severity} variant="filled">
//           {toast.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default ProductForm;


import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
  Divider,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../modules/layout/header";
import Footer from "../../modules/layout/footer";
import API from "../../services/api/axios";

const HEADER_HEIGHT = 64;
const FOOTER_HEIGHT = 64;

/* ================= TYPES ================= */

interface ProductFormData {
  productName: string;
  description: string;
  price: string;
  quantity: string;
  unitId: string;
}

interface Unit {
  _id: string;
  name: string;
}

interface ShopOwner {
  id: string;
  firstName: string;
  lastName: string;
  companayName?: string;
}

const emptyForm: ProductFormData = {
  productName: "",
  description: "",
  price: "",
  quantity: "",
  unitId: "",
};

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

/* ================= COMPONENT ================= */

const ProductForm = ({ toggleTheme, mode }: Props) => {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [units, setUnits] = useState<Unit[]>([]);
  const [shopOwners, setShopOwners] = useState<ShopOwner[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [loading, setLoading] = useState(false);

  const unitsFetchedRef = useRef(false);
  const ownersFetchedRef = useRef(false);
  const productFetchedRef = useRef(false);

  const fetchedOwnerRef = useRef<string | null>(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  /* ================= USER & ROLE ================= */

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = storedUser?.role;

  const isAdminOrSuperAdmin =
    role === "ADMIN" || role === "SUPER ADMIN";

  /* ================= FETCH SHOP OWNERS ================= */

  useEffect(() => {
    if (!isAdminOrSuperAdmin || ownersFetchedRef.current) return;
    ownersFetchedRef.current = true;

    const fetchShopOwners = async () => {
      try {
        const res = await API.get("/users/shop-owners");
        setShopOwners(res.data.data || []);
      } catch {
        setToast({
          open: true,
          message: "Failed to load shop owners",
          severity: "error",
        });
      }
    };

    fetchShopOwners();
  }, [isAdminOrSuperAdmin]);

  /* ================= FETCH UNITS ================= */

  useEffect(() => {
    if (unitsFetchedRef.current) return;
    unitsFetchedRef.current = true;

    const fetchUnits = async () => {
      try {
        const res = await API.get("/units");
        setUnits(res.data.data || []);
      } catch {
        setToast({
          open: true,
          message: "Failed to load units",
          severity: "error",
        });
      }
    };

    fetchUnits();
  }, []);

  /* ================= FETCH PRODUCT (EDIT MODE) ================= */

  useEffect(() => {
    if (!isEdit || !productId || productFetchedRef.current) return;
    productFetchedRef.current = true;

    const loadProduct = async () => {
      try {
        const res = await API.get(`/products/${productId}`);
        const p = res.data.data;

        setForm({
          productName: p.name || "",
          description: p.description || "",
          price: String(p.price || ""),
          quantity: String(p.quantity || ""),
          unitId: p.unit?._id || "",
        });

        // ✅ ownerId comes from backend
        if (isAdminOrSuperAdmin && p.ownerId) {
          fetchedOwnerRef.current = p.ownerId;
        }
      } catch {
        setToast({
          open: true,
          message: "Failed to load product details",
          severity: "error",
        });
      }
    };

    loadProduct();
  }, [isEdit, productId, isAdminOrSuperAdmin]);

  /* ================= APPLY OWNER AFTER OWNERS LOAD ================= */

  useEffect(() => {
    if (
      isAdminOrSuperAdmin &&
      fetchedOwnerRef.current &&
      shopOwners.length > 0
    ) {
      const exists = shopOwners.some(
        (o) => o.id === fetchedOwnerRef.current
      );

      if (exists) {
        setSelectedOwnerId(fetchedOwnerRef.current);
      }

      fetchedOwnerRef.current = null;
    }
  }, [shopOwners, isAdminOrSuperAdmin]);

  /* ================= HANDLERS ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if ((name === "price" || name === "quantity") && !/^\d*$/.test(value)) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= VALIDATION ================= */

  const isFormValid =
    form.productName.trim() &&
    form.description.trim() &&
    form.price &&
    form.quantity &&
    form.unitId &&
    (!isAdminOrSuperAdmin || !!selectedOwnerId);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setLoading(true);

    const payload: any = {
      name: form.productName,
      description: form.description,
      price: Number(form.price),
      quantity: Number(form.quantity),
      unit: form.unitId,
    };

    // ✅ ONLY ADMIN/SUPER ADMIN SEND ownerId
    if (isAdminOrSuperAdmin) {
      payload.ownerId = selectedOwnerId;
    }

    try {
      if (isEdit && productId) {
        await API.put(`/products/${productId}`, payload);
        setToast({
          open: true,
          message: "Product updated successfully",
          severity: "success",
        });
      } else {
        await API.post("/products", payload);
        setToast({
          open: true,
          message: "Product added successfully",
          severity: "success",
        });
      }

      setTimeout(() => navigate("/products"), 1200);
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Product save failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Box height="100vh" bgcolor={mode === "dark" ? "#121212" : "#f4f6f8"}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0 }}>
        <Header toggleTheme={toggleTheme} mode={mode} />
      </Box>

      <Box
        sx={{
          position: "fixed",
          top: HEADER_HEIGHT,
          bottom: FOOTER_HEIGHT,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", xl: 1480 },
            height: { xs: "100%", sm: "90%" },
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box px={{ xs: 2, sm: 3, md: 4 }} py={2}>
            <Typography fontWeight="bold" fontSize={20}>
              {isEdit ? "Edit Product" : "Add Product"}
            </Typography>
          </Box>

          <Divider />

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {isAdminOrSuperAdmin && (
              <TextField
                select
                fullWidth
                label="Shop Owner"
                value={selectedOwnerId}
                onChange={(e) => setSelectedOwnerId(e.target.value)}
                sx={{ mb: 3 }}
                disabled={isEdit} // ✅ Disable only in edit mode
              >

                <MenuItem value="">Select Shop Owner</MenuItem>
                {shopOwners.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    {o.firstName} {o.lastName}
                    {o.companayName ? ` - ${o.companayName}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            )}

            

            <TextField
              fullWidth
              label="Product Name"
              name="productName"
              value={form.productName}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={2}
              sx={{ mb: 3 }}
            />

            
            <TextField
              fullWidth
              label="Price"
              name="price"
              value={form.price}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              sx={{ mb: 3 }}
            />

            

            <TextField
              select
              fullWidth
              label="Unit"
              value={form.unitId}
              onChange={(e) =>
                setForm((p) => ({ ...p, unitId: e.target.value }))
              }
              sx={{ mb: 3 }}
            >
              {units.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 4,
                flexWrap: "wrap",
              }}
            >
              <Button variant="outlined" onClick={() => navigate("/products")}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
              >
                {isEdit ? "Update Product" : "Save Product"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductForm;
