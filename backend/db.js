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
    { id: 'MR001', patientId: 'FM001', patientName: 'Kannan', date: '2026-03-15', diagnosis: 'Hypertension - Regular Checkup', prescription: 'Amlodipine 5mg - Once daily', doctorName: 'Dr. Rajesh', notes: 'Blood pressure under control.' }
  ],
  appointments: [],
  doctors: [],
  notifications: []
};

class JsonDb {
  constructor() {
    try {
      // FIX: safe file initialization
      if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
      }
    } catch (err) {
      console.log("DB Init Error:", err.message);
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.log("DB Read Error:", err.message);
      return initialData;
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
      console.log("DB Save Error:", err.message);
    }
  }

  get(collection) {
    const data = this.read();
    return data[collection] || [];
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

    data[collection][index] = {
      ...data[collection][index],
      ...updates
    };

    this.save(data);
    return data[collection][index];
  }
}

const db = new JsonDb();

export default db;
export const seedData = () => { };