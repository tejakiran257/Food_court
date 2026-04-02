import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import MenuManagement from './pages/MenuManagement';
import OrdersManagement from './pages/OrdersManagement';
import UserMenu from './pages/UserMenu';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
import Marketing from './pages/Marketing';

import OwnerLayout from './components/OwnerLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Navigate to="/menu" />} />
        <Route path="/menu" element={<UserMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:id" element={<OrderStatus />} />

        {/* Owner Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <OwnerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<OwnerDashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="marketing" element={<Marketing />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
