import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue } from 'firebase/database';
import { Search, MapPin, Star, Calendar, Clock, ChevronRight, X, Info, CheckCircle } from 'lucide-react';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);

  // Generate next 7 days
  const days = [];
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date();
    nextDay.setDate(today.getDate() + i);
    days.push({
      name: weekDays[nextDay.getDay()],
      date: nextDay.getDate(),
      full: nextDay
    });
  }

  const times = ['10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm', '12:30 pm', '01:00 pm', '01:30 pm', '02:00 pm'];

  const specialties = [
    'All',
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ];

  useEffect(() => {
    const doctorsRef = ref(realtimeDB, 'doctors');
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const doctorList = Object.entries(data).map(([id, doc]) => ({
          id,
          ...doc
        }));
        setDoctors(doctorList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    if (!doc) return false;
    const specialty = doc.specialty || '';
    const name = doc.name || '';
    const matchesSpecialty = activeSpecialty === 'All' || specialty === activeSpecialty;
    const matchesSearch = name.toLowerCase().includes((searchTerm || '').toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="doctors-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Medical Assistance</h1>
          <p>Book appointments with professional doctors from our hostel network.</p>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search doctors by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="doctors-content">
        <aside className="specialty-sidebar">
          {specialties.map(specialty => (
            <button 
              key={specialty} 
              className={`specialty-btn ${activeSpecialty === specialty ? 'active' : ''}`}
              onClick={() => setActiveSpecialty(specialty)}
            >
              {specialty}
            </button>
          ))}
        </aside>

        <main className="doctors-grid">
          {loading ? (
            <div className="loading-state">Loading doctors...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="empty-state">No doctors found matching your criteria.</div>
          ) : (
            filteredDoctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-image-wrapper">
                  <img src={doctor.image} alt={doctor.name} />
                  <div className={`availability-badge ${(doctor.availability || 'Available').toLowerCase()}`}>
                    <div className="status-dot"></div>
                    {doctor.availability || 'Available'}
                  </div>
                </div>
                <div className="doctor-info">
                  <h3 className="doctor-name">{doctor.name}</h3>
                  <p className="doctor-specialty">{doctor.specialty}</p>
                  <div className="doctor-stats">
                    <div className="stat">
                      <Star size={14} className="star-icon" />
                      <span>4.8</span>
                    </div>
                    <div className="stat">
                      <Clock size={14} />
                      <span>9:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                  <button 
                    className="book-btn"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setShowModal(true);
                    }}
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {showModal && selectedDoctor && (
        <div className="modal-overlay doctor-modal" onClick={() => setShowModal(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            
            <div className="doctor-detail-header">
              <div className="doctor-detail-img-box">
                <img src={selectedDoctor.image} alt={selectedDoctor.name} />
              </div>
              <div className="doctor-detail-info">
                <div className="name-verify">
                  <h2>{selectedDoctor.name}</h2>
                  <CheckCircle size={20} className="verify-icon" />
                </div>
                <div className="qual-exp">
                  <span>{selectedDoctor.qualifications || 'MBBS'} - {selectedDoctor.specialty}</span>
                  <span className="exp-badge">{selectedDoctor.experience || '3 Years'}</span>
                </div>
                <div className="about-section">
                  <div className="about-title">
                    About <Info size={16} />
                  </div>
                  <p>{selectedDoctor.about || 'No description available for this doctor.'}</p>
                </div>
                <div className="fee-info">
                  Appointment fee: <span>{selectedDoctor.fee || '$60'}</span>
                </div>
              </div>
            </div>

            <div className="booking-slots-container">
              <h3>Booking slots</h3>
              <div className="days-row">
                {days.map((day, idx) => (
                  <button 
                    key={idx} 
                    className={`day-slot ${selectedDay === idx ? 'active' : ''}`}
                    onClick={() => setSelectedDay(idx)}
                  >
                    <span className="day-name">{day.name}</span>
                    <span className="day-date">{day.date}</span>
                  </button>
                ))}
              </div>

              <div className="times-row">
                {times.map((time, idx) => (
                  <button 
                    key={idx} 
                    className={`time-slot ${selectedTime === time ? 'active' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <button 
                className="final-book-btn"
                disabled={!selectedTime}
                onClick={() => {
                  alert(`Appointment booked with ${selectedDoctor.name} on ${days[selectedDay].name} ${days[selectedDay].date} at ${selectedTime}`);
                  setShowModal(false);
                }}
              >
                Book an appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
