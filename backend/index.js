import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Endpoints

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const users = db.get('users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get family members
app.get('/api/family-members', (req, res) => {
  const { familyId } = req.query;
  try {
    let members = db.get('family_members');
    if (familyId) {
      members = members.filter(m => m.familyId === familyId);
    }
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get medical records
app.get('/api/medical-records', (req, res) => {
  const { patientId } = req.query;
  try {
    let records = db.get('medical_records');
    if (patientId) {
      records = records.filter(r => r.patientId === patientId);
    }
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new medical record
app.post('/api/medical-records', (req, res) => {
  const { patientId, patientName, date, diagnosis, prescription, doctorName, notes } = req.body;
  const id = `MR${Date.now()}`;
  try {
    const newRecord = db.insert('medical_records', {
      id, patientId, patientName, date, diagnosis, prescription, doctorName, notes
    });
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new appointment
app.post('/api/appointments', (req, res) => {
  const { id, patientId, patientName, familyId, doctorId, doctorName, specialty, date, time, status, notes } = req.body;
  const appointmentId = id || `APT${Date.now()}`;
  try {
    const newAppt = db.insert('appointments', {
      id: appointmentId, patientId, patientName, familyId, doctorId, doctorName, specialty, date, time, status: status || 'scheduled', notes
    });

    // Automatically create a notification for the doctor
    const notifId = `NOT${Date.now()}`;
    db.insert('notifications', {
      id: notifId,
      type: 'appointment',
      title: 'New Appointment Booked',
      message: `${patientName} has booked an appointment regarding: ${notes || 'No symptoms specified'}.`,
      timestamp: new Date().toISOString(),
      read: false
    });

    res.status(201).json(newAppt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status (Confirm/Reject/Complete)
app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = db.update('appointments', id, { status });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new family group
app.post('/api/family-groups', (req, res) => {
  const { id, name } = req.body;
  try {
    const newGroup = db.insert('family_groups', { id, name });
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all family groups
app.get('/api/family-groups', (req, res) => {
  try {
    const groups = db.get('family_groups');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctors
app.get('/api/doctors', (req, res) => {
  try {
    const doctors = db.get('doctors');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new family member
app.post('/api/family-members', (req, res) => {
  const { name, relation, age, bloodGroup, familyId } = req.body;
  const id = `PAT${Date.now()}`;
  try {
    const newMember = db.insert('family_members', {
      id, name, relation, age, bloodGroup, familyId: familyId || 'FAM001'
    });
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments
app.get('/api/appointments', (req, res) => {
  const { familyId, patientId } = req.query;
  try {
    let appts = db.get('appointments');
    if (familyId) {
      appts = appts.filter(a => a.familyId === familyId);
    }
    if (patientId) {
      appts = appts.filter(a => a.patientId === patientId);
    }
    res.json(appts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notifications
app.get('/api/notifications', (req, res) => {
  try {
    const notifs = db.get('notifications');
    const sorted = [...notifs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  try {
    const updated = db.update('notifications', id, { read: true });
    if (updated) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new notification
app.post('/api/notifications', (req, res) => {
  const { id, type, title, message, timestamp, read } = req.body;
  const notifId = id || `NOT${Date.now()}`;
  try {
    const newNotif = db.insert('notifications', {
      id: notifId, type, title, message, timestamp: timestamp || new Date().toISOString(), read: read || false
    });
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
