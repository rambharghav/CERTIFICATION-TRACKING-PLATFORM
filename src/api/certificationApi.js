import { axiosInstance } from "./axiosInstance";

export const certificationApi = {

  getAll: async (userId) => {
    const res = await axiosInstance.get(`/certifications/user/${userId}`);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(`/certifications/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    await axiosInstance.delete(`/certifications/${id}`);
  },

  create: async (userId, data) => {
    const res = await axiosInstance.post(`/certifications/user/${userId}`, data);
    return res.data;
  },
};