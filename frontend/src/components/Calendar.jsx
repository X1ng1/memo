import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

const localizer = momentLocalizer(moment);

/**
 * Reusable Calendar component - presentational only
 * All logic (fetching, navigation) is handled by the parent component
 * 
 * Props:
 *  - events: array of event objects with {id, title, start, end, allDay, emotionColor, resource}
 *  - onSelectSlot: callback when a date/slot is clicked
 *  - onSelectEvent: callback when an event is clicked
 *  - onNavigate: callback when user navigates months
 *  - onDrillDown: callback when user drills into a date
 *  - onView: callback when view changes
 *  - eventPropGetter: function to style individual events
 *  - currentDate: currently displayed date
 *  - height: calendar height (default 600)
 *  - size: 'large' (full page) or 'small' (mini calendar for Home page)
 */
const CalendarView = ({
  events = [],
  onSelectSlot,
  onSelectEvent,
  onNavigate,
  onDrillDown,
  onView,
  eventPropGetter,
  currentDate = new Date(),
  height = 600,
  size = 'large'
}) => {
  return (
    <div className={`calendar-container calendar-${size}`}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height }}
        selectable={true}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        onDrillDown={onDrillDown}
        views={['month']}
        view="month"
        toolbar={true}
        popup={false}
        step={60}
        showMultiDayTimes={false}
        date={currentDate}
        onNavigate={onNavigate}
        onView={onView}
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
};

export default CalendarView;