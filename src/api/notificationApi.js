import { axiosInstance } from "./axiosInstance";

export const notificationApi = {
  // ✅ GET ALL NOTIFICATIONS (PAGED)
  getNotifications: async (page = 0, size = 10) => {
    try {
      const response = await axiosInstance.get(`/student/notifications?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student notifications", error);
      throw error;
    }
  },

  // ✅ GET ONLY UNREAD COUNT (LIGHTWEIGHT)
  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get("/student/notifications/unread-count");
      return response.data; // Returns Long count
    } catch (error) {
      console.error("Error fetching unread count", error);
      throw error;
    }
  }
};
