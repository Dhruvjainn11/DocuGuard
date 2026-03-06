// src/store/useAuthStore.js
import { create } from 'zustand';
import api from '../utils/axios';

// "create" makes our global hook. 
// "set" is the function Zustand gives us to update the cloud's memory.
export const useAuthStore = create((set) => ({
  // 1. The State (The Data)
  user: null, 
  isAuthenticated: false,
  isCheckingAuth: true, // We start true because when the app loads, we don't know if they have a cookie yet!
  documentUploaded: 0, // Add a counter to trigger refetches

  // 2. The Actions (The Functions that change the data)
  notifyUpload: () => set(state => ({ documentUploaded: state.documentUploaded + 1 })), // The function to call after an upload

  checkAuth: async () => {
    try {
      // We ask the backend: "Hey, does this browser have a valid cookie?"
      const response = await api.get('/user/profile'); 
      
      // If yes, we update the cloud!
      set({ 
        user: response.data.data, 
        isAuthenticated: true, 
        isCheckingAuth: false 
      });
    } catch (error) {
      // If no (or expired), we clear the cloud.
      set({ 
        user: null, 
        isAuthenticated: false, 
        isCheckingAuth: false 
      });
    }
  },

  login: async (email, password) => {
    try {
      // Send the request to your Node.js backend
      const response = await api.post('/auth/login', { email, password });
      
      // If successful, update the global state
      set({ 
        user: response.data.data, 
        isAuthenticated: true 
      });
      
      return { success: true }; // Tell the UI it worked
    } catch (error) {
      // Tell the UI it failed and pass the error message from the backend
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      set({ 
        user: response.data.data, 
        isAuthenticated: true 
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  logout: async () => {
    try {
      // Tell the backend to destroy the HttpOnly cookie
      await api.post('/auth/logout'); 
      
      // Wipe the user from the React global memory
      set({ 
        user: null, 
        isAuthenticated: false 
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
  },

}));