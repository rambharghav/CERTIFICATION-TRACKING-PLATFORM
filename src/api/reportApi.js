import { axiosInstance } from "./axiosInstance";

export const reportApi = {
  // Fetch certifications specifically formatted for Reports or dashboards
  getUserReports: async (userId) => {
    const res = await axiosInstance.get(`/certifications/user/${userId}`);
    return res.data;
  },
  
  // Dashboard stats if needed via backend
  getDashboardStats: async (userId) => {
    const res = await axiosInstance.get(`/certifications/stats/${userId}`);
    return res.data;
  }
};
