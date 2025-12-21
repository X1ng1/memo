import { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { useNavigate, useRouteLoaderData, Link} from 'react-router-dom';
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {backendUrl, setIsLoggedin, getUserData, userData} = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (loading) return; // Prevent double submission
        
        setLoading(true);
        setError(null); // Clear previous errors
        
        try {
            const response = await fetch(backendUrl + '/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email, password}),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if(data.success) {
                console.log('Login successful, fetching user data...');
                await getUserData();
                console.log('User data fetched, navigating...');
                
                // Use replace to prevent back button issues
                navigate('/', { replace: true });
            } else {
                setError('Invalid email/password');
                console.error('Login failed:', data.message);
                setLoading(false);
            }
        } catch(error) {
            console.error('Login error:', error);
            setError('Network error. Please try again.');
            setLoading(false);
        }

    };

    return (
        <div className='login-container'>
            <div className='right-side'>
                <div className='intro'>
                    <h1>MEMO</h1>
                    <p className="home-description">
                        Your personal space to organize thoughts, memories, and moments.
                    </p>
                    <p>Track your emotions through journaling and lift your mood with cute stickers!</p>
                </div>
            </div>
            <div className='login-form'>
                {error && (
                    <p style={{
                        backgroundColor: 'red',
                        color: 'white',
                        padding: 10
                    }}>{error}</p>
                )}

                <h1>Log In</h1>
                <form onSubmit={handleSubmit}>
                    <label>Email:
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label> Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <input 
                        className="submit" 
                        type='submit' 
                        value={loading ? "Logging in..." : "Log in"}
                        disabled={loading}
                    />
                </form>
                <div>
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>
            </div>
        </div>
    )
}