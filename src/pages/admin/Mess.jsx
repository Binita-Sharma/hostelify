import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { UtensilsCrossed } from 'lucide-react';
import './Mess.css';

const AdminMess = () => {
  const [activeTab, setActiveTab] = useState('Weekly menu');
  const [menu, setMenu] = useState({
    Monday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    Tuesday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    Wednesday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    Thursday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    Friday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    Saturday: { breakfast: '', lunch: '', snacks: '', dinner: '' },
    Sunday: { breakfast: '', lunch: '', snacks: '', dinner: '' }
  });
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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

  const handleChange = (day, meal, value) => {
    setMenu(prev => ({
      ...prev,
      [day]: { ...prev[day], [meal]: value }
    }));
  };

  const handleSave = async (day) => {
    try {
      const messDoc = doc(db, 'mess', 'weekly_menu');
      await setDoc(messDoc, menu, { merge: true });
      alert(`${day} menu saved successfully!`);
    } catch (err) {
      console.error('Error saving menu:', err);
    }
  };

  if (loading) return <div className="loading-state">Loading Mess Management...</div>;

  return (
    <div className="admin-mess-container animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <span className="subtitle">OPERATIONS</span>
          <h1>Mess management</h1>
        </div>
      </header>

      <div className="tab-container">
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

      <div className="menu-editor">
        {days.map(day => (
          <div key={day} className="day-card">
            <div className="day-header">
              <UtensilsCrossed size={18} />
              <h3>{day}</h3>
            </div>
            
            <div className="meal-inputs">
              <div className="input-group">
                <label>Breakfast</label>
                <input 
                  type="text" 
                  value={menu[day].breakfast}
                  onChange={(e) => handleChange(day, 'breakfast', e.target.value)}
                  placeholder="e.g. Idli & Sambar"
                />
              </div>
              <div className="input-group">
                <label>Lunch</label>
                <input 
                  type="text" 
                  value={menu[day].lunch}
                  onChange={(e) => handleChange(day, 'lunch', e.target.value)}
                  placeholder="e.g. Roti, Dal, Rice"
                />
              </div>
              <div className="input-group">
                <label>Snacks</label>
                <input 
                  type="text" 
                  value={menu[day].snacks}
                  onChange={(e) => handleChange(day, 'snacks', e.target.value)}
                  placeholder="e.g. Tea & Biscuits"
                />
              </div>
              <div className="input-group">
                <label>Dinner</label>
                <input 
                  type="text" 
                  value={menu[day].dinner}
                  onChange={(e) => handleChange(day, 'dinner', e.target.value)}
                  placeholder="e.g. Veg Pulao, Curd"
                />
              </div>
            </div>

            <button className="save-day-btn" onClick={() => handleSave(day)}>
              Save {day}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMess;
