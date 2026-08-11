import { Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProfile from './pages/admin/AdminProfile';
import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';
import Navbar from './components/Navbar';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import ProductList from './pages/admin/ProductList';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderDetails from './pages/admin/OrderDetails';
import OrderDetail from './pages/admin/OrderDetail';
import Customers from './pages/admin/Customers';
import { Edit } from 'lucide-react';

function App() {


  return (
    <>
    
      <Routes>
        
   {/* user routes  */}

     <Route element={<UserLayout />}>
        <Route path="/login" element={<Login />} />
     </Route>





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
