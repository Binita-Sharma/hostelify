import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Info, CheckCircle, ArrowRight, Printer, RefreshCcw } from 'lucide-react';
import './Laundry.css';

const Laundry = () => {
  const { userData } = useAuth();
  const [givenDate, setGivenDate] = useState(new Date().toISOString().split('T')[0]);
  const [clothes, setClothes] = useState(Array(10).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [slipData, setSlipData] = useState(null);

  if (!userData?.laundryAssigned) {
    return (
      <div className="access-denied">
        <div className="denied-content">
          <RefreshCcw size={64} className="spin-icon" />
          <h1>Service Not Assigned</h1>
          <p>Please contact the hostel administrator to enable laundry services for your account.</p>
          <button className="btn-primary" onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleInputChange = (index, value) => {
    const newClothes = [...clothes];
    newClothes[index] = value;
    setClothes(newClothes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filledClothes = clothes.filter(item => item.trim() !== '');
    if (filledClothes.length === 0) {
      alert("Please enter at least one item of clothing.");
      return;
    }

    // Calculate expected return date (usually 3 days later)
    const date = new Date(givenDate);
    date.setDate(date.getDate() + 3);
    const returnDate = date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const newSlip = {
      id: 'LND' + Math.floor(100000 + Math.random() * 900000),
      studentName: userData.name,
      rollNumber: userData.rollNumber,
      givenDate: new Date(givenDate).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      returnDate: returnDate,
      items: filledClothes
    };

    setSlipData(newSlip);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setClothes(Array(10).fill(''));
    setSlipData(null);
  };

  if (submitted && slipData) {
    return (
      <div className="slip-container animate-fade-in">
        <div className="laundry-slip">
          <div className="slip-header">
            <div className="slip-logo">
              <CheckCircle size={32} />
              <span>Hostelify Laundry</span>
            </div>
            <div className="slip-id">
              <span>Slip ID:</span>
              <strong>{slipData.id}</strong>
            </div>
          </div>

          <div className="slip-body">
            <div className="student-info">
              <div className="info-item">
                <label>Student Name</label>
                <span>{slipData.studentName}</span>
              </div>
              <div className="info-item">
                <label>Roll Number</label>
                <span>{slipData.rollNumber}</span>
              </div>
            </div>

            <div className="dates-info">
              <div className="date-item">
                <label>Submission Date</label>
                <span>{slipData.givenDate}</span>
              </div>
              <div className="date-item highlight">
                <label>Expected Return</label>
                <span>{slipData.returnDate}</span>
              </div>
            </div>

            <div className="items-list">
              <label>Clothes List ({slipData.items.length} items)</label>
              <div className="items-grid">
                {slipData.items.map((item, idx) => (
                  <div key={idx} className="item-pill">
                    {idx + 1}. {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="slip-footer">
            <p>Please present this slip when collecting your laundry.</p>
            <div className="footer-actions">
              <button className="btn-print" onClick={() => window.print()}>
                <Printer size={18} /> Print Slip
              </button>
              <button className="btn-secondary" onClick={resetForm}>
                Submit New
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="laundry-page-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Laundry Service</h1>
          <p>Submit your daily laundry and track your submission.</p>
        </div>
      </header>

      <div className="laundry-content">
        <div className="submission-form-container">
          <form onSubmit={handleSubmit} className="laundry-form">
            <div className="form-section">
              <div className="section-title">
                <Calendar size={20} />
                <h3>Submission Date</h3>
              </div>
              <div className="date-picker-wrapper">
                <input 
                  type="date" 
                  value={givenDate}
                  onChange={(e) => setGivenDate(e.target.value)}
                  className="modern-date-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <CheckCircle size={20} />
                <h3>Clothes List (Max 10)</h3>
              </div>
              <div className="clothes-inputs-grid">
                {clothes.map((item, idx) => (
                  <div key={idx} className="input-group">
                    <span className="input-number">{idx + 1}</span>
                    <input 
                      type="text" 
                      placeholder="e.g., White Shirt"
                      value={item}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-laundry-btn">
              Generate Laundry Slip <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <aside className="instruction-sidebar">
          <div className="instruction-card">
            <div className="card-header">
              <Info size={24} />
              <h2>Instructions</h2>
            </div>
            <div className="instruction-body">
              <div className="instruction-item">
                <div className="dot"></div>
                <div>
                  <h4>Timing</h4>
                  <p>Submit between 8:00 AM to 11:00 AM.</p>
                </div>
              </div>
              <div className="instruction-item">
                <div className="dot"></div>
                <div>
                  <h4>What we accept</h4>
                  <p>Shirts, T-shirts, Jeans, Trousers, Bed sheets.</p>
                </div>
              </div>
              <div className="instruction-item">
                <div className="dot"></div>
                <div>
                  <h4>Prohibited Items</h4>
                  <p>Expensive blazers, delicate silks, or large rugs.</p>
                </div>
              </div>
              <div className="instruction-item warning">
                <Info size={16} />
                <p>Ensure no items are left in pockets before submission.</p>
              </div>
            </div>
          </div>

          <div className="status-summary-card">
            <h3>Quick Summary</h3>
            <div className="summary-stat">
              <span>Selected Date</span>
              <strong>{new Date(givenDate).toLocaleDateString()}</strong>
            </div>
            <div className="summary-stat">
              <span>Item Count</span>
              <strong>{clothes.filter(i => i.trim() !== '').length}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Laundry;
