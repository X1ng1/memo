import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import CalendarView from './components/Calendar';
import moment from 'moment';
import './CalendarPage.css';

export default function CalendarPage() {
    const navigate = useNavigate();
    const { backendUrl } = useContext(AuthContext);
    const [journalEntries, setJournalEntries] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch journal entries on mount
    useEffect(() => {
        const fetchEntries = async() => {
            try {
                const response = await fetch(backendUrl + '/api/journal/get-entries', {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    // Transform entries to calendar events with emotion colors
                    const events = data.entries.map(entry => {
                        // Parse UTC date and create local date with same year/month/day
                        const utcDate = new Date(entry.date);
                        const localDate = new Date(
                            utcDate.getUTCFullYear(),
                            utcDate.getUTCMonth(),
                            utcDate.getUTCDate()
                        );
                        
                        return {
                            id: entry._id,
                            title: entry.title,
                            start: localDate,
                            end: localDate,
                            allDay: true,
                            emotionColor: entry.emotionColor,
                            resource: entry
                        };
                    });
                    setJournalEntries(events);
                }
            } catch (error) {
                console.error("Fetch entry error:", error);
            }
        };
        
        fetchEntries();
    }, [backendUrl]);

    // Handle selecting a date slot on the calendar
    const handleSelectSlot = ({ start, action }) => {
        if (action === 'select' || action === 'click') {
            const dateStr = moment(start).format('YYYY-MM-DD');
            // Check if entry exists for this date
            const hasEntry = journalEntries.some(entry =>
                moment(entry.start).format('YYYY-MM-DD') === dateStr
            );
            
            if (hasEntry) {
                navigate(`/saved-entry/${dateStr}`);
            } else {
                navigate(`/journal/${dateStr}`);
            }
        }
    };

    // Handle clicking an event on the calendar
    const handleSelectEvent = (event) => {
        const dateStr = moment(event.start).format('YYYY-MM-DD');
        navigate(`/saved-entry/${dateStr}`);
    };

    // Handle month/date navigation
    const handleNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    // Handle drilling down into a date (when clicking day header)
    const handleDrillDown = (date) => {
        const dateStr = moment(date).format('YYYY-MM-DD');
        if (journalEntries.some(entry =>
            moment(entry.start).format('YYYY-MM-DD') === dateStr
        )) {
            navigate(`/saved-entry/${dateStr}`)
        }
        else {
            navigate(`/journal/${dateStr}`);
        }
    };

    // Style individual events based on emotion color
    const eventStyleGetter = (event) => {
        const style = {
            backgroundColor: event.emotionColor !== '#ffffff' ? event.emotionColor : '#000000',
            borderRadius: '6px',
            opacity: 0.8,
            color: 'white',
            border: 'none',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="calendar-page">
            <div className="calendar-content">
                <div className="calendar-header">
                    <h1 className="calendar-title">My Journal Calendar</h1>
                    <button 
                        className="home-button"
                        onClick={() => navigate('/')}
                    >
                        Home
                    </button>
                </div>
                <div className="calendar-wrapper">
                    <CalendarView
                        events={journalEntries}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        onNavigate={handleNavigate}
                        onDrillDown={handleDrillDown}
                        eventPropGetter={eventStyleGetter}
                        currentDate={currentDate}
                        height={600}
                        size="large"
                    />
                </div>
            </div>
        </div>
    );
}