export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  familyId?: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  bloodGroup: string;
  relation: string;
  gender?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  doctorName: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  familyId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  location: string;
  distance: string;
  rating: number;
  experience: number;
  hospital: string;
  hospitalLocation: string;
  availability: string[];
}

export interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
}
