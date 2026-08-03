import { Routes, Route } from 'react-router-dom';

import AdminLogin from './pages/admin/AdminLogin';

import UnauthorizedPage from './pages/errors/UnauthorizedPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import ServerErrorPage from './pages/errors/ServerErrorPage';

function App() {


  return (
    <>
      <Routes>

   
        <Route path="/admin/login" element={<AdminLogin/>}/>


         <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="/server-error" element={<ServerErrorPage />} />
      </Routes>
    </>
  )
}

export default App
