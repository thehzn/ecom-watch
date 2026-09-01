import { Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProfile from './pages/admin/AdminProfile';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ProductList from './pages/admin/ProductList';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import OrderDetails from './pages/admin/OrderDetails';
import OrderDetail from './pages/admin/OrderDetail';
import Customers from './pages/admin/Customers';
import Categories from './pages/Categories';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import FAQ from './pages/FAQ';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';
import MyAccount from './pages/MyAccount';
import MyOrders from './pages/MyOrders';
import ForgotPassword from './pages/ForgotPassword';
import Security from './pages/Security';
import EditProfile from './pages/EditProfile';
import Enquiry from './pages/Enquiry';
import AdminForgotPassword from './pages/admin/Adminforgotpassword';
import AdminNotifications from './pages/admin/AdminNotifications';

function App() {
  return (
    <>
      <Routes>
        {/* site routes — shared Navbar/Footer via UserLayout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/enquiry" element={<Enquiry />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmed" element={<OrderConfirmed />} />
          <Route path="/myaccount" element={<MyAccount />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/security" element={<Security />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Route>

        {/* auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* admin login route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-request" element={<AdminForgotPassword />} />

        {/* admin protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="add" element={<AddProduct />} />
            <Route path="edit/:id" element={<EditProduct />} />
            <Route path="products" element={<ProductList />} />
            <Route path="orders" element={<OrderDetails />} />
            <Route path="order/:id" element={<OrderDetail />} />
            <Route path="users" element={<Customers />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Route>

        {/* error routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
