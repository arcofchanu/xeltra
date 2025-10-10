import React, { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }: PropsWithChildren) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Redirect them to the /auth page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they log in.
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;