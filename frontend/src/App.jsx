import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { DialogProvider } from "./context/DialogContext.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminShopsPage from "./pages/admin/AdminShopsPage.jsx";
import AdminShopDetailPage from "./pages/admin/AdminShopDetailPage.jsx";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import SellerLoginPage from "./pages/SellerLoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import OrderListPage from "./pages/OrderListPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RegisterShopPage from "./pages/RegisterShopPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import SellerOrderDetailPage from "./pages/SellerOrderDetailPage.jsx";
import SellerLayout from "./pages/seller/SellerLayout.jsx";
import SellerOverview from "./pages/seller/SellerOverview.jsx";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage.jsx";
import SellerProductsPage from "./pages/seller/SellerProductsPage.jsx";
import SellerCategoriesPage from "./pages/seller/SellerCategoriesPage.jsx";
import SellerInventoryPage from "./pages/seller/SellerInventoryPage.jsx";
import SellerSettingsPage from "./pages/seller/SellerSettingsPage.jsx";
import ShopLegacyRedirect from "./pages/ShopLegacyRedirect.jsx";
import ShopProductListPage from "./pages/ShopProductListPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <DialogProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/seller/login" element={<SellerLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/shops/:shopId" element={<ShopProductListPage />} />
          <Route path="/shops/:shopId/products" element={<ShopLegacyRedirect />} />
          <Route path="/shops/:shopId/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route
            path="/register-shop"
            element={
              <ProtectedRoute>
                <RegisterShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute role="SELLER">
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute role="SELLER">
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerOverview />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="orders/:id" element={<SellerOrderDetailPage />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="categories" element={<SellerCategoriesPage />} />
            <Route path="inventory" element={<SellerInventoryPage />} />
            <Route path="settings" element={<SellerSettingsPage />} />
          </Route>
          <Route
            path="/cart"
            element={
              <ProtectedRoute role="CUSTOMER">
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute role="CUSTOMER">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute role="CUSTOMER">
                <OrderListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute role="CUSTOMER">
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute role="CUSTOMER">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="PLATFORM_ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="shops" element={<AdminShopsPage />} />
            <Route path="shops/:shopId" element={<AdminShopDetailPage />} />
            <Route path="orders" element={<Navigate to="/admin" replace />} />
            <Route path="customers" element={<AdminCustomersPage />} />
          </Route>
        </Route>
      </Routes>
      </DialogProvider>
      </CartProvider>
    </AuthProvider>
  );
}
