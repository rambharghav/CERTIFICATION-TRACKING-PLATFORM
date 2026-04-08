import { axiosInstance } from "./axiosInstance";

export const authApi = {

  // ✅ SIGNUP → BACKEND
  signup: async (data) => {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
  },

  // ✅ LOGIN → BACKEND
  login: async (data) => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },

  // ✅ RESEND OTP → BACKEND
  resendOtp: async (email) => {
    const res = await axiosInstance.post("/auth/resend-otp", { email });
    return res.data;
  },

};