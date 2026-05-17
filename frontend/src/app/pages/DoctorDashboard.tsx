import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiService } from '../lib/api';
import { Appointment } from '../lib/types';
import { 
  LogOut, 
  Calendar, 
  Clock, 
  Bell,
  X,
  FileText,
  Users,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLanguage } from '../lib/LanguageContext';
import { LanguageSelector } from '../components/patient/LanguageSelector';
import { ProfileTab } from '../components/doctor/ProfileTab';
import { generateUniqueId } from '../lib/utils';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('appointments');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Removed hardcoded doctor ID

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (!sessionUser) {
      navigate('/');
      return;
    }
    const user = JSON.parse(sessionUser);
    setCurrentUser(user);

    const fetchData = async () => {
      try {
        const [apptData, notifData] = await Promise.all([
          apiService.getAppointments(),
          apiService.getNotifications()
        ]);
        
        // Filter for this doctor using dynamic user ID
        const filtered = apptData.filter(a => a.doctorId === user.id);
        setAppointments(filtered);
        setUnreadCount(notifData.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showNotifications, navigate]);

  const handleStatusUpdate = async (id: string, status: Appointment['status'] | 'confirmed') => {
    try {
      await apiService.updateAppointmentStatus(id, status);
      toast.success(status === 'confirmed' ? 'Protocol Success: Appointment Synchronized.' : 'Protocol Alert: Appointment Terminated.');
      
      // Send notification to patient if confirmed
      if (status === 'confirmed') {
        const appt = appointments.find(a => a.id === id);
        if (appt) {
          await apiService.addNotification({
            id: generateUniqueId('NOT'),
            type: 'appointment',
            title: 'Appointment Confirm - HealthPort',
            message: `Your appointment with ${appt.doctorName} on ${appt.date} at ${appt.time} has been confirmed.`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }

      // Refresh data
      const apptData = await apiService.getAppointments();
      setAppointments(apptData.filter(a => a.doctorId === currentUser?.id));
    } catch (error) {
      toast.error('Synchronization failure: System busy.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Group appointments by date
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.date === today);
  const upcomingAppointments = appointments.filter(apt => apt.date > today);

  // Calculate stats
  const totalAppointments = appointments.length;
  const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200"
              >
                <Activity className="size-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('healthport_doctor')}</h1>
                <p className="text-sm font-medium text-indigo-600">{currentUser?.name || 'Professional'} - {currentUser?.specialty || 'General Practice'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block mr-2">
                <LanguageSelector />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className={`relative rounded-full transition-colors ${showNotifications ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-indigo-50'}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="size-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Separator orientation="vertical" className="h-8 mx-2" />
              <Button variant="ghost" onClick={handleLogout} className="text-slate-600 hover:text-red-600 hover:bg-red-50">
                <LogOut className="size-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <div className="relative z-[60]">
             <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 shadow-2xl bg-white border-l"
            >
              {/* Using a simpler version or reusing the notification panel */}
              <div className="h-full flex flex-col">
                <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0">
                  <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Bell className="size-5 text-indigo-600" />
                      {t('clinic_protocol')}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unreadCount} {t('notifications')}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => setShowNotifications(false)}>
                    <X className="size-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {appointments.length > 0 ? (
                    appointments.map(appt => (
                      <div key={appt.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-3">
                        <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                          {appt.patientName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{appt.patientName} scheduled</p>
                          <p className="text-xs text-slate-500 font-medium">{appt.time} at {appt.date}</p>
                          <p className="text-[10px] mt-2 font-black uppercase tracking-widest text-indigo-400">Appointment System</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <Bell className="size-12 text-slate-200 mb-4" />
                      <p className="font-bold text-slate-400">Systems Nominal</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Animated Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Today's List", value: todayAppointments.length, color: "text-indigo-600" },
            { label: "Upcoming", value: upcomingAppointments.length, color: "text-blue-600" },
            { label: "Completed", value: completedToday, color: "text-emerald-600" },
            { label: "Total Patients", value: totalAppointments, color: "text-slate-900" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {stat.label}
                  </CardDescription>
                  <CardTitle className={`text-4xl font-black ${stat.color}`}>
                    {stat.value}
                  </CardTitle>
                </CardHeader>
                <div className="px-6 pb-4">
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${stat.color.replace('text', 'bg')}`}
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
          <TabsList className="bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="appointments" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="size-4 mr-2" />
              {t('appointments')}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="size-4 mr-2" />
              {t('my_schedule')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="size-4 mr-2" />
              {t('identity')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-8 mt-8">
            {/* Today's Appointments */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="size-5 text-indigo-600" />
                <h3 className="font-bold text-xl text-slate-900">Today's Schedule</h3>
              </div>
              
              <AnimatePresence mode="popLayout">
                {todayAppointments.length > 0 ? (
                  <div className="grid gap-4">
                    {todayAppointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="overflow-hidden border-none shadow-sm hover:shadow-indigo-100 hover:shadow-lg transition-all border-l-4 border-l-indigo-600">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className="text-lg font-bold text-slate-800">{appointment.patientName}</CardTitle>
                                  <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none">
                                    {appointment.patientId}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px] font-black border-slate-200">
                                    {appointment.id}
                                  </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-4 text-slate-500 font-medium">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="size-4" />
                                    {appointment.time}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    Today
                                  </span>
                                </CardDescription>
                              </div>
                              <Badge className={
                                appointment.status === 'completed' 
                                  ? 'bg-emerald-50 text-emerald-600 border-none' 
                                  : appointment.status === 'pending'
                                  ? 'bg-amber-500 text-white border-none shadow-md animate-pulse'
                                  : 'bg-indigo-600 text-white border-none shadow-md'
                              }>
                                {t(appointment.status)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {appointment.notes && (
                              <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3">
                                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                  <FileText className="size-4 text-indigo-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Reason for Visit</p>
                                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{appointment.notes}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-3 pt-2">
                              {appointment.status === 'pending' && (
                                <>
                                  <Button 
                                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg transition-all rounded-xl"
                                  >
                                    <CheckCircle className="size-4 mr-2" />
                                    {t('confirm')}
                                  </Button>
                                  <Button 
                                    onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                    variant="outline" 
                                    className="flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50"
                                  >
                                    <X className="size-4 mr-2" />
                                    {t('reject')}
                                  </Button>
                                </>
                              )}
                              {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                                <>
                                  <Button 
                                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-lg transition-all rounded-xl"
                                  >
                                    <CheckCircle className="size-4 mr-2" />
                                    Consultation Complete
                                  </Button>
                                  <Button variant="outline" className="flex-1 rounded-xl">
                                    Patient History
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-2 bg-slate-50/50">
                    <CardContent className="py-16 text-center">
                      <Calendar className="size-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No consultations left for today</p>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </section>

            {/* Upcoming Appointments */}
            <section className="space-y-4 mt-12">
              <h3 className="font-bold text-xl text-slate-900">Queue for the Week</h3>
              
              {upcomingAppointments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                              {appointment.patientName}
                              <Badge variant="outline" className="text-[10px] font-bold border-indigo-100 text-indigo-600">
                                {appointment.id}
                              </Badge>
                            </CardTitle>
                            <Badge className={
                              appointment.status === 'pending' 
                                ? 'bg-amber-500 text-white border-none shadow-md animate-pulse'
                                : 'bg-indigo-600/10 text-indigo-600 border-none'
                            }>
                              {t(appointment.status)}
                            </Badge>
                          </div>
                          <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-indigo-50 transition-colors">
                            <Clock className="size-4 text-slate-600 group-hover:text-indigo-600" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 text-sm font-medium">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="size-4" />
                            <span>{new Date(appointment.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })} at {appointment.time}</span>
                          </div>
                          {appointment.notes && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                              "{appointment.notes}"
                            </p>
                          )}
                          
                          {appointment.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm"
                                onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg text-xs font-bold rounded-xl"
                              >
                                <CheckCircle className="size-3 mr-1.5" />
                                {t('confirm')}
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                className="flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50 text-xs font-bold"
                              >
                                {t('reject')}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No future bookings found.</p>
              )}
            </section>
          </TabsContent>

          <TabsContent value="schedule" className="mt-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Standard Availability</CardTitle>
                    <CardDescription>Managed via Hospital Administration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['Monday', 'Wednesday', 'Friday'].map((day) => (
                      <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-800">{day}</p>
                          <p className="text-sm text-slate-500">Full Shift: 09:00 AM - 05:00 PM</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-1">Active</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="border-none shadow-indigo-600/10 shadow-2xl bg-indigo-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Clock className="size-32" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white">Emergency Status</CardTitle>
                    <CardDescription className="text-indigo-100">Toggle on-call status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-6 rounded-xl">
                      Set On-Call
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-8">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
