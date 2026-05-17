import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

// Initial data structure
const initialData = {
  users: [
    { id: 'U001', name: 'Kannan', email: 'kannan@example.com', role: 'patient', familyId: 'FAM001' }
  ],
  family_members: [
    { id: 'FM001', familyId: 'FAM001', name: 'Kannan', dateOfBirth: '1985-05-15', bloodGroup: 'O+', relation: 'Self', gender: 'Male', allergies: ['Penicillin', 'Peanuts'], chronicConditions: ['Hypertension'] },
    { id: 'FM002', familyId: 'FAM001', name: 'Maya', dateOfBirth: '1987-08-22', bloodGroup: 'A+', relation: 'Spouse', gender: 'Female', allergies: ['Latex'], chronicConditions: [] },
    { id: 'FM003', familyId: 'FAM001', name: 'Ananya', dateOfBirth: '2015-03-10', bloodGroup: 'O+', relation: 'Daughter', gender: 'Female', allergies: [], chronicConditions: ['Asthma'] }
  ],
  medical_records: [
    { id: 'MR001', patientId: 'FM001', patientName: 'Kannan', date: '2026-03-15', diagnosis: 'Hypertension - Regular Checkup', prescription: 'Amlodipine 5mg - Once daily', doctorName: 'Dr. Rajesh', notes: 'Blood pressure under control. Continue medication.' },
    { id: 'MR002', patientId: 'FM001', patientName: 'Kannan', date: '2026-01-20', diagnosis: 'Common Cold', prescription: 'Paracetamol 500mg - Twice daily for 3 days', doctorName: 'Dr. Michael Chen', notes: 'Rest and stay hydrated.' },
    { id: 'MR003', patientId: 'FM003', patientName: 'Ananya', date: '2026-02-28', diagnosis: 'Asthma - Follow-up', prescription: 'Albuterol Inhaler - As needed', doctorName: 'Dr. Priya', notes: 'Asthma well controlled. No recent episodes.' }
  ],
  appointments: [
    { id: 'APT001', patientId: 'FM001', patientName: 'Kannan', familyId: 'FAM001', doctorId: 'DOC001', doctorName: 'Dr. Rajesh', specialty: 'Cardiology', date: '2026-04-15', time: '10:00 AM', status: 'scheduled', notes: 'Regular blood pressure checkup' },
    { id: 'APT002', patientId: 'FM002', patientName: 'Maya', familyId: 'FAM001', doctorId: 'DOC003', doctorName: 'Dr. Vikram', specialty: 'General Medicine', date: '2026-04-10', time: '2:00 PM', status: 'scheduled', notes: 'Annual health checkup' },
    { id: 'APT003', patientId: 'FM003', patientName: 'Ananya', familyId: 'FAM001', doctorId: 'DOC002', doctorName: 'Dr. Priya', specialty: 'Pediatrics', date: '2026-04-08', time: '11:30 AM', status: 'scheduled', notes: 'Asthma follow-up' }
  ],
  doctors: [
    { id: 'DOC001', name: 'Dr. Rajesh', specialty: 'Cardiology', email: 'rajesh@hospital.com', phone: '+91-98765-43210', location: 'City Medical Center', distance: '2.5 km', rating: 4.8, experience: 15, availability: ['Mon', 'Wed', 'Fri'] },
    { id: 'DOC002', name: 'Dr. Priya', specialty: 'Pediatrics', email: 'priya@hospital.com', phone: '+91-98765-43211', location: 'Children\'s Clinic', distance: '1.8 km', rating: 4.9, experience: 12, availability: ['Mon', 'Tue', 'Thu'] },
    { id: 'DOC003', name: 'Dr. Vikram', specialty: 'General Medicine', email: 'vikram@hospital.com', phone: '+91-98765-43212', location: 'Metro Hospital', distance: '3.2 km', rating: 4.7, experience: 20, availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }
  ],
  notifications: [
    { id: 'NOT001', type: 'reminder', title: 'Appointment Reminder', message: 'You have an appointment with Dr. Rajesh tomorrow at 10:00 AM', timestamp: '2026-04-06T09:00:00', read: false },
    { id: 'NOT002', type: 'appointment', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Priya has been confirmed for April 8th', timestamp: '2026-04-05T14:30:00', read: false },
    { id: 'NOT003', type: 'system', title: 'Medical Records Updated', message: 'New medical record has been added to your profile', timestamp: '2026-04-04T11:15:00', read: true }
  ]
};

class JsonDb {
  constructor() {
    if (!fs.existsSync(DB_PATH)) {
      this.save(initialData);
    }
  }

  read() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  }

  save(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  get(collection) {
    return this.read()[collection] || [];
  }

  insert(collection, item) {
    const data = this.read();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    this.save(data);
    return item;
  }

  update(collection, id, updates) {
    const data = this.read();
    if (!data[collection]) return null;
    const index = data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    data[collection][index] = { ...data[collection][index], ...updates };
    this.save(data);
    return data[collection][index];
  }
}

const db = new JsonDb();

export default db;
export const seedData = () => {}; // No-op for compatibility
