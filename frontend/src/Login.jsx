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

    const handleSubmit = async(e) => {
        e.preventDefault();
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
                setIsLoggedin(true);
                await getUserData();
                navigate('/');
                console.log('Login successful');
            } else {
                setError('Invalid email/password');
                console.error('Login failed:', data.message);
            }
        } catch(error) {
            console.error('Login error:', error);
        }

    };

    return (
        <div className='login-container'>
            <div className='right-side'>

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
                    <input className="submit" type='submit' value="Log in" />
                </form>
                <div>
                    <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                </div>
            </div>
        </div>
    )
}