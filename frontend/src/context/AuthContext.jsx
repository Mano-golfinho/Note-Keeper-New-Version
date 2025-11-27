/**
 * @fileoverview Authentication Context for managing user authentication state
 * @module context/AuthContext
 */

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '../lib/axios';

/**
 * Authentication Context
 * @type {React.Context}
 */
const AuthContext = createContext();

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication context value
 * @returns {Object|null} user - Current authenticated user
 * @returns {Function} login - Function to log in a user
 * @returns {Function} register - Function to register a new user
 * @returns {Function} logout - Function to log out current user
 * @returns {boolean} loading - Loading state of authentication
 * @example
 * const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
    return useContext(AuthContext);
};

/**
 * Authentication Provider Component
 * Provides authentication state and methods to child components
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Authentication provider wrapper
 */
export const AuthProvider = ({ children }) => {
    // State management
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Initialize authentication state from localStorage on mount
     * Checks for existing token and user data
     */
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    /**
     * Authenticate user with username and password
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<Object>} Result object with success status and optional message
     * @returns {boolean} result.success - Whether login was successful
     * @returns {string} [result.message] - Error message if login failed
     */
    const login = useCallback(async (username, password) => {
        try {
            const res = await axiosInstance.post('/auth/login', { username, password });
            const { token, user } = res.data;

            // Persist authentication data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    }, []);

    /**
     * Register a new user account
     * @param {string} username - Desired username
     * @param {string} password - Desired password
     * @returns {Promise<Object>} Result object with success status and optional message
     * @returns {boolean} result.success - Whether registration was successful
     * @returns {string} [result.message] - Error message if registration failed
     */
    const register = useCallback(async (username, password) => {
        try {
            await axiosInstance.post('/auth/register', { username, password });
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    }, []);

    /**
     * Log out current user
     * Clears authentication data from localStorage and state
     */
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    /**
     * Memoized context value to prevent unnecessary re-renders
     * @type {Object}
     */
    const value = useMemo(() => ({
        user,
        login,
        register,
        logout,
        loading
    }), [user, login, register, logout, loading]);

    // Don't render children until initial auth check is complete
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
