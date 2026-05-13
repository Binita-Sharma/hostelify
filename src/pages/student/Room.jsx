import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue } from 'firebase/database';
import { Home, Users, Info, HelpCircle, MapPin, ShieldCheck } from 'lucide-react';
import './Room.css';

const Room = () => {
  const { userData } = useAuth();
  const [roomDetails, setRoomDetails] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!userData?.name) return;

    const roomsRef = ref(realtimeDB, 'rooms');
    const studentsRef = ref(realtimeDB, 'students');

    const unsubscribeRooms = onValue(roomsRef, (snap) => {
      let currentRoom = null;
      if (snap.exists()) {
        const rooms = snap.val();
        for (const key in rooms) {
          const room = rooms[key];
          if (room.students && Array.isArray(room.students)) {
            const isAssigned = room.students.some(s => {
              if (typeof s === 'string') return s === userData.name;
              return s && (s.name === userData.name || s.id === userData.uid);
            });
            if (isAssigned) {
              currentRoom = room;
              break;
            }
          }
        }
      }
      
      setRoomDetails(currentRoom);

      if (!currentRoom || !currentRoom.students || currentRoom.students.length === 0) {
        setRoommates([]);
        setLoading(false);
        return;
      }

      const unsubscribeStudents = onValue(studentsRef, (studentSnap) => {
        if (studentSnap.exists()) {
          const allStudents = studentSnap.val();
          
          const roommateNames = currentRoom.students
            .filter(s => {
              const name = typeof s === 'string' ? s : s.name;
              const id = typeof s === 'string' ? null : s.id;
              return name !== userData.name && id !== userData.uid;
            })
            .map(s => typeof s === 'string' ? s : s.name);
          
          const roommateData = [];
          for (const key in allStudents) {
            const student = allStudents[key];
            if (roommateNames.includes(student.name)) {
              roommateData.push({
                name: student.name,
                roll: student.rollNumber || 'N/A',
                phone: student.phone || 'N/A'
              });
            }
          }
          setRoommates(roommateData);
        }
        setLoading(false);
      });
      
      return () => unsubscribeStudents();
    });

    return () => unsubscribeRooms();
  }, [userData]);

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
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c8c' }}>Loading room details...</div>
            ) : !roomDetails ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c8c' }}>
                <Home size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.5 }} />
                <h3>No Room Assigned</h3>
                <p>Please contact the admin to get a room assigned.</p>
              </div>
            ) : (
              <>
                <div className="room-header">
                  <div className="room-number-badge">
                    <Home size={24} />
                    <span>Room {roomDetails.number}</span>
                  </div>
                  <div className="room-location">
                    <MapPin size={16} />
                    <span>Floor {roomDetails.floor || 'N/A'}, Block {roomDetails.block || 'A'}</span>
                  </div>
                </div>
                
                <div className="room-details">
                  <div className="detail-item">
                    <label>Occupancy</label>
                    <span>{roomDetails.occupied || 0} / {roomDetails.capacity || 0} {(roomDetails.occupied >= roomDetails.capacity) ? '(Full)' : ''}</span>
                  </div>
                  <div className="detail-item">
                    <label>Furniture</label>
                    <span>{roomDetails.capacity || 0} Beds, {roomDetails.capacity || 0} Tables, {roomDetails.capacity || 0} Chairs, {roomDetails.capacity || 0} Cupboards</span>
                  </div>
                  <div className="detail-item">
                    <label>Type</label>
                    <span>{roomDetails.type || 'Standard'} Room</span>
                  </div>
                </div>

                <div className="room-actions">
                  <button className="secondary-btn">Report Room Issue</button>
                </div>
              </>
            )}
          </div>



          {roomDetails && (
            <section className="roommates-section">
              <div className="section-header">
                <h2><Users size={20} /> My Roommates</h2>
              </div>
              <div className="roommates-list">
                {roommates.length === 0 ? (
                  <div style={{ padding: '20px', color: '#8c8c8c' }}>You currently have no roommates.</div>
                ) : (
                  roommates.map((rm, idx) => (
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
                  ))
                )}
              </div>
            </section>
          )}
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
