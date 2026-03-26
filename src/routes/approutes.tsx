// import { Routes, Route, Navigate } from "react-router-dom";

// import Login from "../app/auth/login";
// import ForgotPassword from "../app/auth/forgotpassword";
// import ResetPassword from "../app/auth/resetpassword";
// import Dashboard from "../app/dashboard/dashboard";
// import Users from "../app/users/users-list";
// import UserForm from "../app/users/user-add-edit";
// import ChangePassword from "../app/settings/changepassword";
// import Profile from "../app/settings/profile";

// import ProductsList from "../app/products/product-list";
// import ProductForm from "../app/products/product-add-edit";


// import OrdersList from "../app/orders/order-list";
// import OrderDetails from "../app/orders/order-details";

// import CustomersList from "../app/customers/customer-list";

// import ProtectedRoutes from "./protectedroutes";
// import PublicRoutes from "./publicroutes";
// import Unauthorized from "../unauthorized/unauthorized";

// interface Props {
//   toggleTheme: () => void;
//   mode: "light" | "dark";
// }

// const AppRoutes = ({ toggleTheme, mode }: Props) => {
//   return (
//     <Routes>
//       {/* ---------- PUBLIC ROUTES ---------- */}
//       <Route element={<PublicRoutes />}>
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/forgot-password/init" element={<ForgotPassword />} />
//         <Route path="/forgot-password/finish" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//       </Route>

//       {/* ---------- PROTECTED ROUTES ---------- */}
//       <Route element={<ProtectedRoutes />}>
//         <Route
//           path="/dashboard"
//           element={<Dashboard toggleTheme={toggleTheme} mode={mode} />}
//         />

//         <Route
//           path="/users"
//           element={<Users toggleTheme={toggleTheme} mode={mode} />}
//         />

//         {/*  ADD / EDIT USER (SAME PAGE) */}
//         <Route
//           path="/users/add"
//           element={<UserForm toggleTheme={toggleTheme} mode={mode} />}
//         />
//         <Route path="/users/edit/:id"
//           element={<UserForm toggleTheme={toggleTheme} mode={mode} />} />



//         <Route
//           path="/setting/profile"
//           element={<Profile toggleTheme={toggleTheme} mode={mode} />}
//         />

//         <Route
//           path="/setting/change-password"
//           element={<ChangePassword toggleTheme={toggleTheme} mode={mode} />}
//         />


//         <Route
//           path="/products"
//           element={<ProductsList toggleTheme={toggleTheme} mode={mode} />}
//         />
//         <Route path="/products/add" element={<ProductForm toggleTheme={toggleTheme} mode={mode} />} />
//         <Route path="/products/edit/:id" element={<ProductForm toggleTheme={toggleTheme} mode={mode} />} />

//         <Route path="/orders" element={<OrdersList toggleTheme={toggleTheme} mode={mode} />} />
//         <Route path="/orders/view/:id" element={<OrderDetails toggleTheme={toggleTheme} mode={mode} />} />

//         <Route
//           path="/customers"
//           element={<CustomersList toggleTheme={toggleTheme} mode={mode} />}
//         />

//       </Route>



//       {/* ---------- FALLBACK ---------- */}
//       <Route path="*" element={<Unauthorized />} />
//     </Routes>
//   );
// };

// export default AppRoutes;

import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Login from "../app/auth/login";
import ForgotPassword from "../app/auth/forgotpassword";
import ResetPassword from "../app/auth/resetpassword";
import Dashboard from "../app/dashboard/dashboard";
import Users from "../app/users/users-list";
import UserForm from "../app/users/user-add-edit";
import ChangePassword from "../app/settings/changepassword";
import Profile from "../app/settings/profile";

import ProductsList from "../app/products/product-list";
import ProductForm from "../app/products/product-add-edit";

import OrdersList from "../app/orders/order-list";
import OrderDetails from "../app/orders/order-details";

import CustomersList from "../app/customers/customer-list";

import ProtectedRoutes from "./protectedroutes";
import PublicRoutes from "./publicroutes";
import RoleGuard from "./roleguard";
import Unauthorized from "../unauthorized/unauthorized";

interface Props {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

const AppRoutes = ({ toggleTheme, mode }: Props) => {
  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route element={<PublicRoutes />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password/init" element={<ForgotPassword />} />
        <Route path="/forgot-password/finish" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ---------- PROTECTED ROUTES ---------- */}
      <Route element={<ProtectedRoutes />}>
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard toggleTheme={toggleTheme} mode={mode} />}
        />

        {/* ---------- ROLE PROTECTED : USERS ---------- */}
        <Route
          element={
            <RoleGuard allowedRoles={["ADMIN", "SUPER ADMIN"]}>
              <Outlet />
            </RoleGuard>
          } 
        >
          <Route
            path="/users"
            element={<Users toggleTheme={toggleTheme} mode={mode} />}
          />
          <Route
            path="/users/add"
            element={<UserForm toggleTheme={toggleTheme} mode={mode} />}
          />
          <Route
            path="/users/edit/:id"
            element={<UserForm toggleTheme={toggleTheme} mode={mode} />}
          />
        </Route>

        {/* ---------- SETTINGS ---------- */}
        <Route
          path="/setting/profile"
          element={<Profile toggleTheme={toggleTheme} mode={mode} />}
        />
        <Route
          path="/setting/change-password"
          element={<ChangePassword toggleTheme={toggleTheme} mode={mode} />}
        />

        {/* ---------- PRODUCTS ---------- */}
        <Route
          path="/products"
          element={<ProductsList toggleTheme={toggleTheme} mode={mode} />}
        />
        <Route
          path="/products/add"
          element={<ProductForm toggleTheme={toggleTheme} mode={mode} />}
        />
        <Route
          path="/products/edit/:id"
          element={<ProductForm toggleTheme={toggleTheme} mode={mode} />}
        />

        {/* ---------- ORDERS ---------- */}
        <Route
          path="/orders"
          element={<OrdersList toggleTheme={toggleTheme} mode={mode} />}
        />
        <Route
          path="/orders/view/:id"
          element={<OrderDetails toggleTheme={toggleTheme} mode={mode} />}
        />

        {/* ---------- CUSTOMERS ---------- */}
        <Route
          path="/customers"
          element={<CustomersList toggleTheme={toggleTheme} mode={mode} />}
        />
      </Route>

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<Unauthorized />} />
    </Routes>
  );
};

export default AppRoutes;
