import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Users,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  X as CloseIcon,
  Calendar as CalendarIcon,
  Phone
} from 'lucide-react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import './Attendance.css';

const AdminAttendance = () => {
  const [activeBlock, setActiveBlock] = useState(null);
  const [activeFloor, setActiveFloor] = useState(null);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const blocks = [
    { id: 'A', name: 'Block A' },
    { id: 'B', name: 'Block B' },
    { id: 'C', name: 'Block C' },
    { id: 'D', name: 'Block D' },
    { id: 'E', name: 'Block E' },
  ];

  const floors = [1, 2, 3, 4, 5];

  useEffect(() => {
    // Fetch all required data
    const roomsRef = ref(realtimeDB, 'rooms');
    const studentsRef = ref(realtimeDB, 'students');
    const attendanceRef = ref(realtimeDB, `attendance/${todayDate}`);

    const unsubscribeRooms = onValue(roomsRef, (snap) => {
      setRooms(snap.val() ? Object.entries(snap.val()).map(([id, r]) => ({ id, ...r })) : []);
    });

    const unsubscribeStudents = onValue(studentsRef, (snap) => {
      setStudents(snap.val() ? Object.entries(snap.val()).map(([id, s]) => ({ id, ...s })) : []);
      setLoading(false);
    });

    const unsubscribeAttendance = onValue(attendanceRef, (snap) => {
      setAttendance(snap.val() || {});
    });

    return () => {
      unsubscribeRooms();
      unsubscribeStudents();
      unsubscribeAttendance();
    };
  }, [todayDate]);

  const getFilteredStudents = () => {
    if (!activeBlock || !activeFloor) return [];

    // 1. Find all rooms belonging to this Block and Floor
    const targetRooms = rooms.filter(r => {
      const roomBlock = r.block;
      const roomFloorNo = parseInt(r.floor.toString().replace(/\D/g, ''));
      return roomBlock === activeBlock.id && roomFloorNo === activeFloor;
    });

    // 2. Extract all students assigned to these rooms
    const assignedStudentIdentifiers = new Set();
    targetRooms.forEach(room => {
      (room.students || []).forEach(s => {
        if (typeof s === 'string') {
          assignedStudentIdentifiers.add(s.toLowerCase());
        } else if (s.id) {
          assignedStudentIdentifiers.add(s.id);
        }
      });
    });

    // 3. Filter the master students list
    return students.filter(student => {
      const isAssigned = assignedStudentIdentifiers.has(student.id) || 
                         assignedStudentIdentifiers.has(student.name.toLowerCase());
      
      if (!isAssigned) return false;

      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (student.rollNumber && student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });
  };

  const handleMarkAttendance = async (studentId, status) => {
    const path = `attendance/${todayDate}/${studentId}`;
    await set(ref(realtimeDB, path), {
      status,
      timestamp: new Date().toISOString(),
      markedBy: 'Admin'
    });
  };

  const handleSubmitAttendance = async () => {
    const floorStudents = getFilteredStudents();
    const allMarked = floorStudents.every(s => attendance[s.id]?.status);
    
    if (!allMarked) {
      alert("Please mark attendance for all students before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      // Create notices for each student
      const noticesRef = ref(realtimeDB, 'notices');
      const promises = floorStudents.map(student => {
        const status = attendance[student.id].status;
        const noticeId = `attendance_${student.id}_${todayDate}`;
        return set(ref(realtimeDB, `notices/${noticeId}`), {
          title: 'Daily Attendance Update',
          content: `Today You are ${status}.`,
          category: status === 'present' ? 'general' : 'urgent',
          createdAt: Date.now(),
          dateStr: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          targetStudentId: student.id, // Target specifically for this student
          isAttendanceNotice: true
        });
      });

      await Promise.all(promises);
      alert("Attendance successfully submitted! Notices sent to students.");
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const getBlockStats = (blockId) => {
    const blockRooms = rooms.filter(r => r.block === blockId);
    const blockRoomNumbers = blockRooms.map(r => r.number.toString());
    const blockStudents = students.filter(s => s.roomNumber && blockRoomNumbers.includes(s.roomNumber.toString()));
    
    const present = blockStudents.filter(s => attendance[s.id]?.status === 'present').length;
    const absent = blockStudents.filter(s => attendance[s.id]?.status === 'absent').length;
    
    return {
      total: blockStudents.length,
      present,
      absent,
      pending: blockStudents.length - (present + absent)
    };
  };

  const getFloorStats = (blockId, floorNo) => {
    const floorRooms = rooms.filter(r => r.block === blockId && parseInt(r.floor.toString().replace(/\D/g, '')) === floorNo);
    const floorRoomNumbers = floorRooms.map(r => r.number.toString());
    const floorStudents = students.filter(s => s.roomNumber && floorRoomNumbers.includes(s.roomNumber.toString()));
    
    const present = floorStudents.filter(s => attendance[s.id]?.status === 'present').length;
    const absent = floorStudents.filter(s => attendance[s.id]?.status === 'absent').length;
    
    return {
      total: floorStudents.length,
      present,
      absent,
      pending: floorStudents.length - (present + absent)
    };
  };

  if (loading) return <div className="loading-state">Initializing Attendance Records...</div>;

  // View: Block Selection
  if (!activeBlock) {
    return (
      <div className="attendance-container animate-fade-in">
        <header className="page-header">
          <div className="header-text">
            <div className="badge-premium">
              <UserCheck size={12} />
              <span>Daily Roll Call</span>
            </div>
            <h1>Hostel Attendance</h1>
            <p>Select a block to manage student presence for {new Date(todayDate).toLocaleDateString()}.</p>
          </div>
          <div className="date-selector-wrapper">
            <input 
              type="date" 
              value={todayDate} 
              onChange={(e) => setTodayDate(e.target.value)}
              className="date-picker-input"
            />
          </div>
        </header>

        <div className="blocks-grid">
          {blocks.map(block => {
            const stats = getBlockStats(block.id);
            return (
              <div 
                key={block.id} 
                className="block-card-premium attendance-theme"
                onClick={() => setActiveBlock(block)}
              >
                <div className="card-bg-gradient-primary"></div>
                <div className="card-content">
                  <div className="block-icon-wrapper primary">
                    <Building2 size={24} />
                  </div>
                  <div className="block-info-main">
                    <h2>{block.name}</h2>
                    <span className="block-status-text">
                      {stats.pending === 0 ? 'Marking Complete' : `${stats.pending} students pending`}
                    </span>
                  </div>
                  <div className="block-stats-mini">
                    <div className="mini-stat">
                      <Users size={14} />
                      <span>{stats.total} Total</span>
                    </div>
                    <div className="mini-stat success">
                      <CheckCircle2 size={14} />
                      <span>{stats.present} Present</span>
                    </div>
                  </div>
                  <button className="view-details-btn primary">
                    <span>Select Block</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="block-letter-bg">{block.id}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // View: Floor Selection
  if (activeBlock && !activeFloor) {
    return (
      <div className="attendance-container animate-fade-in">
        <header className="page-header-v2">
          <button className="back-btn" onClick={() => setActiveBlock(null)}>
            <ArrowLeft size={20} />
            <span>Back to Blocks</span>
          </button>
          <div className="header-main">
            <div className="block-title-large">
              <h1>{activeBlock.name} Floors</h1>
              <p>Attendance tracking for {todayDate}</p>
            </div>
          </div>
          <div className="date-selector-wrapper">
            <input 
              type="date" 
              value={todayDate} 
              onChange={(e) => setTodayDate(e.target.value)}
              className="date-picker-input"
            />
          </div>
        </header>

        <div className="floors-grid">
          {floors.map(floor => {
            const stats = getFloorStats(activeBlock.id, floor);
            return (
              <div key={floor} className="floor-card attendance-card" onClick={() => setActiveFloor(floor)}>
                <div className="floor-card-top">
                  <div className="floor-number">Floor {floor}</div>
                  <div className={`attendance-indicator ${stats.pending === 0 ? 'complete' : 'pending'}`}>
                    {stats.pending === 0 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    <span>{stats.pending === 0 ? 'Complete' : 'In Progress'}</span>
                  </div>
                </div>
                <div className="floor-content">
                  <div className="floor-stats-row">
                    <div className="f-stat present">
                      <span className="label">Present</span>
                      <span className="val">{stats.present}</span>
                    </div>
                    <div className="f-stat absent">
                      <span className="label">Absent</span>
                      <span className="val">{stats.absent}</span>
                    </div>
                    <div className="f-stat pending">
                      <span className="label">Remaining</span>
                      <span className="val">{stats.pending}</span>
                    </div>
                  </div>
                  <button className="assign-btn attendance-btn primary">
                    <span>Manage Floor</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // View: Student List (Marking Attendance)
  const floorStudents = getFilteredStudents();
  const allMarked = floorStudents.length > 0 && floorStudents.every(s => attendance[s.id]?.status);

  return (
    <div className="attendance-container animate-fade-in">
      <header className="page-header-v2">
        <div className="header-left-group">
          <button className="back-btn" onClick={() => setActiveFloor(null)}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-main">
            <div className="block-title-large">
              <h1>{activeBlock.name} • Floor {activeFloor}</h1>
              <div className="date-badge">
                <CalendarIcon size={14} />
                <span>{new Date(todayDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="attendance-header-actions">
          <button 
            className={`submit-attendance-btn ${allMarked ? 'ready' : 'incomplete'}`}
            disabled={!allMarked || submitting}
            onClick={handleSubmitAttendance}
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
          <div className="attendance-summary-header">
            <div className="summary-pill present">Present: {floorStudents.filter(s => attendance[s.id]?.status === 'present').length}</div>
            <div className="summary-pill absent">Absent: {floorStudents.filter(s => attendance[s.id]?.status === 'absent').length}</div>
          </div>
        </div>
      </header>

      <div className="attendance-table-card">
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or roll number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-actions">
             <span className="total-label">{floorStudents.length} Students found</span>
          </div>
        </div>

        <div className="attendance-list-container">
          {floorStudents.length === 0 ? (
            <div className="no-students-info">
              <Users size={48} />
              <p>No students assigned to Floor {activeFloor} in {activeBlock.name}.</p>
              <span>Please assign students to rooms in the Rooms section first.</span>
            </div>
          ) : (
            <div className="attendance-list">
              {floorStudents.map(student => {
                const status = attendance[student.id]?.status;
                return (
                  <div key={student.id} className={`attendance-row ${status || ''}`}>
                    <div className="student-profile-mini">
                      <div className="st-avatar">{student.name.charAt(0)}</div>
                      <div className="st-info">
                        <span className="st-name">{student.name}</span>
                        <span className="st-meta">Room {student.roomNumber} • {student.rollNumber || 'No Roll'}</span>
                      </div>
                    </div>

                    <div className="student-contact-col">
                      <span className="st-phone">{student.phone || 'No Phone'}</span>
                    </div>

                    <div className="attendance-actions-group">
                      <div className="attendance-actions">
                        <button 
                          className={`mark-btn present ${status === 'present' ? 'active' : ''}`}
                          onClick={() => handleMarkAttendance(student.id, 'present')}
                        >
                          <Check size={18} />
                          <span>Present</span>
                        </button>
                        <button 
                          className={`mark-btn absent ${status === 'absent' ? 'active' : ''}`}
                          onClick={() => handleMarkAttendance(student.id, 'absent')}
                        >
                          <CloseIcon size={18} />
                          <span>Absent</span>
                        </button>
                      </div>

                      <a 
                        href={`tel:${student.phone}`} 
                        className="call-student-btn"
                        title="Call Student"
                      >
                        <Phone size={18} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
