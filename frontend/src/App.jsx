
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
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ProductList from './pages/admin/ProductList';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import OrderDetails from './pages/admin/OrderDetails';
import OrderDetail from './pages/admin/OrderDetail';
import Customers from './pages/admin/Customers';
import Categories from './pages/Categories';

function App() {
  return (
    <>
      <Routes>

        {/* site routes — shared Navbar/Footer via UserLayout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
           <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/categories" element={<Categories />} />
        </Route>

        {/* auth routes — each page ships its own header, not the site UserLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* admin login route */}
        <Route path="/admin/login" element={<AdminLogin/>}/>

        {/* admin routes */}

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

         </Route>
     </Route>

        {/* error routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />
      </Routes>
    </>
  )
}

export default App