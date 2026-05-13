import  { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  UserPlus,
  Plus,
  ArrowLeft,
  User,
  X,
  Check,
  Calendar,
  Clock
} from 'lucide-react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import './Housekeeping.css';

const AdminHousekeeping = () => {
  const [activeBlock, setActiveBlock] = useState(null);
  const [housekeepers, setHousekeepers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [schedules, setSchedules] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null); // stores floor number
  const [showScheduleModal, setShowScheduleModal] = useState(null); // stores floor number
  const [newHousekeeper, setNewHousekeeper] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const blocks = [
    { id: 'A', name: 'Block A', status: 'Optimal', rooms: 24 },
    { id: 'B', name: 'Block B', status: 'Cleaning', rooms: 18 },
    { id: 'C', name: 'Block C', status: 'Pending', rooms: 20 },
    { id: 'D', name: 'Block D', status: 'Optimal', rooms: 22 },
    { id: 'E', name: 'Block E', status: 'Alert', rooms: 15 },
  ];

  const floors = [1, 2, 3, 5, 6];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // Fetch housekeepers
    const housekeepersRef = ref(realtimeDB, 'housekeepers');
    const unsubscribeHK = onValue(housekeepersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setHousekeepers(Object.entries(data).map(([id, hk]) => ({ id, ...hk })));
      } else {
        setHousekeepers([]);
      }
    });

    // Fetch assignments
    const assignmentsRef = ref(realtimeDB, 'housekeeping_assignments');
    const unsubscribeAssign = onValue(assignmentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAssignments(data);
      } else {
        setAssignments({});
      }
    });

    // Fetch schedules
    const schedulesRef = ref(realtimeDB, 'housekeeping_schedules');
    const unsubscribeSched = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSchedules(data);
      } else {
        setSchedules({});
      }
    });

    return () => {
      unsubscribeHK();
      unsubscribeAssign();
      unsubscribeSched();
    };
  }, []);

  const handleAddHousekeeper = async (e) => {
    e.preventDefault();
    if (!newHousekeeper.name || !newHousekeeper.phone) return;
    setSaving(true);
    try {
      const hkRef = ref(realtimeDB, 'housekeepers');
      await push(hkRef, newHousekeeper);
      setShowAddModal(false);
      setNewHousekeeper({ name: '', phone: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (hkId) => {
    if (!activeBlock || !showAssignModal) return;
    try {
      const assignmentPath = `housekeeping_assignments/${activeBlock.id}/${showAssignModal}`;
      await set(ref(realtimeDB, assignmentPath), hkId);
      setShowAssignModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchedule = async (day) => {
    if (!activeBlock || !showScheduleModal) return;
    try {
      const schedulePath = `housekeeping_schedules/${activeBlock.id}/${showScheduleModal}`;
      await set(ref(realtimeDB, schedulePath), day);
      setShowScheduleModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getAssignedHK = (blockId, floorNo) => {
    const hkId = assignments[blockId]?.[floorNo];
    return housekeepers.find(hk => hk.id === hkId);
  };

  const getSchedule = (blockId, floorNo) => {
    return schedules[blockId]?.[floorNo];
  };

  if (activeBlock) {
    return (
      <div className="housekeeping-v2 animate-fade-in">
        <header className="page-header-v2">
          <button className="back-btn" onClick={() => setActiveBlock(null)}>
            <ArrowLeft size={20} />
            <span>Back to Blocks</span>
          </button>
          <div className="header-main">
            <div className="block-title-large">
              <h1>{activeBlock.name}</h1>
              <p>Managing floors and staff assignment</p>
            </div>
            <button className="add-hk-btn" onClick={() => setShowAddModal(true)}>
              <UserPlus size={18} />
              <span>Add Housekeeper</span>
            </button>
          </div>
        </header>

        <div className="floors-grid">
          {floors.map(floor => {
            const assignedHK = getAssignedHK(activeBlock.id, floor);
            const schedule = getSchedule(activeBlock.id, floor);
            return (
              <div key={floor} className="floor-card">
                <div className="floor-card-top">
                  <div className="floor-number">Floor {floor}</div>
                  {schedule && (
                    <div className="floor-schedule-tag">
                      <Calendar size={12} />
                      <span>{schedule}</span>
                    </div>
                  )}
                </div>
                
                <div className="floor-content">
                  {assignedHK ? (
                    <div className="assigned-hk-info">
                      <div className="hk-avatar">
                        <User size={20} />
                      </div>
                      <div className="hk-details">
                        <span className="hk-name">{assignedHK.name}</span>
                        <span className="hk-phone">{assignedHK.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="unassigned-state">
                      <Shield size={24} className="icon-muted" />
                      <span>No staff assigned</span>
                    </div>
                  )}
                  
                  <div className="floor-card-actions">
                    <button 
                      className={`assign-btn ${assignedHK ? 'reassign' : ''}`}
                      onClick={() => setShowAssignModal(floor)}
                    >
                      {assignedHK ? 'Reassign' : 'Assign Staff'}
                    </button>
                    <button 
                      className="schedule-btn-v2"
                      onClick={() => setShowScheduleModal(floor)}
                    >
                      <Clock size={16} />
                      <span>Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modals */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content-hk animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Housekeeper</h2>
                <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddHousekeeper} className="modal-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter name..." 
                    value={newHousekeeper.name}
                    onChange={e => setNewHousekeeper({...newHousekeeper, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter phone..." 
                    value={newHousekeeper.phone}
                    onChange={e => setNewHousekeeper({...newHousekeeper, phone: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="submit-btn-premium" disabled={saving}>
                  {saving ? 'Adding...' : 'Register Staff'}
                </button>
              </form>
            </div>
          </div>
        )}

        {showAssignModal && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(null)}>
            <div className="modal-content-hk animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-group">
                  <h2>Assign Housekeeper</h2>
                  <p>Floor {showAssignModal}, {activeBlock.name}</p>
                </div>
                <button onClick={() => setShowAssignModal(null)}><X size={20} /></button>
              </div>
              
              <div className="hk-selection-list">
                {housekeepers.length === 0 ? (
                  <div className="no-hk-state">
                    <UserPlus size={40} />
                    <p>No housekeepers found.</p>
                    <span>Please add a housekeeper first.</span>
                    <button className="link-btn" onClick={() => { setShowAssignModal(null); setShowAddModal(true); }}>
                      Add Housekeeper Now
                    </button>
                  </div>
                ) : (
                  housekeepers.map(hk => (
                    <div key={hk.id} className="hk-select-item" onClick={() => handleAssign(hk.id)}>
                      <div className="hk-item-info">
                        <div className="item-avatar">{hk.name.charAt(0)}</div>
                        <div className="item-text">
                          <span className="item-name">{hk.name}</span>
                          <span className="item-phone">{hk.phone}</span>
                        </div>
                      </div>
                      <div className="select-action">
                        {assignments[activeBlock.id]?.[showAssignModal] === hk.id ? (
                          <Check size={18} className="icon-success" />
                        ) : (
                          <Plus size={18} />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showScheduleModal && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(null)}>
            <div className="modal-content-hk animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title-group">
                  <h2>Schedule Cleaning</h2>
                  <p>Floor {showScheduleModal}, {activeBlock.name}</p>
                </div>
                <button onClick={() => setShowScheduleModal(null)}><X size={20} /></button>
              </div>
              
              <div className="day-selection-grid">
                {days.map(day => (
                  <button 
                    key={day} 
                    className={`day-btn ${getSchedule(activeBlock.id, showScheduleModal) === day ? 'active' : ''}`}
                    onClick={() => handleSchedule(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="housekeeping-v2 animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <div className="badge-premium">
            <Sparkles size={12} />
            <span>Facilities Management</span>
          </div>
          <h1>Housekeeping</h1>
          <p>Monitor cleanliness and maintenance across all hostel blocks.</p>
        </div>
      </header>

      <div className="blocks-grid">
        {blocks.map((block) => {
          const staffCount = assignments[block.id] ? Object.keys(assignments[block.id]).length : 0;
          return (
            <div 
              key={block.id} 
              className="block-card-premium"
              onClick={() => setActiveBlock(block)}
            >
              <div className="card-bg-gradient"></div>
              
              <div className="card-content">
                <div className="block-icon-wrapper">
                  <Building2 size={24} />
                  <div className={`status-indicator ${block.status.toLowerCase()}`}></div>
                </div>
                
                <div className="block-info-main">
                  <h2>{block.name}</h2>
                  <span className="block-status-text">{block.status} Status</span>
                </div>

                <div className="block-stats-mini">
                  <div className="mini-stat">
                    <Layers size={14} />
                    <span>{block.rooms} Rooms</span>
                  </div>
                  <div className="mini-stat">
                    <Shield size={14} />
                    <span>{staffCount} Staff Assigned</span>
                  </div>
                </div>

                <button className="view-details-btn">
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="block-letter-bg">{block.id}</div>
            </div>
          );
        })}

        <div className="block-card-add">
          <div className="add-content">
            <div className="plus-icon">+</div>
            <span>New Block</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHousekeeping;
