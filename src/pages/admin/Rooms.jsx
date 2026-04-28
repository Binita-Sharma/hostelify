import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Bed, 
  UserPlus,
  X,
  User
} from 'lucide-react';
import './Rooms.css';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newRoom, setNewRoom] = useState({
    number: '',
    type: 'double',
    floor: '1st',
    block: 'A',
    capacity: 2
  });

  useEffect(() => {
    const qRooms = query(collection(db, 'rooms'));
    const unsubscribeRooms = onSnapshot(qRooms, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(data);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    const qStudents = query(collection(db, 'users'), (snap) => {
       // Handled below in different listener if needed, but we'll use a combined approach
    });
    
    // Fetch students separately for assignment
    const unsubscribeStudents = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data.filter(s => s.role === 'student'));
    });

    return () => { unsubscribeRooms(); unsubscribeStudents(); };
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'rooms'), {
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

  const assignStudent = async (studentName) => {
    if (!selectedRoom) return;
    if (selectedRoom.occupied >= selectedRoom.capacity) {
      alert("Room is full!");
      return;
    }
    
    setLoading(true);
    try {
      const roomRef = doc(db, 'rooms', selectedRoom.id);
      await updateDoc(roomRef, {
        students: arrayUnion(studentName),
        occupied: selectedRoom.occupied + 1
      });
      setShowAssignModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (id) => {
    if(window.confirm("Are you sure you want to delete this room?")) {
      await deleteDoc(doc(db, 'rooms', id));
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
            <div key={room.id} className="room-card-v2">
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
                {room.students?.map((s, idx) => (
                  <div key={idx} className="student-pill">
                    <span>{s}</span>
                    <User size={14} className="icon-prio" />
                  </div>
                ))}
                {(!room.students || room.students.length === 0) && (
                  <span className="no-students">Empty</span>
                )}
              </div>

              <div className="room-actions-v2">
                <button className="action-btn-v2 assign" onClick={() => { setSelectedRoom(room); setShowAssignModal(true); }}>
                  <UserPlus size={16} />
                  <span>Assign</span>
                </button>
                <button className="action-btn-v2 edit">
                  <Edit2 size={16} />
                </button>
                <button className="action-btn-v2 delete" onClick={() => deleteRoom(room.id)}>
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
                  <div key={student.id} className="student-select-item" onClick={() => assignStudent(student.name)}>
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
