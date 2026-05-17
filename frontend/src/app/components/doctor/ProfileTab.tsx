import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Stethoscope, MapPin, Phone, Mail, Award, Users, Star, Clock } from 'lucide-react';
import { apiService } from '../../lib/api';
import { Doctor, Appointment } from '../../lib/types';
import { motion } from 'framer-motion';
import { useLanguage } from '../../lib/LanguageContext';

export function ProfileTab() {
  const { t } = useLanguage();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patientsCount, setPatientsCount] = useState(0);
  const [uniquePatients, setUniquePatients] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Removed hardcoded doctor ID

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (!sessionUser) return;
    const user = JSON.parse(sessionUser);

    const fetchDoctorData = async () => {
      try {
        const [doctors, appointments] = await Promise.all([
          apiService.getDoctors(),
          apiService.getAppointments()
        ]);
        
        const currentDoc = doctors.find(d => d.id === user.id);
        setDoctor(currentDoc || null);

        // Filter appointments for this doctor and get unique patients
        const docAppts = appointments.filter(a => a.doctorId === user.id);
        const patients = Array.from(new Set(docAppts.map(a => a.patientName)));
        setUniquePatients(patients);
        setPatientsCount(patients.length);
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading professional profile...</div>;
  }

  if (!doctor) {
    return <div className="text-center py-12">Doctor profile not found.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Professional Identity */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-white overflow-hidden group">
          <div className="h-24 bg-gradient-to-r from-indigo-700 to-indigo-500" />
          <CardContent className="pt-0 -mt-12 text-center relative z-10">
            <div className="inline-block p-1 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
              <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
                <Stethoscope className="size-12" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{doctor.name}</h2>
            <p className="text-sm font-bold text-indigo-600 mb-6">{doctor.specialty} Specialist</p>
            
            <div className="flex justify-center gap-2 mb-8">
              <Badge className="bg-amber-50 text-amber-600 border-none font-black px-3 py-1">
                <Star className="size-3 mr-1 fill-amber-600" />
                {doctor.rating}
              </Badge>
              <Badge className="bg-indigo-50 text-indigo-600 border-none font-black px-3 py-1">
                {doctor.experience}Y EXP
              </Badge>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-transparent hover:border-indigo-100 transition-colors">
                <Mail className="size-4 text-indigo-500" />
                <span className="text-sm font-medium">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-transparent hover:border-indigo-100 transition-colors">
                <Phone className="size-4 text-indigo-500" />
                <span className="text-sm font-medium">{doctor.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Statistics */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-slate-900 text-white p-8 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <Award className="size-48" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-4 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                  Board Certified Practitioner
                </Badge>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <MapPin className="size-6 text-indigo-400" />
                   </div>
                   <h1 className="text-3xl font-black tracking-tighter">
                    {doctor.hospital}
                  </h1>
                </div>
                <p className="text-slate-400 font-bold text-sm tracking-wide">
                  {doctor.hospitalLocation} · {doctor.distance} from center
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Impact Group</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-black">{patientsCount}</p>
                    <p className="text-xs font-bold text-slate-400 mb-1">Patients</p>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Availability</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-black">{doctor.availability.length}</p>
                    <p className="text-xs font-bold text-slate-400 mb-1">Days/WK</p>
                  </div>
                </div>
                <div className="hidden sm:block bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                  <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Status</p>
                  <p className="text-3xl font-black text-emerald-400 uppercase tracking-tighter">ACTIVE</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Patient Roster */}
        <section className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="size-6 text-indigo-600" />
            Patient Roster
          </h3>
          <Card className="border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {uniquePatients.length > 0 ? (
                  uniquePatients.map((name, i) => (
                    <motion.div 
                      key={name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {name.charAt(0)}
                        </div>
                        <p className="font-bold text-slate-800">{name}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black border-slate-200">ACTIVE CASE</Badge>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 font-medium italic">
                    No clinical records found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Schedule Overview */}
        <section className="space-y-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Clock className="size-6 text-indigo-600" />
            Clinical Hours
          </h3>
          <Card className="border-none shadow-sm bg-white p-6">
            <div className="space-y-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const isActive = doctor.availability.includes(day);
                return (
                  <div key={day} className={`flex items-center justify-between p-3 rounded-xl ${isActive ? 'bg-indigo-50/50' : 'opacity-40'}`}>
                    <span className="font-black text-sm uppercase tracking-widest text-slate-600">{day}</span>
                    {isActive ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-indigo-600">09:00 AM - 05:00 PM</span>
                        <div className="size-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Off-Duty</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
