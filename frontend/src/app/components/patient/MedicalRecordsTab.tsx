import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { apiService } from '../../lib/api';
import { FamilyMember, MedicalRecord } from '../../lib/types';
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  Activity,
  History,
  ClipboardList
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export function MedicalRecordsTab() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    age: '',
    bloodGroup: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionUser = localStorage.getItem('user');
        if (!sessionUser) return;
        const user = JSON.parse(sessionUser);

        const [membersData, recordsData] = await Promise.all([
          apiService.getFamilyMembers(user.familyId),
          apiService.getMedicalRecords()
        ]);
        
        // Filter members by the logged-in user's familyId
        const familyMembers = membersData.filter(m => m.familyId === user.familyId);
        
        // Sort so 'Self' (the registered user) is first
        const sortedMembers = [...familyMembers].sort((a, b) => {
          if (a.relation === 'Self') return -1;
          if (b.relation === 'Self') return 1;
          return 0;
        });

        setMembers(sortedMembers);
        setRecords(recordsData);
        if (sortedMembers.length > 0) setSelectedMember(sortedMembers[0].id);
      } catch (error) {
        console.error('Error fetching medical data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relation) return;
    try {
      const sessionUser = localStorage.getItem('user');
      const user = sessionUser ? JSON.parse(sessionUser) : { familyId: 'FAM001' };

      const added = await apiService.addFamilyMember({
        ...newMember,
        age: parseInt(newMember.age) || 0,
        familyId: user.familyId
      });
      setMembers([...members, added]);
      setIsAddModalOpen(false);
      setNewMember({ name: '', relation: '', age: '', bloodGroup: '' });
    } catch (error) {
      console.error('Error adding family member:', error);
    }
  };

  const filteredRecords = records.filter(record => record.patientId === selectedMember);
  const activeMember = members.find(m => m.id === selectedMember);

  if (loading) return <div className="py-20 text-center font-bold text-slate-400">Loading medical archives...</div>;

  return (
    <div className="space-y-8 animate-in transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medical Heritage</h2>
          <p className="text-indigo-600 font-bold bg-indigo-50 w-fit px-3 py-1 rounded-full text-xs uppercase tracking-widest">
            Family Data Management
          </p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 rounded-2xl px-6 py-6 font-black transition-all hover:scale-105 active:scale-95">
              <Plus className="size-5 mr-2" />
              Register New Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <User className="size-6 text-indigo-600" />
                New Family Member
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-black text-xs uppercase tracking-widest text-slate-400">Full Participant Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Maya Kannan" 
                  value={newMember.name} 
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})} 
                  className="rounded-xl border-slate-100 bg-slate-50 font-bold py-6 focus-visible:ring-indigo-600" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="relation" className="font-black text-xs uppercase tracking-widest text-slate-400">Relationship</Label>
                  <Select onValueChange={(v) => setNewMember({...newMember, relation: v})}>
                    <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 font-bold py-6 focus:ring-indigo-600 outline-none">
                      <SelectValue placeholder="Identity" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="Father" className="font-bold">Father</SelectItem>
                      <SelectItem value="Mother" className="font-bold">Mother</SelectItem>
                      <SelectItem value="Son" className="font-bold">Son</SelectItem>
                      <SelectItem value="Daughter" className="font-bold">Daughter</SelectItem>
                      <SelectItem value="Spouse" className="font-bold">Spouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="age" className="font-black text-xs uppercase tracking-widest text-slate-400">Current Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={newMember.age} 
                    onChange={(e) => setNewMember({...newMember, age: e.target.value})} 
                    className="rounded-xl border-slate-100 bg-slate-50 font-bold py-6 focus-visible:ring-indigo-600" 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blood" className="font-black text-xs uppercase tracking-widest text-slate-400">Blood Group Analysis</Label>
                <Select onValueChange={(v) => setNewMember({...newMember, bloodGroup: v})}>
                  <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50 font-bold py-6 focus:ring-indigo-600 outline-none">
                    <SelectValue placeholder="Select Blood Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                      <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button onClick={handleAddMember} className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black py-7 shadow-lg shadow-indigo-100 text-lg transition-all active:scale-95">
                Commit Registration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colorful Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="size-2 rounded-full bg-indigo-600" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Family Directory</h3>
          </div>
          <div className="grid gap-3">
            {members.map((member) => (
              <motion.button
                key={member.id}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMember(member.id)}
                className={`flex items-center gap-4 p-5 rounded-3xl transition-all text-left group ${
                  selectedMember === member.id
                    ? 'bg-white shadow-2xl shadow-indigo-100 ring-2 ring-indigo-600'
                    : 'bg-white/40 hover:bg-white border border-slate-100'
                }`}
              >
                <div className={`p-3.5 rounded-2xl transition-colors ${
                  selectedMember === member.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50'
                }`}>
                  <User className="size-6" />
                </div>
                <div>
                  <p className={`font-black tracking-tight text-lg ${selectedMember === member.id ? 'text-slate-900' : 'text-slate-600'}`}>
                    {member.name}
                  </p>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="size-3" />
                    {member.relation}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detailed Records View */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMember}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-2xl bg-slate-900 overflow-hidden relative min-h-[180px] flex flex-col justify-center px-4">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 p-12 opacity-5">
                  <ClipboardList className="size-64" />
                </div>
                <div className="absolute -bottom-10 -left-10 size-40 bg-indigo-600 rounded-full blur-[80px] opacity-20" />
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-black tracking-widest uppercase py-1 px-4 text-[10px]">
                      {activeMember?.id}
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black tracking-widest uppercase py-1 px-4 text-[10px] flex items-center gap-1">
                      <Droplet className="size-3" />
                      Blood Type: {activeMember?.bloodGroup || 'O+'}
                    </Badge>
                  </div>
                  <CardTitle className="text-4xl font-black text-white tracking-tighter mb-2">{activeMember?.name}</CardTitle>
                  <CardDescription className="text-slate-400 font-bold text-lg flex items-center gap-3">
                    {activeMember?.relation} <span className="text-slate-700">|</span> {activeMember?.age} Autumns
                  </CardDescription>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
                    <History className="size-6 text-indigo-600" />
                    Clinical Timeline
                  </h3>
                  <Button variant="ghost" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50">
                    Export Dossier
                  </Button>
                </div>

                <ScrollArea className="h-[520px] pr-4">
                  <div className="space-y-5">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record, idx) => (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={record.id}
                        >
                          <Card className="border-none shadow-sm hover:shadow-xl transition-all group bg-white rounded-3xl overflow-hidden">
                            <CardHeader className="pb-4 px-8 pt-8">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-5">
                                  <div className="p-4 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-sm">
                                    <FileText className="size-6" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <CardTitle className="text-xl font-black tracking-tight text-slate-800">{record.diagnosis}</CardTitle>
                                      <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] px-2">NEW</Badge>
                                    </div>
                                    <CardDescription className="flex items-center gap-5 mt-1 font-bold">
                                      <span className="flex items-center gap-1.5 text-slate-400">
                                        <Calendar className="size-4" />
                                        {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                      <span className="text-indigo-600 flex items-center gap-1.5">
                                        <div className="size-1.5 rounded-full bg-indigo-600" />
                                        Dr. {record.doctorName}
                                      </span>
                                    </CardDescription>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 pt-0 space-y-5">
                              <div className="bg-slate-50/80 p-5 rounded-2xl space-y-3 border border-slate-100 flex gap-4">
                                <div className="mt-1 flex flex-col items-center">
                                  <div className="size-2 bg-emerald-500 rounded-full animate-pulse mb-2" />
                                  <div className="w-[2px] h-full bg-slate-200" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1.5">Prescribed Regimen</p>
                                  <p className="text-sm font-bold text-slate-700 leading-relaxed font-mono">
                                    {record.prescription}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 px-1">
                                <div className="bg-amber-100/50 p-2 rounded-xl">
                                  <Activity className="size-4 text-amber-600" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                  <span className="font-black text-slate-800 text-xs uppercase tracking-tight mr-1">Condition Insight:</span> 
                                  {record.notes}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-24 bg-white rounded-[40px] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center">
                        <div className="bg-slate-50 p-8 rounded-full mb-6 relative">
                          <FileText className="size-16 text-slate-200" />
                          <div className="absolute -top-1 -right-1 bg-indigo-500 size-6 rounded-full border-4 border-white" />
                        </div>
                        <p className="text-slate-400 font-black text-lg tracking-tight">No historical archives detected</p>
                        <p className="text-slate-300 font-bold text-sm">Select a member or register a new one to begin.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Helper icons needed for the high-end design
const Droplet = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
