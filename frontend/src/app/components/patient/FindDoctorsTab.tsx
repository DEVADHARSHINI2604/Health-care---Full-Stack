import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiService } from '../../lib/api';
import { Doctor, FamilyMember } from '../../lib/types';
import { Search, MapPin, Star, Calendar, Phone, Mail, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { generateUniqueId } from '../../lib/utils';

export function FindDoctorsTab() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUser = localStorage.getItem('user');
        const familyId = sessionUser ? JSON.parse(sessionUser).familyId : undefined;

        const [doctorData, memberData] = await Promise.all([
          apiService.getDoctors(),
          apiService.getFamilyMembers(familyId)
        ]);
        setDoctors(doctorData);
        setFamilyMembers(memberData);
        if (memberData.length > 0) setSelectedMemberId(memberData[0].id);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const specialties = Array.from(new Set(doctors.map((d: Doctor) => d.specialty)));

  const filteredDoctors = doctors.filter((doctor: Doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesHospital = selectedHospital === 'all' || 
                           doctor.hospital.toLowerCase().includes(selectedHospital.toLowerCase());
    return matchesSearch && matchesSpecialty && matchesHospital;
  });

  const confirmBooking = async () => {
    if (!selectedDoctor || !bookingDate) {
      toast.error('Integrity check failed: Please select a valid date.');
      return;
    }

    const member = familyMembers.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsSubmitting(true);
    try {
      await apiService.addAppointment({
        id: generateUniqueId('APT'),
        patientId: member.id,
        patientName: member.name,
        familyId: member.familyId,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        date: bookingDate,
        time: bookingTime,
        status: 'pending',
        notes: reason
      });
      
      toast.success(`Protocol Success: Appointment with ${selectedDoctor.name} synchronized.`);
      setSelectedDoctor(null);
      setReason('');
      setBookingDate('');
    } catch (error) {
      toast.error('Synchronization failure: Re-attempt booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center font-bold text-slate-400">Scanning clinical network...</div>;

  return (
    <div className="space-y-8 animated-in">
      {/* Dynamic Filter Section */}
      <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Search className="size-24" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Search className="size-6 text-indigo-400" />
              Practitioner Intelligence
            </h2>
            <p className="text-slate-400 font-medium text-sm">Target specific specialties or doctors across the network</p>
          </div>
        </div>
        <CardContent className="p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Search Parameter</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Doctor name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border-slate-100 bg-slate-50 pl-12 py-6 font-bold focus-visible:ring-indigo-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Hospital Hierarchy</Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 py-6 font-bold focus:ring-indigo-600 outline-none">
                  <SelectValue placeholder="All Facilities" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="all" className="font-bold">All Facilities</SelectItem>
                  <SelectItem value="apollo" className="font-bold">Apollo Hospitals</SelectItem>
                  <SelectItem value="gh" className="font-bold">Government Hospitals (GH)</SelectItem>
                  <SelectItem value="global" className="font-bold">Global Health City</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-xl text-slate-900 tracking-tight">Vetted Practitioners</h3>
          <Badge className="bg-emerald-50 text-emerald-600 border-none font-black px-4 py-1.5 rounded-full">
            {filteredDoctors.length} ACTIVE CLOSET
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((doctor: Doctor, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={doctor.id}
            >
              <Card className="border-none shadow-sm hover:shadow-2xl transition-all group bg-white rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-16 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {doctor.name.charAt(4)}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-slate-900 leading-tight">{doctor.name}</CardTitle>
                        <div className="flex flex-col">
                           <CardDescription className="font-bold text-indigo-600 flex items-center gap-2">
                             {doctor.specialty}
                             <span className="text-slate-300">|</span>
                             <span className="text-slate-500 text-xs font-black uppercase tracking-tight">{doctor.hospital}</span>
                           </CardDescription>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Login ID: <span className="text-indigo-400">{doctor.email}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      <Star className="size-4 text-amber-600 fill-amber-600" />
                      <span className="text-sm font-black text-amber-700">{doctor.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8 pt-4 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl">
                      <MapPin className="size-4 text-slate-400" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</p>
                        <p className="text-[10px] font-bold text-slate-700 truncate">{doctor.hospitalLocation}</p>
                        <p className="text-[9px] font-black text-indigo-500 uppercase">{doctor.distance}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl">
                      <Briefcase className="size-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tenure</p>
                        <p className="text-xs font-bold text-slate-700">{doctor.experience} Yrs</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {doctor.availability.map((day: string) => (
                      <Badge key={day} className="bg-slate-100 text-slate-600 border-none font-black text-[9px] px-2.5">
                        {day}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-slate-900 group-hover:bg-indigo-600 text-white rounded-2xl py-7 font-black transition-all shadow-xl shadow-slate-200" 
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <Calendar className="size-5 mr-2" />
                      INITIATE BOOKING
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all shrink-0"
                      onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(doctor.hospital + ' ' + doctor.hospitalLocation)}`, '_blank')}
                      title="View on Google Maps"
                    >
                      <MapPin className="size-6" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-xl">
          <div className="bg-indigo-600 p-8 text-white">
            <DialogTitle className="text-3xl font-black mb-2 tracking-tighter">Consultation Protocol</DialogTitle>
            <DialogDescription className="text-indigo-100 font-bold">
              Establishing patient-doctor synchronization with {selectedDoctor?.name}
            </DialogDescription>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Participant Focus</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold outline-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id} className="font-bold py-3">
                      {member.name} ({member.relation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Temporal Link (Date)</Label>
                <Input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]} 
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Timeline (Hour)</Label>
                <Select value={bookingTime} onValueChange={setBookingTime}>
                  <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold outline-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map(t => (
                      <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Clinical Focus / Symptoms</Label>
              <Input 
                placeholder="Describe current status..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold"
              />
            </div>

            <Button 
              onClick={confirmBooking} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-8 font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SYNCHRONIZING...' : 'COMMIT CONSULTATION'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
