import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // need isLoading to distinguish between not logged in and still checking authentication
    // when page is refreshed, there is a brief moment where userData is null before getUserData finishes
    const getUserData = async() => {
        try {
            const response = await fetch(backendUrl + '/api/user/data', {
                credentials: 'include'
            });
            const data = await response.json();
            if(data.success) {
                setUserData(data.userData);
                setIsLoggedin(true);
            } else {
                setIsLoggedin(false);
                setUserData(null);
            }
        } catch(error) {
            setIsLoggedin(false);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async() => {
        try {
            const response = await fetch(backendUrl + '/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if(data.success) {
                setIsLoggedin(false);
                setUserData(null);
            }
        } catch(error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    )
}