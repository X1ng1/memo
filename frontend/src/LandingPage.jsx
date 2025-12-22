import { Link } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-book">
        {/* Left side */}
        <div className="landing-left">
          <h1 className="landing-title">Memo</h1>
          <p className="landing-tagline">A little journal for your everyday life ✨</p>

          <p className="landing-subtitle">
            Record your most memorable activity each day, how productive you felt,
            and your mood. Then use the calendar to look back and see patterns in
            your life over time.
          </p>

          <div className="landing-cta">
            <Link className="landing-btn primary" to="/register">
              Create account
            </Link>
            <Link className="landing-btn outline" to="/login">
              Log in
            </Link>
          </div>

         
        </div>

        {/* Right side */}
        <div className="landing-right">
          <h2 className="feature-title">What you can do</h2>

          <ul className="feature-list">
             <li><span>📝 Daily entry</span> — activity, productivity, mood</li>
             <li><span>📅 Calendar</span> — jump to any day instantly</li>
             <li><span>⭐ Saved</span> — bookmark entries to revisit</li>
             <li><span>🧠 Reflect</span> — look back and remember seasons of your life</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
