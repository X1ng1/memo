import { AuthContext } from './context/AuthContext';
import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MiniCalendar from './components/MiniCalendar';
import './Home.css';

export default function Home() {
    const { userData, isLoggedin, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const name = userData && userData.name ? userData.name : (isLoggedin ? 'Loading...' : 'Guest');
    const color = userData.emotionColor;

    const handleLogOut = async() => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        console.log("Logged in?:", isLoggedin)
    }, [isLoggedin]);

    return (
        <div className="home-container" style={{backgroundColor: color}}>
            <div className='overlay-item book'></div>
            <div className="home-content">
                <h1 className="home-title">
                    Welcome Home, {name}
                </h1>
                <p className="home-description">
                    Your personal space to organize thoughts, memories, and moments.
                </p>
                <div className="mini-calendar-wrapper">
                    <MiniCalendar />
                </div>
            </div>
            <div className="journal-button-container">
                <Link to="/calendar" className="journal-button">
                    Journal
                </Link>
            </div>
            <button className="logout-button" onClick={handleLogOut}>Logout</button>
        </div>
    )
};