import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Activity, ShieldCheck, User as UserIcon, Heart } from 'lucide-react';
import { apiService } from '../lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeRole, setActiveRole] = useState<'patient' | 'doctor' | 'admin'>('patient');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      const users = await apiService.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === activeRole);

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        
        if (activeRole === 'patient') {
          navigate('/patient');
        } else if (activeRole === 'doctor') {
          navigate('/doctor');
        } else {
          navigate('/admin');
        }
      } else {
        toast.error('Invalid credentials for selected role');
      }
    } catch (error) {
      toast.error('Connection failure. Check backend status.');
    }
  };

  const handleDemoLogin = (userType: 'kannan' | 'rajesh_p' | 'rajesh_d') => {
    if (userType === 'kannan') {
      setEmail('kannan@example.com');
      setActiveRole('patient');
    } else if (userType === 'rajesh_p') {
      setEmail('rajesh@example.com');
      setActiveRole('patient');
    } else {
      setEmail('rajesh@hospital.com');
      setActiveRole('doctor');
    }
    setPassword('demo123');
    toast.info('Demo credentials loaded');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Activity className="size-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Family Medical Records</CardTitle>
          <CardDescription>Track your family's health journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email Address</Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="kannan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-password">Access PIN</Label>
                  <Input
                    id="patient-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 rounded-xl font-bold">Login to Patient Portal</Button>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button type="button" variant="outline" className="text-xs rounded-xl" onClick={() => handleDemoLogin('kannan')}>
                    Demo: Kannan
                  </Button>
                  <Button type="button" variant="outline" className="text-xs rounded-xl" onClick={() => handleDemoLogin('rajesh_p')}>
                    Demo: Rajesh Family
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="doctor">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-email">Medical Faculty ID</Label>
                  <Input
                    id="doctor-email"
                    type="email"
                    placeholder="rajesh@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor-password">Authentication Token</Label>
                  <Input
                    id="doctor-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 py-6 rounded-xl font-bold">Authenticate Professional Access</Button>
                <Button type="button" variant="outline" className="w-full rounded-xl" onClick={() => handleDemoLogin('rajesh_d')}>
                  Use Dr. Rajesh Demo
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Login as Admin</Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin}>
                  Use Demo Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
