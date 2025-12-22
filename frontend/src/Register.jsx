import { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const {backendUrl, setIsLoggedin} = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError(null); 

        try {
            const response = await fetch(backendUrl + '/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({name, email, password}),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if(data.success) {
                navigate('/login');
            } else {
                setError('Registration failed.');
                console.error('Registration failed:', data.message);
            }
        } catch(error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className='login-container'>
            <div className='right-side'>
                <div className='intro'>
                    <h1>MEMO</h1>
                    <p>A little journal for your everyday life ✨</p>
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
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <label>Full Name:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>
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
                    <input className="submit" type='submit' value="Sign Up" />
                </form>
                <div>
                    <p>Already have an account? <Link to="/login">Log In Here</Link></p>
                </div>
            </div>
        </div>
    )
}