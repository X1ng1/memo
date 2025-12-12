import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from './context/AuthContext';

export default function ProtectedRoute() {
    const {userData, loading} = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return userData ? <Outlet /> : <Navigate to="/login" replace/>
}