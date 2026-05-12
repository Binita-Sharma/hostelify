import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, update, set, remove } from 'firebase/database';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Bed, 
  UserPlus,
  X,
  User,
  ChevronLeft,
  Wind,
  Snowflake,
  Zap,
  DollarSign,
  MapPin,
  Users,
  Sparkles,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Rooms.css';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeEnergyTab, setActiveEnergyTab] = useState('Week');
  const [activeAppliance, setActiveAppliance] = useState('Fan');
  const [housekeepers, setHousekeepers] = useState([]);
  const [hkAssignments, setHkAssignments] = useState({});
  const [hkSchedules, setHkSchedules] = useState({});
  
  // Simulated electricity data
  const chartData = [
    { name: 'M', value: 12 },
    { name: 'T', value: 18 },
    { name: 'W', value: 15 },
    { name: 'T', value: 25 },
    { name: 'F', value: 20 },
    { name: 'S', value: 30 },
    { name: 'S', value: 22 },
  ];

  const [newRoom, setNewRoom] = useState({
    number: '',
    type: 'double',
    floor: '1st',
    block: 'A',
    capacity: 2
  });

  useEffect(() => {
    const roomsRef = ref(realtimeDB, 'rooms');
    const unsubscribeRooms = onValue(roomsRef, (snapshot) => {
      const rooms = snapshot.val();
      const data = rooms ? Object.entries(rooms).map(([id, room]) => ({ id, ...room })) : [];
      setRooms(data);
    }, (error) => {
      console.error("Realtime Database error:", error);
    });

    const studentsRef = ref(realtimeDB, 'students');
    const unsubscribeStudents = onValue(studentsRef, (snapshot) => {
      const students = snapshot.val();
      const data = students ? Object.entries(students)
        .map(([id, student]) => ({ id, ...student })) : [];
      setStudents(data);
    });

    const hkRef = ref(realtimeDB, 'housekeepers');
    const unsubscribeHK = onValue(hkRef, (snapshot) => {
      const data = snapshot.val();
      setHousekeepers(data ? Object.entries(data).map(([id, hk]) => ({ id, ...hk })) : []);
    });

    const hkAssignRef = ref(realtimeDB, 'housekeeping_assignments');
    const unsubscribeHKAssign = onValue(hkAssignRef, (snapshot) => {
      setHkAssignments(snapshot.val() || {});
    });

    const hkSchedRef = ref(realtimeDB, 'housekeeping_schedules');
    const unsubscribeHKSched = onValue(hkSchedRef, (snapshot) => {
      setHkSchedules(snapshot.val() || {});
    });

    return () => { 
      unsubscribeRooms(); 
      unsubscribeStudents();
      unsubscribeHK();
      unsubscribeHKAssign();
      unsubscribeHKSched();
    };
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();

    // Check for duplicate room number
    const roomExists = rooms.some(room => room.number.toString() === newRoom.number.toString());
    if (roomExists) {
      alert("This room is already created");
      return;
    }

    setLoading(true);
    try {
      const roomId = 'room_' + Date.now();
      await set(ref(realtimeDB, 'rooms/' + roomId), {
        ...newRoom,
        occupied: 0,
        students: []
      });
      setShowAddModal(false);
      setNewRoom({ number: '', type: 'double', floor: '1st', block: 'A', capacity: 2 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assignStudent = async (student) => {
    if (!selectedRoom) return;
    if (selectedRoom.occupied >= selectedRoom.capacity) {
      alert("Room is full!");
      return;
    }
    
    setLoading(true);
    try {
      const studentId = student.id;
      const updatedStudents = [...(selectedRoom.students || []), { name: student.name, id: studentId }];
      
      // 1. Update Room Record
      await update(ref(realtimeDB, 'rooms/' + selectedRoom.id), {
        students: updatedStudents,
        occupied: selectedRoom.occupied + 1
      });

      // 2. Update Student Profile (This is the critical part for sync)
      console.log(`Linking room ${selectedRoom.number} to student ${studentId}`);
      await update(ref(realtimeDB, `students/${studentId}`), {
        roomNumber: selectedRoom.number.toString()
      });

      alert(`Success: Room ${selectedRoom.number} linked to ${student.name}`);
      setShowAssignModal(false);
    } catch (err) {
      console.error('Assignment error:', err);
      alert('Failed to assign student. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    if(window.confirm("Are you sure you want to delete this room?")) {
      await remove(ref(realtimeDB, 'rooms/' + id));
    }
  };

  return (
    <div className="admin-rooms-v2 animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <span className="subtitle">INVENTORY</span>
          <h1>Rooms</h1>
        </div>
        <button className="add-room-btn-v2" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add room</span>
        </button>
      </header>

      <div className="rooms-grid-v2">
        {rooms.length === 0 ? (
          <div className="empty-msg-full">No rooms found. Add your first room to get started.</div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="room-card-v2" onClick={() => { setSelectedRoom(room); setShowDetailsModal(true); }}>
              <div className="room-card-header">
                <div className="room-title">
                  <Bed size={20} className="icon-terracotta" />
                  <h3>Room {room.number}</h3>
                </div>
                <span className={`occupancy-pill ${room.occupied >= room.capacity ? 'full' : ''}`}>
                  {room.occupied}/{room.capacity}
                </span>
              </div>
              
              <div className="room-subtitle">
                {room.type} • Floor {room.floor} • Block {room.block}
              </div>

              <div className="assigned-students">
                {room.students?.map((s, idx) => {
                  const name = typeof s === 'string' ? s : s.name;
                  return (
                    <div key={idx} className="student-pill">
                      <span>{name}</span>
                      <User size={14} className="icon-prio" />
                    </div>
                  );
                })}
                {(!room.students || room.students.length === 0) && (
                  <span className="no-students">Empty</span>
                )}
              </div>

              <div className="room-actions-v2">
                <button 
                  className="action-btn-v2 assign" 
                  onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); setShowAssignModal(true); }}
                >
                  <UserPlus size={16} />
                  <span>Assign</span>
                </button>
                <button className="action-btn-v2 edit" onClick={(e) => e.stopPropagation()}>
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-btn-v2 delete" 
                  onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Room</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddRoom} className="modal-form">
              <div className="form-group">
                <label>Room Number</label>
                <input 
                  type="text" 
                  value={newRoom.number} 
                  onChange={e => setNewRoom({...newRoom, number: e.target.value})}
                  placeholder="e.g. 101"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})}>
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="quad">Quad</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input 
                    type="number" 
                    value={newRoom.capacity} 
                    onChange={e => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Floor</label>
                  <input type="text" value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} placeholder="e.g. 1st" />
                </div>
                <div className="form-group">
                  <label>Block</label>
                  <input type="text" value={newRoom.block} onChange={e => setNewRoom({...newRoom, block: e.target.value})} placeholder="e.g. A" />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {showDetailsModal && selectedRoom && (
        <div className="modal-overlay details-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="details-modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <header className="details-modal-header">
              <div className="room-info-large">
                <div className="number-box">Room {selectedRoom.number}</div>
                <div className="meta-info">
                  <h2>{selectedRoom.type} Room</h2>
                  <span><MapPin size={14} /> Floor {selectedRoom.floor}, Block {selectedRoom.block}</span>
                </div>
              </div>
              <button className="close-btn-circle" onClick={() => setShowDetailsModal(false)}><X size={20} /></button>
            </header>

            <div className="details-modal-grid">
              <div className="details-left">
                <section className="members-section">
                  <h3><Users size={18} /> Room Members</h3>
                  <div className="members-list">
                    {selectedRoom.students?.length > 0 ? (
                      selectedRoom.students.map((studentObj, idx) => {
                        // Handle both old string format and new object format
                        const sName = typeof studentObj === 'string' ? studentObj : studentObj.name;
                        const sId = typeof studentObj === 'string' ? null : studentObj.id;
                        
                        const studentData = students.find(s => s.name === sName || (sId && s.id === sId));
                        return (
                          <div key={idx} className="member-row">
                            <div className="member-avatar">{sName.charAt(0)}</div>
                            <div className="member-info">
                              <span className="member-name">{sName}</span>
                              <span className="member-roll">
                                {studentData?.rollNumber || 'N/A'} • ID: {studentData?.id || 'Unknown'}
                              </span>
                            </div>
                            <div className="member-contact">{studentData?.phone || 'No phone'}</div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="no-members">No students assigned to this room yet.</p>
                    )}
                  </div>
                </section>

                <section className="room-specs">
                  <h3>Specifications</h3>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <label>Capacity</label>
                      <span>{selectedRoom.capacity} Beds</span>
                    </div>
                    <div className="spec-item">
                      <label>Current Status</label>
                      <span className={selectedRoom.occupied >= selectedRoom.capacity ? 'full' : 'available'}>
                        {selectedRoom.occupied >= selectedRoom.capacity ? 'Fully Occupied' : 'Available'}
                      </span>
                    </div>
                  </div>
                </section>
                
                <section className="room-housekeeping-section">
                  <h3><Sparkles size={18} /> Housekeeping</h3>
                  <div className="hk-card-mini">
                    {(() => {
                      const blockId = selectedRoom.block;
                      const floorNo = parseInt(selectedRoom.floor);
                      const hkId = hkAssignments[blockId]?.[floorNo];
                      const housekeeper = housekeepers.find(hk => hk.id === hkId);
                      const schedule = hkSchedules[blockId]?.[floorNo];

                      if (housekeeper || schedule) {
                        return (
                          <div className="hk-info-grid">
                            <div className="hk-item">
                              <label>Assigned Staff</label>
                              <div className="hk-val">
                                <User size={14} />
                                <span>{housekeeper ? housekeeper.name : 'Not Assigned'}</span>
                              </div>
                            </div>
                            <div className="hk-item">
                              <label>Cleaning Schedule</label>
                              <div className="hk-val">
                                <Clock size={14} />
                                <span>{schedule || 'Not Scheduled'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return <p className="no-members">No housekeeping data available for this floor.</p>;
                    })()}
                  </div>
                </section>
              </div>

              <div className="details-right">
                <div className="energy-usage-card admin-view">
                  <header className="energy-header">
                    <div className="energy-title-group">
                      <h2>Electricity Consumption</h2>
                    </div>
                    <div className="energy-tabs">
                      {['Day', 'Week', 'Month'].map(tab => (
                        <button 
                          key={tab} 
                          className={`energy-tab ${activeEnergyTab === tab ? 'active' : ''}`}
                          onClick={() => setActiveEnergyTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </header>

                  <div className="energy-controls">
                    <div className="appliance-selector">
                      <button className={`appliance-btn ${activeAppliance === 'Fan' ? 'active fan' : ''}`} onClick={() => setActiveAppliance('Fan')}>
                        <Wind size={16} /> <span>Fan</span>
                      </button>
                      <button className={`appliance-btn ${activeAppliance === 'AC' ? 'active ac' : ''}`} onClick={() => setActiveAppliance('AC')}>
                        <Snowflake size={16} /> <span>AC</span>
                      </button>
                    </div>
                    <div className="unit-toggle">
                      <button className="unit-btn active"><DollarSign size={14} /></button>
                    </div>
                  </div>

                  <div className="energy-metrics">
                    <div className="metric">
                      <span className="metric-label">Current Cost</span>
                      <div className="metric-value-group">
                        <span className="currency">₹</span>
                        <span className="value">842</span>
                      </div>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Usage</span>
                      <div className="metric-value-group">
                        <span className="value">124</span>
                        <span className="unit">kWh</span>
                      </div>
                    </div>
                  </div>

                  <div className="energy-chart-container">
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="adminColorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#adminColorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign to Room {selectedRoom?.number}</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}><X size={24} /></button>
            </div>
            <div className="student-selector-list">
              {students.length === 0 ? (
                <p className="empty-msg-list">No registered students found.</p>
              ) : (
                students.map(student => (
                  <div key={student.id} className="student-select-item" onClick={() => assignStudent(student)}>
                    <div className="st-info">
                      <User size={18} />
                      <span>{student.name}</span>
                    </div>
                    <Plus size={16} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
