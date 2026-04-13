import React, { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(); 

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [authLoading, setAuthLoading] = useState(true);

    // Initialize auth state from localStorage token only
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("token");
            
            if (!storedToken) {
                console.log("No token found in localStorage");
                setAuthLoading(false);
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            try {
                console.log("Verifying token with backend...");
                // Verify token and get fresh user data from MongoDB
                const response = await fetch("http://localhost:5000/api/auth/verify", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${storedToken}`
                    }
                });

                console.log("Verification response status:", response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("Verification successful, setting user data:", data.user);
                    setUser(data.user);
                    setIsAuthenticated(true);
                    setToken(storedToken);
                } else {
                    console.log("Verification failed, clearing auth state");
                    // Token invalid, clear it
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("Token verification error:", error);
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setAuthLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Update localStorage when auth state changes (only JWT token)
    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, [token]);

    const login = (email, userToken, userData) => { 
        // Store JWT token in localStorage
        localStorage.setItem("token", userToken);
        setToken(userToken);
        // Set user data from MongoDB response
        setUser(userData);
        setIsAuthenticated(true);
        setAuthLoading(false);
        
        toast.success("Login successful! Welcome back.");
    };

    const updateUser = (userData) => {
        setUser(userData);
        toast.success("Profile updated successfully!");
    };
    
    const logout = () => { 
        // Clear JWT token from localStorage
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthLoading(false);
        
        toast.error("You have been logged out.");
    };

    // Get auth headers for API calls
    const getAuthHeaders = () => {
        if (token) {
            return {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            user,
            token,
            authLoading,
            login, 
            logout,
            updateUser,
            getAuthHeaders
        }}>
            {children}
        </AuthContext.Provider>
    );
}; 

export const useAuth = () => {
  return useContext(AuthContext);
};