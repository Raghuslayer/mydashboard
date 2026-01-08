import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
    const { currentUser } = useAuth();

    // We assume loading is handled in AuthProvider before rendering app
    // If not, we might need a loading spinner here

    return currentUser ? children : <Navigate to="/login" />;
}
