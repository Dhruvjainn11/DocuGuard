// src/hooks/useDocuments.js
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';
import { useAuthStore } from '../store/useAuthStore'; // Import the store

export const useDocuments = (initialFilters = {}) => {
  // 1. The State (What the UI needs to display)
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the upload trigger from our global store
  const documentUploaded = useAuthStore(state => state.documentUploaded);

  // 2. The Active Filters (Page, Search, Category, Status)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    sort: '',
    status: 'active', // Default to active vault items
    ...initialFilters
  });

  // 3. The Fetch Function (Talks to our backend query builder!)
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build the query string (e.g., ?page=1&limit=10&search=Apple)
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      // Call the backend API we built
      const response = await api.get(`/document?${queryParams.toString()}`);
      
      setDocuments(response.data.data.documents);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [filters]); // Re-run this function anytime the filters change

  // 4. The Trigger (Fires automatically when the component loads, filters change, OR a new document is uploaded)
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, documentUploaded]); // Add the trigger here

  // 5. Helper functions for the UI to easily change the filters
  const setPage = (newPage) => setFilters(prev => ({ ...prev, page: newPage }));
  const setSearch = (term) => setFilters(prev => ({ ...prev, search: term, page: 1 })); // Reset to page 1 on new search
  const setCategory = (cat) => setFilters(prev => ({ ...prev, category: cat, page: 1 }));
  const setSort = (sortOption) => setFilters(prev => ({ ...prev, sort: sortOption, page: 1 }));
  const setStatus = (status) => setFilters(prev => ({ ...prev, status, page: 1 }));

  return {
    documents,
    pagination,
    isLoading,
    error,
    filters,
    setPage,
    setSearch,
    setCategory,
    setSort,
    setStatus,
    refresh: fetchDocuments // Expose a manual refresh button just in case
  };
};