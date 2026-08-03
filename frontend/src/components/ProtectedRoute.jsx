function ProtectedRoute({ children, allowedRoles }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}