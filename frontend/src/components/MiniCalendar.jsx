import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';
import './MiniCalendar.css';

/**
 * Compact calendar component for display on the Home page
 * Shows month view with colored dots under dates that have journal entries
 */
const MiniCalendar = () => {
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
          setJournalEntries(data.entries);
        }
      } catch (error) {
        console.error("Fetch mini-calendar entries error:", error);
      }
    };
    
    fetchEntries();
  }, [backendUrl]);

  // Get emotion color for a given date
  const getDateColor = (date) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    const entry = journalEntries.find(e => moment.utc(e.date).format('YYYY-MM-DD') === dateStr);
    return entry?.emotionColor || null;
  };

  // Check if date has an entry
  const hasEntry = (date) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    return journalEntries.some(e => moment.utc(e.date).format('YYYY-MM-DD') === dateStr);
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Generate calendar grid for the current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= lastDay; day++) {
      days.push(day);
    }
    
    return days;
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button className="mini-calendar-nav" onClick={handlePrevMonth}>←</button>
        <h3 className="mini-calendar-title">
          {moment(currentDate).format('MMMM YYYY')}
        </h3>
        <button className="mini-calendar-nav" onClick={handleNextMonth}>→</button>
      </div>

      <div className="mini-calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="mini-calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="mini-calendar-grid">
        {days.map((day, index) => {
          const color = day ? getDateColor(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) : null;
          const hasEvent = day ? hasEntry(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) : false;
          
          return (
            <div
              key={index}
              className={`mini-calendar-day ${!day ? 'empty' : ''} ${hasEvent ? 'has-entry' : ''}`}
            >
              {day && (
                <>
                  <span className="mini-calendar-date">{day}</span>
                  {hasEvent && (
                    <div
                      className="mini-calendar-dot"
                      style={{ backgroundColor: color || '#fcd00c' }}
                    />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
