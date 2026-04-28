import React from 'react';
import { Home, Users, Info, HelpCircle, MapPin, ShieldCheck } from 'lucide-react';
import './Room.css';

const Room = () => {
  const roommates = [
    { name: 'Alex Johnson', roll: '2024CS105', phone: '+1 234 567 890' },
    { name: 'Ryan Miller', roll: '2024CS112', phone: '+1 234 567 891' },
  ];

  const rules = [
    'Curfew time is 10:00 PM. All students must be in their rooms.',
    'Visitors are only allowed between 4:00 PM and 7:00 PM.',
    'Keep your room clean and dispose of trash in designated bins.',
    'Silence hours start from 11:00 PM onwards.',
    'Consumption of alcohol or drugs is strictly prohibited.'
  ];

  return (
    <div className="room-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Room Management</h1>
          <p>View your room details, roommates, and hostel rules.</p>
        </div>
      </header>

      <div className="room-grid">
        <div className="room-main">
          <div className="room-info-card">
            <div className="room-header">
              <div className="room-number-badge">
                <Home size={24} />
                <span>Room 204</span>
              </div>
              <div className="room-location">
                <MapPin size={16} />
                <span>Floor 2, Block A, North Wing</span>
              </div>
            </div>
            
            <div className="room-details">
              <div className="detail-item">
                <label>Occupancy</label>
                <span>3 / 3 (Full)</span>
              </div>
              <div className="detail-item">
                <label>Furniture</label>
                <span>3 Beds, 3 Tables, 3 Chairs, 3 Cupboards</span>
              </div>
              <div className="detail-item">
                <label>Amenities</label>
                <span>Attached Bathroom, AC, High-speed Wifi</span>
              </div>
            </div>

            <div className="room-actions">
              <button className="secondary-btn">Report Room Issue</button>
              <button className="primary-btn">Request Room Change</button>
            </div>
          </div>

          <section className="roommates-section">
            <div className="section-header">
              <h2><Users size={20} /> My Roommates</h2>
            </div>
            <div className="roommates-list">
              {roommates.map((rm, idx) => (
                <div key={idx} className="roommate-card">
                  <div className="rm-avatar">{rm.name.charAt(0)}</div>
                  <div className="rm-info">
                    <h4>{rm.name}</h4>
                    <span>{rm.roll}</span>
                  </div>
                  <div className="rm-contact">
                    <span>{rm.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="room-sidebar">
          <div className="rules-card">
            <h3><ShieldCheck size={18} /> Hostel Rules</h3>
            <ul className="rules-list">
              {rules.map((rule, idx) => (
                <li key={idx}>
                  <div className="rule-dot"></div>
                  <p>{rule}</p>
                </li>
              ))}
            </ul>
            <button className="full-rules-btn">View All Rules</button>
          </div>

          <div className="help-card">
            <HelpCircle size={32} />
            <h4>Need Assistance?</h4>
            <p>If you have any issues with your room or roommates, please contact the warden.</p>
            <button className="contact-warden">Contact Warden</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Room;
