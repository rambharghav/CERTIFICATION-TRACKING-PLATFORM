import { useContext, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { authApi } from "../api/authApi"; // ✅ ADDED

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ✅ SIGNUP HANDLED BY BACKEND
  const signup = async (userData) => {
    try {
      const response = await authApi.signup(userData);
      const { token, user: backendUser } = response;
      if (token) {
        localStorage.setItem("token", token);
      }
      
      const formattedUser = {
        ...backendUser,
        name: backendUser?.firstName ? `${backendUser.firstName} ${backendUser.lastName}` : backendUser?.name,
      };
      
      localStorage.setItem("user", JSON.stringify(formattedUser));
      setUser(formattedUser);
      
      return { success: true, user: formattedUser };
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Signup failed";
      return { success: false, message };
    }
  };

  // ✅ LOGIN USING BACKEND
  const login = async (data) => {
    try {
      const response = await authApi.login(data);
      
      // Handle the two-stage Admin OTP flow
      if (response.otpRequired) {
        return { 
          success: true, 
          otpRequired: true,
          remainingValiditySeconds: response.remainingValiditySeconds,
          resendCooldownSeconds: response.resendCooldownSeconds
        };
      }

      const { token, user: backendUser } = response;

      if (!token || !backendUser) {
        return { success: false, message: "Invalid login response" };
      }

      localStorage.setItem("token", token);

      const formattedUser = {
        ...backendUser,
        name: backendUser.firstName && backendUser.lastName
          ? `${backendUser.firstName} ${backendUser.lastName}`
          : backendUser.name || backendUser.firstName || "User",
      };

      localStorage.setItem("user", JSON.stringify(formattedUser));
      setUser(formattedUser);

      return { success: true, user: formattedUser };

    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.message || err.response?.data || "Invalid email or password";
      return { success: false, message: typeof msg === 'string' ? msg : "Login failed" };
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await authApi.resendOtp(email);
      return { 
        success: true, 
        remainingValiditySeconds: response.remainingValiditySeconds,
        resendCooldownSeconds: response.resendCooldownSeconds
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Resend failed";
      return { success: false, message: typeof msg === 'string' ? msg : "Resend failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);