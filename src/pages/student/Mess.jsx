import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  Coffee, 
  Utensils, 
  Cookie, 
  Moon, 
  Star
} from 'lucide-react';
import './Mess.css';

const StudentMess = () => {
  const [activeTab, setActiveTab] = useState("Today's menu");
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];

  useEffect(() => {
    const messDoc = doc(db, 'mess', 'weekly_menu');
    
    const unsubscribe = onSnapshot(messDoc, (docSnap) => {
      if (docSnap.exists()) {
        setMenu(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const timings = [
    { label: 'Breakfast', time: '7:30 AM – 9:30 AM', icon: <Coffee size={20} /> },
    { label: 'Lunch', time: '12:30 PM – 2:30 PM', icon: <Utensils size={20} /> },
    { label: 'Snacks', time: '5:00 PM – 6:00 PM', icon: <Cookie size={20} /> },
    { label: 'Dinner', time: '8:00 PM – 10:00 PM', icon: <Moon size={20} /> },
  ];

  if (loading) return <div className="loading-state">Loading Menu...</div>;

  return (
    <div className="student-mess-container animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <span className="subtitle">MESS</span>
          <h1>Meals & menu</h1>
        </div>
      </header>

      <div className="timings-grid">
        {timings.map((t, idx) => (
          <div key={idx} className="timing-card">
            <div className="timing-icon">{t.icon}</div>
            <div className="timing-info">
              <span className="timing-label">{t.label}</span>
              <span className="timing-value">{t.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === "Today's menu" ? 'active' : ''}`}
          onClick={() => setActiveTab("Today's menu")}
        >
          Today's menu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Weekly menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('Weekly menu')}
        >
          Weekly menu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('Feedback')}
        >
          Feedback
        </button>
      </div>

      <div className="menu-display">
        {activeTab === "Today's menu" && (
          <div className="today-menu-card animate-fade-in">
            <h2>{today}</h2>
            <div className="meals-list">
              <div className="meal-item">
                <Coffee size={18} className="meal-icon" />
                <div className="meal-details">
                  <label>BREAKFAST</label>
                  <p>{menu?.[today]?.breakfast || 'Not updated yet'}</p>
                </div>
              </div>
              <div className="meal-item">
                <Utensils size={18} className="meal-icon" />
                <div className="meal-details">
                  <label>LUNCH</label>
                  <p>{menu?.[today]?.lunch || 'Not updated yet'}</p>
                </div>
              </div>
              <div className="meal-item">
                <Cookie size={18} className="meal-icon" />
                <div className="meal-details">
                  <label>SNACKS</label>
                  <p>{menu?.[today]?.snacks || 'Not updated yet'}</p>
                </div>
              </div>
              <div className="meal-item">
                <Moon size={18} className="meal-icon" />
                <div className="meal-details">
                  <label>DINNER</label>
                  <p>{menu?.[today]?.dinner || 'Not updated yet'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Weekly menu' && (
          <div className="weekly-menu-list animate-fade-in">
            {days.map(day => (
              <div key={day} className="day-menu-row">
                <h3>{day}</h3>
                <div className="day-meals">
                  <span><strong>B:</strong> {menu?.[day]?.breakfast || '-'}</span>
                  <span><strong>L:</strong> {menu?.[day]?.lunch || '-'}</span>
                  <span><strong>S:</strong> {menu?.[day]?.snacks || '-'}</span>
                  <span><strong>D:</strong> {menu?.[day]?.dinner || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Feedback' && (
          <div className="feedback-section animate-fade-in">
            <h3>Share your feedback</h3>
            <p>Your feedback helps us improve the food quality.</p>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={32} className="star-icon" />
              ))}
            </div>
            <textarea placeholder="Write your comments here..."></textarea>
            <button className="submit-btn">Submit Feedback</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMess;
