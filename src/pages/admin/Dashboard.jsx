import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { 
  Users, 
  DoorOpen, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    rooms: 0,
    occupancy: '0%',
    occupancyDetail: '0/0',
    openComplaints: 0,
    highPriority: 0,
    resolved: 0,
    pendingFees: 0,
    collectedFees: 0
  });

  const [complaintData, setComplaintData] = useState([]);
  const [feeData, setFeeData] = useState([]);

  const COLORS = ['#c25e4c', '#577c6a']; 

  useEffect(() => {
    // 1. Students Count
    const unsubscribeStudents = onSnapshot(query(collection(db, 'users'), where('role', '==', 'student')), (snap) => {
      setStats(prev => ({ ...prev, students: snap.size }));
    });

    // 2. Rooms & Occupancy
    const unsubscribeRooms = onSnapshot(collection(db, 'rooms'), (snap) => {
      const rooms = snap.docs.map(d => d.data());
      const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
      const totalOccupied = rooms.reduce((sum, r) => sum + (r.occupied || 0), 0);
      const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
      
      setStats(prev => ({ 
        ...prev, 
        rooms: snap.size,
        occupancy: `${occupancyRate}%`,
        occupancyDetail: `${totalOccupied}/${totalCapacity}`
      }));
    });

    // 3. Complaints Stats & Chart
    const unsubscribeComplaints = onSnapshot(collection(db, 'complaints'), (snap) => {
      const complaints = snap.docs.map(d => d.data());
      const open = complaints.filter(c => c.status !== 'Resolved').length;
      const high = complaints.filter(c => c.priority === 'high' && c.status !== 'Resolved').length;
      const resolved = complaints.filter(c => c.status === 'Resolved').length;

      setStats(prev => ({ 
        ...prev, 
        openComplaints: open,
        highPriority: high,
        resolved: resolved
      }));

      // Group by category for chart
      const categories = complaints.reduce((acc, curr) => {
        const cat = curr.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      
      setComplaintData(Object.entries(categories).map(([category, count]) => ({ category, count })));
    });

    // 4. Fees Stats & Chart
    const unsubscribeFees = onSnapshot(collection(db, 'fees'), (snap) => {
      const fees = snap.docs.map(d => d.data());
      const pending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const collected = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      setStats(prev => ({ 
        ...prev, 
        pendingFees: pending,
        collectedFees: collected
      }));

      setFeeData([
        { name: 'Paid', value: collected },
        { name: 'Pending', value: pending }
      ]);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeRooms();
      unsubscribeComplaints();
      unsubscribeFees();
    };
  }, []);

  return (
    <div className="admin-dashboard-v2 animate-fade-in">
      <header className="dashboard-header">
        <h1>Admin dashboard</h1>
      </header>

      <div className="stats-grid-v2">
        <div className="stat-card-v2">
          <div className="card-icon students"><Users size={20} /></div>
          <div className="card-content">
            <label>STUDENTS</label>
            <h3>{stats.students}</h3>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon rooms"><DoorOpen size={20} /></div>
          <div className="card-content">
            <label>ROOMS</label>
            <h3>{stats.rooms}</h3>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon occupancy"><CheckCircle2 size={20} /></div>
          <div className="card-content">
            <label>OCCUPANCY</label>
            <h3>{stats.occupancy}</h3>
            <span className="subtext">{stats.occupancyDetail}</span>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon complaints"><MessageSquare size={20} /></div>
          <div className="card-content">
            <label>OPEN COMPLAINTS</label>
            <h3>{stats.openComplaints}</h3>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon high-priority"><AlertTriangle size={20} /></div>
          <div className="card-content">
            <label>HIGH PRIORITY</label>
            <h3>{stats.highPriority}</h3>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon resolved"><CheckCircle2 size={20} /></div>
          <div className="card-content">
            <label>RESOLVED</label>
            <h3>{stats.resolved}</h3>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon fees"><IndianRupee size={20} /></div>
          <div className="card-content">
            <label>PENDING FEES</label>
            <h3>₹{stats.pendingFees.toLocaleString()}</h3>
          </div>
        </div>

        <div className="stat-card-v2">
          <div className="card-icon collected"><TrendingUp size={20} /></div>
          <div className="card-content">
            <label>COLLECTED</label>
            <h3>₹{stats.collectedFees.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="charts-container-v2">
        <div className="chart-box">
          <h3>Complaints by category</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={complaintData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="category" axisLine={true} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={true} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8f9fa' }}
                />
                <Bar dataKey="count" fill="#c25e4c" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-box">
          <h3>Fee collection</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="rect"
                  formatter={(value) => <span style={{ color: '#576574', fontSize: '14px', fontWeight: 600 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
