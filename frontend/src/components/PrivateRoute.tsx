import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

const PrivateRoute: React.FC = () => {
  return authService.isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
