import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { apiService } from '../../lib/api';
import { Appointment } from '../../lib/types';
import { Calendar, Clock, User, MapPin, FileText } from 'lucide-react';
import { Separator } from '../ui/separator';

import { useLanguage } from '../../lib/LanguageContext';

export function AppointmentsTab() {
  const { t } = useLanguage();
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

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' || apt.status === 'pending' || apt.status === 'confirmed'
  );
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  if (loading) {
    return <div className="py-8 text-center">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            Upcoming Appointments
          </h3>
          <Badge>{upcomingAppointments.length} scheduled</Badge>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {appointment.specialty}
                        <Badge variant="outline" className="text-[10px] font-bold border-indigo-100 text-indigo-600">
                          {appointment.id}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Badge className={
                      appointment.status === 'pending' 
                        ? 'bg-amber-500 text-white border-none animate-pulse'
                        : appointment.status === 'confirmed'
                        ? 'bg-emerald-600 text-white border-none'
                        : 'bg-indigo-600 text-white border-none'
                    }>
                      {t(appointment.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="size-4 text-gray-500" />
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium">{appointment.patientName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-4 text-gray-500" />
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4 text-gray-500" />
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm bg-slate-50 p-2 rounded-lg mt-1">
                      <MapPin className="size-4 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 text-[11px] uppercase tracking-tight">Apollo Main / Chennai Central</p>
                        <p className="text-[10px] text-slate-500">Verified Location · Virtual Check-in Enabled</p>
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="size-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-gray-600">Notes:</span>
                          <p className="text-gray-700 mt-1">{appointment.notes}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Reschedule
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No upcoming appointments
            </CardContent>
          </Card>
        )}
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Appointments</CardDescription>
            <CardTitle className="text-3xl">{appointments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {upcomingAppointments.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {pastAppointments.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
