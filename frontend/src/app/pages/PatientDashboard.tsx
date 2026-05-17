import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MedicalRecordsTab } from '../components/patient/MedicalRecordsTab';
import { AppointmentsTab } from '../components/patient/AppointmentsTab';
import { CalendarTab } from '../components/patient/CalendarTab';
import { FindDoctorsTab } from '../components/patient/FindDoctorsTab';
import { ChatbotPanel } from '../components/patient/ChatbotPanel';
import { VoiceAssistant } from '../components/patient/VoiceAssistant';
import { LanguageSelector } from '../components/patient/LanguageSelector';
import { NotificationPanel } from '../components/patient/NotificationPanel';
import { ProfileTab } from '../components/patient/ProfileTab';
import { apiService } from '../lib/api';
import { useLanguage } from '../lib/LanguageContext';
import { 
  LogOut, 
  FileText, 
  Calendar, 
  Stethoscope, 
  Bell,
  Activity,
  UserCircle,
  Plus,
  MapPin,
  Users
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

import { generateUniqueId } from '../lib/utils';
import { toast } from 'sonner';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('records');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [familyId, setFamilyId] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewFamilyModalOpen, setIsNewFamilyModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relation: '', age: '', bloodGroup: '' });
  const [newFamilyName, setNewFamilyName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relation || !newMember.bloodGroup) return;
    try {
      await apiService.addFamilyMember({
        ...newMember,
        id: generateUniqueId('PAT'),
        age: parseInt(newMember.age) || 0,
        familyId: familyId
      });
      setIsAddModalOpen(false);
      setNewMember({ name: '', relation: '', age: '', bloodGroup: '' });
      toast.success(t('status_updated') || 'Member added successfully');
      triggerRefresh();    } catch (error) {
      console.error('Error adding family member:', error);
    }
  };

  const handleRegisterFamily = async () => {
    if (!newFamilyName) return;
    try {
      const newId = generateUniqueId('FAM');
      await apiService.addFamilyGroup(newFamilyName, newId);
      toast.success(`${t('register_new_family')} Success: ${newId}`);
      setFamilyId(newId);
      setIsNewFamilyModalOpen(false);
      setNewFamilyName('');
    } catch (error) {
      toast.error('Registration failure.');
    }
  };

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
      setCurrentUser(user);
      setFamilyId(user.familyId);
    } else {
      navigate('/');
    }

    const fetchData = async () => {
      try {
        const [notifs, doctors] = await Promise.all([
          apiService.getNotifications(),
          apiService.getDoctors()
        ]);
        setUnreadCount(notifs.filter(n => !n.read).length);
        setAllDoctors(doctors);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, [showNotifications, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Premium Header */}
      <header className="bg-slate-900 sticky top-0 z-40 border-b border-indigo-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-900/50"
              >
                <Activity className="size-7 text-white" />
              </motion.div>
              <div className="hidden md:block h-10 w-[1px] bg-slate-800" />
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-white tracking-tighter leading-none mb-1">HEALTHPORT <span className="text-indigo-500">PRO</span></h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Family Clinical Matrix</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-4 px-6 py-2 bg-slate-800/50 rounded-2xl border border-slate-700 mr-4">
                 <div className="flex flex-col items-end">
                    <p className="text-xs font-black text-white">{currentUser?.name || "Initializing..."}</p>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{currentUser?.email}</p>
                 </div>
                 <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg">
                    {currentUser?.name?.[0] || "U"}
                 </div>
              </div>
              <LanguageSelector />
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl hover:bg-slate-800 text-slate-400"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="size-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-red-600 rounded-xl px-4 py-6 transition-all">
                <LogOut className="size-5 mr-2" />
                <span className="hidden sm:inline font-black uppercase tracking-widest text-[10.5px]">{t('logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Panel Overlay */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 shadow-2xl"
          >
            <NotificationPanel onClose={() => setShowNotifications(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Persistent User Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="lg:col-span-2 border-none shadow-xl bg-white overflow-hidden p-8 flex items-center gap-8 relative">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <UserCircle className="size-64" />
            </div>
            <div className="size-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
               <UserCircle className="size-14" />
            </div>
            <div className="flex-1 space-y-4">
               <div>
                  <Badge className="bg-indigo-100 text-indigo-700 border-none font-black px-3 py-1 rounded-full uppercase tracking-widest text-[10px] mb-3">Verified Family Record</Badge>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{currentUser?.name}</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Login ID: <span className="text-indigo-600 font-black">{currentUser?.email}</span></p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                     <Users className="size-4 text-indigo-500" />
                     <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Family Unit: <span className="text-indigo-600">{familyId}</span></span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                     <Activity className="size-4 text-emerald-500" />
                     <span className="text-xs font-black text-slate-600 uppercase tracking-tight">Status: <span className="text-emerald-600">Active</span></span>
                  </div>
               </div>
            </div>
          </Card>
          
          <Card className="border-none shadow-xl bg-indigo-600 text-white p-8 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Plus className="size-32" />
            </div>
            <div>
               <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Quick Actions</p>
               <h3 className="text-xl font-black tracking-tight mb-4">Extend Family Group</h3>
            </div>
            <div className="space-y-3">
               <Button onClick={() => setIsAddModalOpen(true)} className="w-full bg-white text-indigo-600 hover:bg-slate-50 rounded-2xl py-6 font-black text-xs uppercase tracking-widest transition-all">
                  <Plus className="size-4 mr-2" />
                  Register Core Member
               </Button>
               <Button onClick={() => setIsNewFamilyModalOpen(true)} variant="outline" className="w-full border-indigo-400 text-white hover:bg-indigo-500 rounded-2xl py-6 font-black text-xs uppercase tracking-widest transition-all">
                  <Plus className="size-4 mr-2" />
                  Init New Group
               </Button>
            </div>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-slate-100/50 p-1 rounded-xl w-fit">
              <TabsTrigger value="records" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="size-4 mr-2" />
                <span className="hidden sm:inline">{t('records')}</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="size-4 mr-2" />
                <span className="hidden sm:inline">{t('appointments')}</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Calendar className="size-4 mr-2" />
                <span className="hidden sm:inline">{t('calendar')}</span>
              </TabsTrigger>
              <TabsTrigger value="doctors" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Stethoscope className="size-4 mr-2" />
                <span className="hidden sm:inline">{t('doctors')}</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <UserCircle className="size-4 mr-2" />
                <span className="hidden sm:inline">{t('identity')}</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Dialog open={isNewFamilyModalOpen} onOpenChange={setIsNewFamilyModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all">
                    <Plus className="size-4 mr-2" />
                    {t('register_new_family')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
                  <div className="bg-indigo-600 p-8 text-white">
                    <DialogTitle className="text-3xl font-black mb-2 tracking-tighter">{t('register_new_family')}</DialogTitle>
                    <p className="text-indigo-100 font-bold">Initialize a new secure family group</p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Family Group Name</Label>
                      <Input 
                        placeholder="e.g. The Smith Family" 
                        value={newFamilyName} 
                        onChange={(e) => setNewFamilyName(e.target.value)}
                        className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold outline-none focus:ring-0"
                      />
                    </div>
                    <Button 
                      onClick={handleRegisterFamily} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-8 font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      INITIALIZE FAMILY
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
                    <Plus className="size-4 mr-2" />
                    {t('add_member')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
                  <div className="bg-indigo-600 p-8 text-white">
                    <DialogTitle className="text-3xl font-black mb-2 tracking-tighter">{t('family_archive')}</DialogTitle>
                    <p className="text-indigo-100 font-bold">{t('registering_new_participant')}</p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                      <Input 
                        placeholder="e.g. Maya Kannan" 
                        value={newMember.name} 
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold outline-none focus:ring-0"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Identity</Label>
                        <Select onValueChange={(v) => setNewMember({...newMember, relation: v})}>
                          <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold">
                            <SelectValue placeholder="Relation" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {['Father', 'Mother', 'Son', 'Daughter', 'Spouse'].map(r => (
                              <SelectItem key={r} value={r} className="font-bold">{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Age</Label>
                        <Input 
                          type="number" 
                          value={newMember.age} 
                          onChange={(e) => setNewMember({...newMember, age: e.target.value})}
                          className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold text-center"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Blood Group Analysis</Label>
                      <Select onValueChange={(v) => setNewMember({...newMember, bloodGroup: v})}>
                        <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold">
                          <SelectValue placeholder="Select Blood Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                            <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddMember} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-8 font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      COMMIT REGISTRATION
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="rounded-xl border-slate-200 shadow-sm text-xs font-semibold uppercase tracking-wider">
                <UserCircle className="size-4 mr-2" />
                Switch Member
              </Button>
            </div>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="records" className="mt-0 outline-none">
              <MedicalRecordsTab />
            </TabsContent>

            <TabsContent value="appointments" className="mt-0 outline-none">
              <AppointmentsTab />
            </TabsContent>

            <TabsContent value="calendar" className="mt-0 outline-none">
              <CalendarTab />
            </TabsContent>

            <TabsContent value="doctors" className="mt-0 outline-none">
              <FindDoctorsTab />
            </TabsContent>

            <TabsContent value="profile" className="mt-0 outline-none">
              <ProfileTab familyId={familyId} refreshTrigger={refreshKey} />
            </TabsContent>
          </motion.div>

          {/* New Hospital Network Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Apollo Main Hospital', location: 'Greams Road, Chennai', specialty: 'Multi-Specialty', color: 'indigo' },
                { name: 'Government Hospital (GH)', location: 'Park Town, Chennai', specialty: 'Public Healthcare', color: 'emerald' },
                { name: 'SK Hospital', location: 'Anna Nagar, Chennai', specialty: 'Emergency Care', color: 'rose' },
                { name: 'Kauvery Hospital', location: 'Alwarpet, Chennai', specialty: 'Cardiac & Neuro', color: 'amber' }
              ].map((hosp, i) => (
                <motion.div 
                  key={hosp.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedHospital(hosp)}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className={`size-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:bg-${hosp.color}-600 transition-colors`}>
                    <MapPin className={`size-6 text-${hosp.color}-600 group-hover:text-white`} />
                  </div>
                  <h4 className="font-black text-slate-900 mb-1">{hosp.name}</h4>
                  <p className={`text-xs font-bold text-${hosp.color}-600 mb-4 uppercase tracking-widest`}>{hosp.specialty}</p>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="size-3" />
                    <span className="text-[10px] font-medium">{hosp.location}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Dialog open={!!selectedHospital} onOpenChange={(open) => !open && setSelectedHospital(null)}>
              <DialogContent className="sm:max-w-[800px] rounded-[40px] bg-white p-0 overflow-hidden border-none shadow-3xl">
                {selectedHospital && (
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="bg-slate-900 text-white relative min-h-[400px] flex flex-col">
                      <div className="flex-1 bg-slate-800 relative group overflow-hidden">
                         <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedHospital.name + ' ' + selectedHospital.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                          className="grayscale group-hover:grayscale-0 transition-all duration-700 brightness-75 group-hover:brightness-100"
                         />
                         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                      </div>
                      <div className="p-8 relative z-10 -mt-20">
                        <Badge className="bg-indigo-600 mb-6 px-4 py-1.5 border-none font-black uppercase tracking-widest text-[10px]">Strategic Medical Hub</Badge>
                        <DialogTitle className="text-4xl font-black tracking-tighter mb-4 leading-none">{selectedHospital.name}</DialogTitle>
                        <div className="flex items-start gap-3 text-indigo-300 font-bold text-sm bg-slate-800/80 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
                          <MapPin className="size-5 shrink-0 text-indigo-400" />
                          <div>
                            <p className="text-[10px] uppercase font-black text-white/50 mb-1">Geographic Location</p>
                            {selectedHospital.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-10 bg-slate-50 relative">
                      <div className="flex items-center justify-between mb-8">
                        <h5 className="font-black text-sm uppercase tracking-widest text-slate-800 flex items-center gap-2">
                          <Stethoscope className="size-5 text-indigo-600" />
                          Faculty Registry
                        </h5>
                        <Badge variant="outline" className="font-black text-[9px] border-slate-200 uppercase tracking-widest">Live Status</Badge>
                      </div>

                      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                        {allDoctors.filter(d => d.hospital === selectedHospital.name || (selectedHospital.name.includes('GH') && d.hospital.includes('GH'))).length > 0 ? (
                          allDoctors
                            .filter(d => d.hospital === selectedHospital.name || (selectedHospital.name.includes('GH') && d.hospital.includes('GH')))
                            .map((doc, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={doc.id} 
                                className="flex items-center justify-between p-5 rounded-3xl bg-white border border-slate-100 group hover:border-indigo-600 transition-all hover:shadow-xl hover:shadow-indigo-50"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="size-14 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:rotate-6 transition-all flex items-center justify-center text-indigo-600 group-hover:text-white font-black text-xl shadow-inner">
                                    {doc.name.split(' ')[1]?.[0] || 'D'}
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{doc.name}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-400">{doc.specialty}</p>
                                  </div>
                                </div>
                                <Button 
                                  size="icon"
                                  className="size-10 rounded-xl bg-slate-900 hover:bg-indigo-600 shadow-lg transition-all" 
                                  onClick={() => {
                                    setSelectedHospital(null);
                                    setActiveTab('doctors');
                                  }}>
                                  <Plus className="size-5 text-white" />
                                </Button>
                              </motion.div>
                            ))
                        ) : (
                          <div className="py-24 text-center">
                            <div className="bg-slate-100 p-8 rounded-full inline-block mb-6">
                               <Stethoscope className="size-16 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-black text-lg">No Facility Matches</p>
                            <p className="text-slate-400 font-bold text-sm">Update registry or search another complex.</p>
                          </div>
                        )}
                      </div>
                      
                      <Button variant="ghost" className="w-full mt-8 rounded-2xl font-black text-xs uppercase tracking-widest text-indigo-600 bg-white shadow-sm hover:bg-slate-100 py-6" onClick={() => setSelectedHospital(null)}>
                        Dismiss Facility Details
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
        </Tabs>
      </main>

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-30">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <VoiceAssistant />
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <ChatbotPanel />
        </motion.div>
      </div>
    </div>
  );
}
