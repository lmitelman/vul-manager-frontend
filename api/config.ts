// API configuration
// Replace these values with your actual backend configuration

// Base URL for API requests
export const API_BASE_URL = "https://api.example.com"

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000

// API endpoints
export const ENDPOINTS = {
  VULNERABILITIES: "/vulnerabilities",
  VULNERABILITY: (id: string) => `/vulnerabilities/${id}`,
  LOGIN: "/api/login",
  LOGOUT: "/api/logout",
}

// Authentication header - uses token from localStorage
export const getAuthHeader = () => {
  const token = localStorage.getItem("authToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}
