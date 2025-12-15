import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import './JournalEntry.css';

export default function JournalEntry() {
    const { date } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    // const [mood, setMood] = useState("");
    const {backendUrl, userData, getUserData} = useContext(AuthContext);

    const email = userData.email;
    const userMood = userData.emotionColor;

    // Parse date correctly to avoid timezone issues
    // Split the YYYY-MM-DD string and create date at noon to avoid timezone shifts
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0); // Month is 0-indexed

    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        // // Convert mood text to color
        // const getEmotionColor = (selectedMood) => {
        //     switch (selectedMood) {
        //         case "Happy": return "#F6FF00";
        //         case "Peaceful": return "#FF9000";
        //         case "Tired": return "#00C7FF";
        //         case "Frustrated": return "#FF0000";
        //         case "Sad": return "#000DFF";
        //         case "Anxious": return "#00FF15";
        //         default: return "#FFFF";
        //     }
        // };
        
        // const emotionColor = getEmotionColor(mood);
        
        try {
            const response = await fetch(backendUrl + '/api/journal/create-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    date: dateObj.toISOString(),
                    user_email: email,
                    content
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if(!data.success) {
                console.error('Failed to create journal entry:', data.message);
                return;
            }

            const update_response = await fetch(backendUrl + '/api/user/update-emotion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    userColor: userMood,
                    addColor: data.emotionData.color,
                }),
                credentials: 'include'
            });

            const update_data = await update_response.json();

            if(update_data.success) {
                await getUserData(); // Refresh user data to get updated emotion color
                navigate('/calendar');
            } else {
                console.error('Failed to update emotion:', update_data.message);
            }
        } catch(error) {
            console.error('Failed to create journal entry:', error);
        }
    };

    return (
        <div className="journal-page">
            <div className="journal-container">
                <div className="journal-header">
                    <Link to="/calendar" className="back-button">← Back to Calendar</Link>
                    <h1 className="journal-date">{formattedDate}</h1>
                </div>

                <form onSubmit={handleSubmit} className="journal-form">
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What happened today?"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Your thoughts</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write about your day, thoughts, feelings, or anything on your mind..."
                            className="form-textarea"
                            rows="10"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-button">
                            💾 Save Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}