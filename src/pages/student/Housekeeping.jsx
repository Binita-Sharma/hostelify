import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, get } from 'firebase/database';
import { 
  Sparkles, 
  User, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Info,
  MapPin,
  Building2,
  RefreshCw
} from 'lucide-react';
import './Housekeeping.css';

const StudentHousekeeping = () => {
  const { userData } = useAuth();
  const [liveStudentData, setLiveStudentData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [housekeeper, setHousekeeper] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    // 1. Monitor student profile for room changes IN REAL TIME
    const studentRef = ref(realtimeDB, `students/${userData.uid}`);
    const unsubscribeStudent = onValue(studentRef, (snapshot) => {
      const student = snapshot.val();
      setLiveStudentData(student);
      const roomNum = student?.roomNumber;

      if (!roomNum) {
        setRoomData(null);
        setLoading(false);
        return;
      }

      // 2. Fetch all rooms to find matching details
      const roomsRef = ref(realtimeDB, 'rooms');
      onValue(roomsRef, (roomsSnap) => {
        const rooms = roomsSnap.val();
        if (!rooms) {
          setLoading(false);
          return;
        }

        const myRoom = Object.values(rooms).find(r => r.number.toString() === roomNum.toString());
        if (!myRoom) {
          setRoomData(null);
          setLoading(false);
          return;
        }

        setRoomData(myRoom);
        const blockId = myRoom.block;
        // Handle "1st", "Floor 1", "1" etc.
        const floorNo = parseInt(myRoom.floor.toString().replace(/\D/g, ''));

        if (blockId && !isNaN(floorNo)) {
          // 3. Listen to Housekeeping Assignment
          const assignPath = `housekeeping_assignments/${blockId}/${floorNo}`;
          onValue(ref(realtimeDB, assignPath), (assignSnap) => {
            const hkId = assignSnap.val();
            if (hkId) {
              const hkInfoRef = ref(realtimeDB, `housekeepers/${hkId}`);
              onValue(hkInfoRef, (hkSnap) => {
                setHousekeeper(hkSnap.val());
              });
            } else {
              setHousekeeper(null);
            }
          });

          // 4. Listen to Schedule
          const schedPath = `housekeeping_schedules/${blockId}/${floorNo}`;
          onValue(ref(realtimeDB, schedPath), (schedSnap) => {
            setSchedule(schedSnap.val());
          });
        }
        setLoading(false);
        setLastUpdated(new Date());
      });
    });

    return () => {
      unsubscribeStudent();
    };
  }, [userData?.uid]);

  const handleRefresh = () => {
    setLoading(true);
    // The listeners will naturally re-fire or we can just toggle loading
    setTimeout(() => setLoading(false), 500);
  };

  if (loading) return <div className="loading-state">Syncing with Facility Database...</div>;

  return (
    <div className="student-hk-container animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <h1>Housekeeping Status</h1>
          <p>Real-time updates for Floor {roomData?.floor || '...'}</p>
        </div>
        <button className="refresh-sync-btn" onClick={handleRefresh}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Sync Now</span>
        </button>
      </header>

      {!roomData ? (
        <div className="no-room-state">
          <Info size={48} />
          <h2>Connection Missing</h2>
          <p>We couldn't find an active room assignment for your student account.</p>
          
          <div className="debug-box">
            <div className="debug-item">
              <strong>Your Account UID:</strong>
              <span>{userData?.uid}</span>
            </div>
            <div className="debug-item">
              <strong>Live Room Property:</strong>
              <span className={liveStudentData?.roomNumber ? 'text-success' : 'text-error'}>
                {liveStudentData?.roomNumber || 'Empty/None'}
              </span>
            </div>
          </div>
          
          <p className="hint">
            <strong>Possible Reason:</strong> Although the Admin assigned a student to Room 101, it might not be the <em>exact same</em> account you are logged in as. 
            <br /><br />
            Please ask the Admin to check if they assigned the student with UID <code>{userData?.uid}</code> to the room.
          </p>
        </div>
      ) : (
        <div className="hk-content-grid">
          <div className="hk-main-card premium-shadow">
            <div className="card-header-accent"></div>
            <div className="hk-card-body">
              <div className="location-info">
                <div className="loc-item">
                  <Building2 size={20} />
                  <span>Block {roomData.block}</span>
                </div>
                <div className="loc-item">
                  <MapPin size={20} />
                  <span>Floor {roomData.floor}</span>
                </div>
              </div>
              
              <div className="schedule-hero">
                <div className="hero-icon">
                  <Calendar size={40} />
                </div>
                <div className="hero-text">
                  <span className="label">Planned Cleaning</span>
                  <h2 className="day-value">{schedule || 'TBA'}</h2>
                </div>
              </div>

              <div className="staff-info-section">
                <h3>Assigned Staff</h3>
                {housekeeper ? (
                  <div className="staff-card">
                    <div className="staff-avatar">{housekeeper.name.charAt(0)}</div>
                    <div className="staff-details">
                      <span className="staff-name">{housekeeper.name}</span>
                      <span className="staff-role">Verified Housekeeper</span>
                    </div>
                    <div className="verified-badge">
                      <ShieldCheck size={16} />
                      <span>Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-staff-warning">
                    <Info size={18} />
                    <span>No staff assigned to {roomData.block}, Floor {parseInt(roomData.floor.toString().replace(/\D/g, ''))} yet.</span>
                  </div>
                )}
              </div>
              
              <div className="last-sync">
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="hk-side-card premium-shadow">
            <h3>Facility Rules</h3>
            <ul className="guidelines-list">
              <li>
                <div className="g-icon"><Clock size={16} /></div>
                <div className="g-text">Standard cleaning: 10:00 AM - 12:00 PM.</div>
              </li>
              <li>
                <div className="g-icon"><Sparkles size={16} /></div>
                <div className="g-text">Clear all floor space for thorough cleaning.</div>
              </li>
              <li>
                <div className="g-icon"><User size={16} /></div>
                <div className="g-text">Report any issues via the Complaints section.</div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHousekeeping;
