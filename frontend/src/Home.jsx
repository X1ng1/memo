import { AuthContext } from './context/AuthContext';
import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MiniCalendar from './components/MiniCalendar';
import './Home.css';

export default function Home() {
    const { userData, isLoggedin, logout, backendUrl } = useContext(AuthContext);
    const navigate = useNavigate();
    const name = userData && userData.name ? userData.name : (isLoggedin ? 'Loading...' : 'Guest');
    const [recentEntry, setRecentEntry] = useState(null);
    const [stickers, setStickers] = useState([]);
    const entryContainerRef = useRef(null);

    // Check if color is white and use black instead for better contrast
    const rawColor = userData?.emotionColor;
    console.log('Raw emotion color from userData:', rawColor);
    
    const normalizedColor = rawColor?.toLowerCase().trim();
    const isWhite = normalizedColor === '#ffffffff' || normalizedColor === '#fff' || normalizedColor === 'white';
    const color = (rawColor && isWhite) ? '#000000' : (rawColor || '#000000');
    
    console.log('Final color being used:', color, 'isWhite:', isWhite);

    const handleLogOut = async() => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        console.log("Logged in?:", isLoggedin)
    }, [isLoggedin]);

    // Fetch most recent entry
    useEffect(() => {
        const fetchRecentEntry = async () => {
            if (!isLoggedin || !backendUrl) return;
            
            try {
                const response = await fetch(backendUrl + '/api/journal/get-entries', {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.success && data.entries && data.entries.length > 0) {
                    // Sort by date descending to get most recent
                    const sortedEntries = data.entries.sort((a, b) => 
                        new Date(b.date) - new Date(a.date)
                    );
                    const mostRecent = sortedEntries[0];
                    setRecentEntry(mostRecent);
                    
                    // Convert sticker percentages to pixels if stickers exist
                    if (mostRecent.stickers && Array.isArray(mostRecent.stickers) && entryContainerRef.current) {
                        const rect = entryContainerRef.current.getBoundingClientRect();
                        const stickersInPx = mostRecent.stickers.map(s => ({
                            ...s,
                            x: (s.x / 100) * rect.width,
                            y: (s.y / 100) * rect.height,
                            width: (s.width / 100) * rect.width,
                            height: (s.height / 100) * rect.width
                        }));
                        setStickers(stickersInPx);
                    }
                }
            } catch (error) {
                console.error('Error fetching recent entry:', error);
            }
        };

        fetchRecentEntry();
    }, [isLoggedin, backendUrl]);

    // Re-convert sticker positions on window resize
    useEffect(() => {
        const handleResize = () => {
            if (recentEntry?.stickers && entryContainerRef.current) {
                const rect = entryContainerRef.current.getBoundingClientRect();
                const stickersInPx = recentEntry.stickers.map(s => ({
                    ...s,
                    x: (s.x / 100) * rect.width,
                    y: (s.y / 100) * rect.height,
                    width: (s.width / 100) * rect.width,
                    height: (s.height / 100) * rect.width
                }));
                setStickers(stickersInPx);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [recentEntry]);

    return (
        <div className="home-container" style={{color: color, backgroundColor: color}}>
            <div className="book-container">
                <div className="book-page left-page">
                    <h1 className="home-title">
                        Welcome Home, <br/> {name}
                    </h1>
                    <p className="home-description">
                        Your personal space to organize thoughts, memories, and moments.
                    </p>
                    <div className="mini-calendar-wrapper">
                        <MiniCalendar />
                    </div>
                    <div className="journal-button-container">
                        <Link style={{color: color}} to="/calendar" className="journal-button">
                            Sart Journaling
                        </Link>
                    </div>
                </div>
                <div className="book-page right-page">
                    <div className='dictionary' style={{color: color}}> Dictionary
                        <div className='dictionary-content'>
                            <p style={{color: '#fbbf24'}}>Happy</p>
                            <div className='break'></div>
                            <p style={{color: '#dc2626'}}>Mad</p>
                            <div className='break'></div>
                            <p style={{color: '#2563eb'}}>Sad</p>
                            <div className='break'></div>
                            <p style={{color: '#65a30d'}}>Disgust</p>
                            <div className='break'></div>
                            <p style={{color: '#ec4899'}}>Surprise</p>
                            <div className='break'></div>
                            <p style={{color: '#7c3aed'}}>Fear</p>
                        </div>
                    </div>
                    <div className='home-entry-display'>
                        <div className='home-entry-journal-container' ref={entryContainerRef}>
                            {recentEntry ? (
                                <>
                                    <div className='recent-entry-header'>
                                        <h2 style={{
                                            color: (recentEntry.emotionColor && String(recentEntry.emotionColor).toLowerCase() !== '#ffffff' && String(recentEntry.emotionColor).toLowerCase() !== '#fff' && String(recentEntry.emotionColor).toLowerCase() !== 'white')
                                                ? recentEntry.emotionColor
                                                : '#000000'
                                        }}>
                                            {recentEntry.title}
                                        </h2>
                                        <p className='recent-entry-date'>
                                            {(() => {
                                                // Parse as UTC to avoid timezone issues
                                                const utcDate = new Date(recentEntry.date + 'T00:00:00Z');
                                                // Create a local date with the same year/month/day
                                                const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
                                                return localDate.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                });
                                            })()}
                                        </p>
                                    </div>
                                    <div className='recent-entry-content'>
                                        <p>{recentEntry.content}</p>
                                    </div>
                                    {stickers.map(s => (
                                        <img
                                            key={s.id}
                                            src={s.src}
                                            alt="sticker"
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                width: `${s.width}px`,
                                                height: `${s.height}px`,
                                                transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotate}deg)`,
                                                transformOrigin: '0 0',
                                                zIndex: s.z,
                                                pointerEvents: 'none',
                                                userSelect: 'none'
                                            }}                            
                                            draggable={false}
            />
                                    ))}
                                </>
                            ) : (
                                <p className='no-entry-message'>No journal entries yet. Start writing!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <button className="logout-button" onClick={handleLogOut}>Logout</button>
        </div>
    )
};