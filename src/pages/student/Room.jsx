import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue } from 'firebase/database';
import { Home, Users, Info, HelpCircle, MapPin, ShieldCheck, Fan, Snowflake, Wind, ChevronLeft, Zap, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Room.css';

const Room = () => {
  const { userData } = useAuth();
  const [roomDetails, setRoomDetails] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Week');
  const [liveCost, setLiveCost] = useState(428.56);
  const [activeAppliance, setActiveAppliance] = useState('Fan');

  // Simulated live data for the chart
  const [chartData, setChartData] = useState([
    { name: 'M', value: 12 },
    { name: 'T', value: 18 },
    { name: 'W', value: 15 },
    { name: 'T', value: 25 },
    { name: 'F', value: 20 },
    { name: 'S', value: 30 },
    { name: 'S', value: 22 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCost(prev => prev + (Math.random() * 0.05));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
          if (room.students && room.students.includes(userData.name)) {
            currentRoom = room;
            break;
          }
        }
      }
      
      setRoomDetails(currentRoom);

      if (!currentRoom || !currentRoom.students) {
        setRoommates([]);
        setLoading(false);
        return;
      }

      const unsubscribeStudents = onValue(studentsRef, (studentSnap) => {
        if (studentSnap.exists()) {
          const allStudents = studentSnap.val();
          const roommateNames = currentRoom.students.filter(name => name !== userData.name);
          
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
                  <button className="primary-btn">Request Room Change</button>
                </div>
              </>
            )}
          </div>

          <div className="energy-usage-card">
            <header className="energy-header">
              <div className="energy-title-group">
                <button className="back-circle"><ChevronLeft size={20} /></button>
                <h2>Energy Usage</h2>
              </div>
              <div className="energy-tabs">
                {['Day', 'Week', 'Month', 'Year'].map(tab => (
                  <button 
                    key={tab} 
                    className={`energy-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </header>

            <div className="energy-controls">
              <div className="appliance-selector">
                <button 
                  className={`appliance-btn ${activeAppliance === 'Fan' ? 'active fan' : ''}`}
                  onClick={() => setActiveAppliance('Fan')}
                >
                  <Wind size={18} />
                  <span>Fan</span>
                </button>
                <button 
                  className={`appliance-btn ${activeAppliance === 'AC' ? 'active ac' : ''}`}
                  onClick={() => setActiveAppliance('AC')}
                >
                  <Snowflake size={18} />
                  <span>AC</span>
                </button>
                <button 
                  className={`appliance-btn ${activeAppliance === 'Cooler' ? 'active cooler' : ''}`}
                  onClick={() => setActiveAppliance('Cooler')}
                >
                  <Zap size={18} />
                  <span>Cooler</span>
                </button>
              </div>

              <div className="unit-toggle">
                <button className="unit-btn active"><DollarSign size={16} /></button>
                <button className="unit-btn"><Zap size={16} /></button>
              </div>
            </div>

            <div className="energy-metrics">
              <div className="metric">
                <span className="metric-label">Cost</span>
                <div className="metric-value-group">
                  <span className="currency">₹</span>
                  <span className="value">{liveCost.toFixed(2)}</span>
                  <span className="trend-up">↑</span>
                </div>
              </div>
              <div className="metric">
                <span className="metric-label">Electricity</span>
                <div className="metric-value-group">
                  <span className="value">45</span>
                  <span className="unit">kWh</span>
                </div>
              </div>
              <div className="metric">
                <span className="metric-label">Appliance</span>
                <div className="metric-value-group">
                  <span className="value">{activeAppliance}</span>
                </div>
              </div>
            </div>

            <div className="energy-chart-container">
              <div className="chart-info">
                <span>This week, 30 Mar - 2 Apr</span>
              </div>
              <div className="main-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#9ca3af', fontSize: 12}} 
                      dy={10}
                    />
                    <YAxis 
                      hide 
                      domain={[0, 'auto']} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
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
