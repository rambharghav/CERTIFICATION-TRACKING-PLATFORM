import { axiosInstance } from "./axiosInstance";

export const adminApi = {
  // Fetch all users (Admins + Students)
  getAllUsers: async () => {
    const res = await axiosInstance.get("/users");
    return res.data;
  },

  // Fetch all students (Optional if needed explicitly)
  getAllStudents: async () => {
    const res = await axiosInstance.get("/users/students");
    return res.data;
  },

  // Fetch all certifications for Admin
  getAllCertifications: async () => {
    const res = await axiosInstance.get("/certifications/all");
    return res.data;
  },

  // Update renewal status of a certification
  updateRenewalStatus: async (certId, status) => {
    const res = await axiosInstance.put(`/certifications/${certId}/renewal?status=${status}`);
    return res.data;
  },

  // Send a reminder for an expiring certification
  sendReminder: async (certId) => {
    const res = await axiosInstance.put(`/certifications/${certId}/remind`);
    return res.data;
  },

  // Add a new student (using the auth register endpoint, admin perspective)
  addStudent: async (studentData) => {
    // We send payload to the auth register since it bypasses need for an admin specific user creation in the current backend
    const res = await axiosInstance.post("/auth/register", studentData);
    return res.data;
  }
};
