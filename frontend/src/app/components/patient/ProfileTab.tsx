import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { User, Users, Shield, MapPin, Phone, Mail, Calendar, Droplets, LogOut } from 'lucide-react';
import { apiService } from '../../lib/api';
import { FamilyMember } from '../../lib/types';
import { motion } from 'framer-motion';
import { useLanguage } from '../../lib/LanguageContext';

export function ProfileTab({ familyId: propFamilyId, refreshTrigger }: { familyId?: string, refreshTrigger?: number }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selfMember, setSelfMember] = useState<FamilyMember | null>(null);
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mocked current user details
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const sessionUser = localStorage.getItem('user');
    if (sessionUser) {
      setCurrentUser(JSON.parse(sessionUser));
    }
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Ensure we have a user to filter by
      const sessionUser = localStorage.getItem('user');
      if (!sessionUser) return;
      const user = JSON.parse(sessionUser);
      setCurrentUser(user);

      try {
        const [membersData, groupsData] = await Promise.all([
          apiService.getFamilyMembers(),
          apiService.getFamilyGroups()
        ]);
        
        // Filter members by current user's family ID
        const filteredMembers = membersData.filter(m => m.familyId === user.familyId);

        // Sort so 'Self' is first
        const sortedMembers = [...filteredMembers].sort((a, b) => {
          if (a.relation === 'Self') return -1;
          if (b.relation === 'Self') return 1;
          return 0;
        });

        setFamilyMembers(sortedMembers);
        
        // Find self member from sorted list
        const self = sortedMembers.find(m => m.name === user.name || m.relation === 'Self');
        setSelfMember(self || null);
        
        // Find current family group
        const group = groupsData.find(g => g.id === user.familyId);
        setFamilyGroup(group);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [propFamilyId, refreshTrigger]);

  if (loading) {
    return <div className="flex items-center justify-center py-12">Loading profile details...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Identity Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-none shadow-xl bg-white overflow-hidden group">
          <div className="h-24 bg-gradient-to-r from-indigo-600 to-blue-500" />
          <CardContent className="pt-0 -mt-12 text-center relative z-10">
            <div className="inline-block p-1 bg-white rounded-full shadow-lg mb-4 group-hover:scale-110 transition-transform">
              <div className="size-24 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600">
                <User className="size-12" />
              </div>
            </div>
            <div className="mb-2">
              <Badge className="bg-indigo-100 text-indigo-700 border-none px-3 py-1 font-black uppercase tracking-widest text-[10px]">Patient Profile</Badge>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{currentUser.name}</h2>
            <p className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">ID: {currentUser.id}</p>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <Mail className="size-4 text-indigo-500" />
                <span className="text-sm font-medium">{currentUser.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <Calendar className="size-4 text-indigo-500" />
                  <span className="text-sm font-medium">{selfMember?.age || 'N/A'} Yrs</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <Droplets className="size-4 text-red-500" />
                  <span className="text-sm font-medium">{selfMember?.bloodGroup || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                <Shield className="size-4 text-indigo-500" />
                <span className="text-sm font-medium">Verified Account Status</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full mt-4 rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all font-bold"
              >
                <LogOut className="size-4 mr-2" />
                Sign Out from Session
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Family Unit Info */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-slate-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Users className="size-48" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-4 px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                Active Family Unit
              </Badge>
              <h1 className="text-4xl font-black mb-2 tracking-tighter">
                {familyGroup?.name || "The Family Core"}
              </h1>
              <p className="text-slate-400 font-bold text-lg">System ID: {currentUser.familyId}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Members</p>
                <p className="text-3xl font-black">{familyMembers.length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Records</p>
                <p className="text-3xl font-black">12</p>
              </div>
              <div className="hidden sm:block bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">Tier</p>
                <p className="text-3xl font-black">Premium</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Family Roster */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="size-6 text-indigo-600" />
            Family Member Archive
          </h3>
          <Badge className="bg-emerald-100 text-emerald-700 border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px]">
            Fully Synchronized
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familyMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                <CardHeader className="pb-2 flex flex-row items-center gap-4">
                  <div className="size-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {member.name}
                      {member.name === currentUser.name && (
                        <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black uppercase tracking-tighter">Self</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-indigo-600 font-bold text-xs uppercase tracking-widest">{member.relation}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-2">
                      <Calendar className="size-3.5 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Age</p>
                        <p className="text-sm font-bold text-slate-700">{member.age || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-2">
                      <Droplets className="size-3.5 text-red-400" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blood</p>
                        <p className="text-sm font-bold text-slate-700">{member.bloodGroup}</p>
                      </div>
                    </div>
                  </div>
                  
                  {member.allergies && member.allergies.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allergy Protocols</p>
                      <div className="flex flex-wrap gap-1">
                        {member.allergies.map(a => (
                          <Badge key={a} variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-100 font-bold">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="ghost" className="w-full rounded-xl text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50/0 hover:bg-indigo-50 transition-colors">
                    Access Medical Dossier
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
