import axios from 'axios';
import { FamilyMember, MedicalRecord, Appointment, Doctor, Notification } from './types';

const api = axios.create({
  baseURL: '/api',
});

export const apiService = {
  // Family Members
  getFamilyMembers: async (familyId?: string): Promise<FamilyMember[]> => {
    const response = await api.get('/family-members', { params: { familyId } });
    return response.data;
  },

  addFamilyMember: async (member: FamilyMember): Promise<FamilyMember> => {
    const response = await api.post('/family-members', member);
    return response.data;
  },

  // Medical Records
  getMedicalRecords: async (patientId?: string): Promise<MedicalRecord[]> => {
    const response = await api.get('/medical-records', { params: { patientId } });
    return response.data;
  },

  addMedicalRecord: async (record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
    const response = await api.post('/medical-records', record);
    return response.data;
  },

  // Appointments
  getAppointments: async (patientId?: string, familyId?: string): Promise<Appointment[]> => {
    const response = await api.get('/appointments', { params: { patientId, familyId } });
    return response.data;
  },

  addAppointment: async (appointment: Appointment): Promise<Appointment> => {
    const response = await api.post('/appointments', appointment);
    return response.data;
  },

  updateAppointmentStatus: async (id: string, status: Appointment['status'] | 'confirmed'): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}`, { status });
    return response.data;
  },

  // Family Groups
  getFamilyGroups: async (): Promise<any[]> => {
    const response = await api.get('/family-groups');
    return response.data;
  },

  addFamilyGroup: async (name: string, id: string): Promise<any> => {
    const response = await api.post('/family-groups', { id, name });
    return response.data;
  },

  // Doctors
  getDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/doctors');
    return response.data;
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markNotificationRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  
  addNotification: async (notification: any): Promise<void> => {
    await api.post('/notifications', notification);
  },

  getUsers: async (): Promise<any[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};
