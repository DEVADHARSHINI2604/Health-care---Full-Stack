import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiService } from '../lib/api';
import { FamilyMember, Doctor, Appointment } from '../lib/types';
import { 
  LogOut, 
  Users, 
  Activity,
  Calendar,
  Stethoscope,
  BarChart3,
  Shield,
  Settings,
  TrendingUp,
  LayoutDashboard,
  Server,
  Zap
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { motion } from 'framer-motion';
import { useLanguage } from '../lib/LanguageContext';
import { LanguageSelector } from '../components/patient/LanguageSelector';
import { ProfileTab } from '../components/admin/ProfileTab';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<FamilyMember[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, p, a] = await Promise.all([
          apiService.getDoctors(),
          apiService.getFamilyMembers(),
          apiService.getAppointments()
        ]);
        setDoctors(d);
        setPatients(p);
        setAppointments(a);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  // Calculate statistics
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalAppointments = appointments.length;
  const activeAppointments = appointments.filter(a => a.status === 'scheduled').length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Admin Portal...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20"
              >
                <Shield className="size-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                  HealthPort <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">ADMIN</Badge>
                </h1>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{t('system_control')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block mr-2">
                <LanguageSelector />
              </div>
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl">
                <Settings className="size-4 mr-2" />
                {t('intelligence')}
              </Button>
              <div className="h-8 w-[1px] bg-slate-800 mx-2" />
              <Button variant="destructive" onClick={handleLogout} className="rounded-xl shadow-lg bg-red-600/90 hover:bg-red-600 shadow-red-900/20">
                <LogOut className="size-4 mr-2" />
                {t('secure_exit')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-transparent">
          <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl w-fit mb-8">
            <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
              <LayoutDashboard className="size-4 mr-2" />
              {t('intelligence')}
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
              <Users className="size-4 mr-2" />
              {t('population')}
            </TabsTrigger>
            <TabsTrigger value="doctors" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
              <Stethoscope className="size-4 mr-2" />
              {t('medical_staff')}
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
              <Calendar className="size-4 mr-2" />
              {t('operations')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md font-bold">
              <Shield className="size-4 mr-2" />
              {t('identity')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-0 animated-in">
            {/* Vibrant Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Patients", value: totalPatients, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Medical Staff", value: totalDoctors, icon: Stethoscope, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Active Queue", value: activeAppointments, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "System Uptime", value: "99.9%", icon: Zap, color: "text-purple-600", bg: "bg-purple-50" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-xl transition-all h-full bg-white group">
                    <CardHeader className="pb-2">
                      <div className={`p-3 rounded-2xl w-fit mb-4 transition-colors ${stat.bg} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`size-6 ${stat.color}`} />
                      </div>
                      <CardDescription className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-4xl font-black text-slate-800">{stat.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className={`h-full ${stat.color.replace('text', 'bg')}`} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Live Activity Matrix */}
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 font-black tracking-tight">System Performance</CardTitle>
                    <CardDescription className="font-medium">Real-time event stream</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs uppercase tracking-widest bg-white">
                    Download Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {appointments.slice(0, 5).map((apt, i) => (
                    <motion.div 
                      key={apt.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-indigo-100 p-2 rounded-xl">
                          <Activity className="size-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">New Consultation Booked</p>
                          <p className="text-sm font-medium text-slate-500">
                            {apt.patientName} → {apt.doctorName} ({apt.specialty})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{apt.time}</p>
                        <p className="text-xs font-bold text-slate-400">Just now</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <Card className="border-none shadow-xl shadow-slate-200/50">
              <CardHeader className="bg-indigo-600 text-white rounded-t-3xl pb-12">
                <CardTitle className="text-2xl font-black tracking-tight">Citizen Database</CardTitle>
                <CardDescription className="text-indigo-100 font-medium">All registered patients and families</CardDescription>
              </CardHeader>
              <CardContent className="p-0 -mt-8 mx-6 mb-6">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50 uppercase tracking-widest font-black text-[10px] text-slate-500">
                      <TableRow>
                        <TableHead className="py-4 px-6">Identity</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Family Link</TableHead>
                        <TableHead>Bio Data</TableHead>
                        <TableHead className="text-right px-6">Access Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.map((member) => (
                        <TableRow key={member.id} className="hover:bg-indigo-50/30 transition-colors">
                          <TableCell className="font-black text-indigo-600 px-6">{member.id}</TableCell>
                          <TableCell className="font-bold text-slate-800">{member.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-bold rounded-lg px-3 py-1 bg-slate-50 border-slate-200">
                              {member.familyId}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-500">
                            Relation: {member.relation} · Blood: {member.bloodGroup || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right px-6">
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-black px-4 py-1.5 rounded-full">
                              VERIFIED
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doctors" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <Card className="border-none shadow-xl bg-slate-900 text-white p-8 mb-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Stethoscope className="size-48" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black mb-2 tracking-tight">Manage Professionals</h2>
                  <p className="text-slate-400 font-medium max-w-md">Override availability, approve certifications, and manage staff credentials across the medical network.</p>
                </div>
              </Card>
              
              <Card className="border-none shadow-xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="border-none">
                        <TableHead className="px-8 py-5 text-xs font-black uppercase text-slate-400">Practitioner</TableHead>
                        <TableHead className="text-xs font-black uppercase text-slate-400">Discipline</TableHead>
                        <TableHead className="text-xs font-black uppercase text-slate-400">Tenure</TableHead>
                        <TableHead className="text-xs font-black uppercase text-slate-400">Performance</TableHead>
                        <TableHead className="text-right px-8 text-xs font-black uppercase text-slate-400">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor.id} className="hover:bg-slate-50/80 group">
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500">
                                {doctor.name.charAt(4)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{doctor.name}</p>
                                <p className="text-xs font-medium text-slate-500">{doctor.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-indigo-600">{doctor.specialty}</TableCell>
                          <TableCell className="font-medium text-slate-600">{doctor.experience} years</TableCell>
                          <TableCell>
                            <Badge className="bg-amber-50 text-amber-600 border-none font-black px-3 py-1">
                              {doctor.rating} ⭐
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <Button variant="ghost" className="rounded-xl font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              Manage Profile
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-0">
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black mb-1">Operational Queue</h2>
                  <p className="text-indigo-100 font-medium">Monitoring all hospital-wide clinical visits</p>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-none rounded-xl font-bold">
                    Filter Date
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader className="bg-slate-100/50">
                  <TableRow>
                    <TableHead className="px-8 py-4 text-[10px] font-black uppercase text-slate-500">Transaction ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-500">Participants</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-500">Timeline</TableHead>
                    <TableHead className="text-right px-8 text-[10px] font-black uppercase text-slate-500">Log Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="px-8 py-5 font-black text-slate-400">{appointment.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-slate-800">{appointment.patientName}</p>
                          <span className="text-slate-300 font-bold">→</span>
                          <p className="font-bold text-indigo-600">{appointment.doctorName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-slate-400" />
                          <span className="font-bold text-slate-700">{new Date(appointment.date).toLocaleDateString()}</span>
                          <Badge className="bg-slate-100 text-slate-600 border-none font-black ml-2">{appointment.time}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Badge 
                          className={`font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-lg ${
                            appointment.status === 'scheduled' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
