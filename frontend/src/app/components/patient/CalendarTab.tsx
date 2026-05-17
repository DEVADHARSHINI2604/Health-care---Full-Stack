import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { apiService } from '../../lib/api';
import { Appointment } from '../../lib/types';
import { Calendar as CalendarIcon, Clock, Bell } from 'lucide-react';
import { Button } from '../ui/button';

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const sessionUser = localStorage.getItem('user');
        const familyId = sessionUser ? JSON.parse(sessionUser).familyId : undefined;
        const data = await apiService.getAppointments(undefined, familyId);
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Get appointments for selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const appointmentsOnDate = appointments.filter(
    apt => apt.date === selectedDateStr
  );

  // Get all appointment dates for highlighting (ensure we handle date conversion safely)
  const appointmentDates = appointments.map(apt => {
    const d = new Date(apt.date);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  if (loading) return <div className="py-20 text-center font-bold text-slate-400">Synchronizing calendar matrix...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8">
          <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <CalendarIcon className="size-6 text-indigo-400" />
            Family Health Timeline
          </CardTitle>
          <CardDescription className="text-slate-400 font-bold">Integrated clinical mapping for your family unit</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-2xl border-none p-4"
            modifiers={{
              appointments: appointmentDates
            }}
            modifiersStyles={{
              appointments: { 
                fontWeight: '900',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                borderRadius: '8px'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Appointments on Selected Date */}
      <div className="space-y-6">
        <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between mb-2">
               <Badge className="bg-indigo-600 text-white border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">Active Schedule</Badge>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Date</p>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : 'Select a Date'}
            </CardTitle>
            <CardDescription className="font-bold text-slate-400 uppercase tracking-wider text-xs">
              {appointmentsOnDate.length > 0 
                ? `${appointmentsOnDate.length} CLINICAL EVENTS SCHEDULED`
                : 'NO PROTOCOLS DETECTED FOR THIS TEMPORAL SLOT'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-4">
            {appointmentsOnDate.length > 0 ? (
              appointmentsOnDate.map((appointment) => (
                <div key={appointment.id} className="border border-slate-100 rounded-[24px] p-5 space-y-3 bg-slate-50 hover:bg-white hover:shadow-xl transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
                          {appointment.doctorName?.[4] || 'D'}
                       </div>
                       <div>
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{appointment.doctorName}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist | {appointment.specialty}</p>
                       </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] transform group-hover:scale-110 transition-all uppercase tracking-widest">{appointment.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bell className="size-3.5" />
                      <span>Reminder Active</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed px-1 italic">{appointment.notes || "No clinical focus notes provided."}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
                 <CalendarIcon className="size-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-black text-sm uppercase tracking-tight">No Temporal Conflicts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Registry Reminders */}
        <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden p-8 relative">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bell className="size-24" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Network Feed</p>
              <h3 className="text-xl font-black mb-6 tracking-tight">Critical Notifications</h3>
              <div className="space-y-4">
                {appointments
                  .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
                  .slice(0, 2)
                  .map((appointment) => {
                    const daysUntil = Math.ceil(
                      (new Date(appointment.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                             <Bell className="size-4 text-indigo-300" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight text-white group-hover:text-indigo-300 transition-colors">{appointment.doctorName}</p>
                            <p className="text-[10px] font-bold text-slate-400">
                              {new Date(appointment.date).toLocaleDateString()} · {appointment.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={`font-black text-[9px] uppercase tracking-widest ${daysUntil <= 1 ? 'bg-rose-500' : 'bg-indigo-600'} text-white border-none`}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
