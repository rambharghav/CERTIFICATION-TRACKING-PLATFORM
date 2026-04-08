import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("ProtectedRoute User →", user);

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role mismatch
  const role = typeof user.role === "string" ? user.role.toLowerCase() : "";
  if (role !== allowedRole.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allow access
  return children;
}

export default ProtectedRoute;