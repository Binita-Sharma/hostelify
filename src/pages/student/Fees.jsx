import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { CheckCircle, Clock, ReceiptText } from 'lucide-react';
import './Fees.css';

const Fees = () => {
  const { userData } = useAuth();
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const handlePay = async (id) => {
    try {
      const docRef = doc(db, 'fees', id);
      await updateDoc(docRef, { status: 'paid' });
      alert('Payment successful!');
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  useEffect(() => {
    if (!userData?.name) return;

    // Fetch fees assigned to this student name
    const q = query(
      collection(db, 'fees'), 
      where('student', '==', userData.name),
      orderBy('due', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeeRecords(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fees:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const totalPaid = feeRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalPending = feeRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div className="student-fees-page">
      <header className="fees-header">
        <span className="header-label">FINANCES</span>
        <h1>Fees & payments</h1>
      </header>

      <section className="fees-stats">
        <div className="stat-card">
          <div className="icon-wrapper paid">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">PAID</span>
            <div className="stat-value">₹ {totalPaid.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-wrapper pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">PENDING</span>
            <div className="stat-value">₹ {totalPending.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="icon-wrapper entries">
            <ReceiptText size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">TOTAL ENTRIES</span>
            <div className="stat-value">{feeRecords.length}</div>
          </div>
        </div>
      </section>

      <main className="fees-content-card">
        <div className="content-header">
          <h2>Payment history</h2>
        </div>

        <div className="fees-table-container">
          <table className="fees-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Semester</th>
                <th>Amount</th>
                <th>Due date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {feeRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.description}</td>
                  <td>{record.semester}</td>
                  <td>₹{(Number(record.amount) || 0).toLocaleString()}</td>
                  <td>{record.due}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {record.status === 'pending' && (
                      <button 
                        className="pay-now-btn"
                        onClick={() => handlePay(record.id)}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && feeRecords.length === 0 && (
            <div className="empty-state">
              No fee records yet.
            </div>
          )}
          {loading && (
            <div className="empty-state">
              Loading your records...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Fees;
