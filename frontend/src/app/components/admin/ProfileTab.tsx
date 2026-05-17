import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Shield, Mail, Lock, Server, Bell, Database, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../lib/LanguageContext';

export function ProfileTab() {
  const { t } = useLanguage();
  
  // Mocked Admin User
  const adminUser = {
    id: 'ADM001',
    name: 'Super Admin',
    email: 'admin@healthport.com',
    role: 'admin',
    accessLevel: 'Owner',
    lastLogin: new Date().toLocaleString()
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Identity */}
        <Card className="lg:col-span-1 border-none shadow-xl bg-slate-900 text-white overflow-hidden group">
          <div className="h-24 bg-gradient-to-r from-indigo-600 to-indigo-800" />
          <CardContent className="pt-0 -mt-12 text-center relative z-10">
            <div className="inline-block p-1 bg-slate-900 rounded-full shadow-2xl mb-4 group-hover:scale-110 transition-transform border border-slate-800">
              <div className="size-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-inner">
                <Shield className="size-12" />
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{adminUser.name}</h2>
            <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mt-2 px-3 py-1 scale-110">
              SYSTEM ROOT
            </Badge>
            
            <div className="mt-8 space-y-3 text-left">
              <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                <Mail className="size-4 text-indigo-400" />
                <span className="text-sm font-medium">{adminUser.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                <Lock className="size-4 text-indigo-400" />
                <span className="text-sm font-medium">{adminUser.accessLevel} Permissions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="lg:col-span-2 border-none shadow-xl bg-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Server className="size-48" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Oversight</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Global System Parameters</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-none font-black px-4 py-1.5 rounded-full flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  SYSTEMS NOMINAL
                </Badge>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Uptime', value: '99.99%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Latency', value: '24ms', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'Cloud link', value: 'Secure', icon: Database, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Alerts', value: '0 Active', icon: Bell, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`${stat.bg} p-4 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-default group`}
                  >
                    <stat.icon className={`size-5 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    <p className={`text-lg font-black ${stat.color.replace('500', '900')}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Last encrypted authentication: {adminUser.lastLogin}
              </div>
              <Button size="sm" variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest px-6 shadow-sm">
                Generate Security Token
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Protocols */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Lock className="size-6 text-indigo-600" />
          Security Protocols
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '2FA Auth', status: 'Enforced', desc: 'Global multi-factor authentication required for all staff.' },
            { title: 'Data Encryption', status: 'Active', desc: 'AES-256 end-to-end encryption for all medical dossiers.' },
            { title: 'Audit Logging', status: 'Enabled', desc: 'Continuous immutable transaction logging for accountability.' }
          ].map((item, i) => (
            <Card key={item.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                   <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">{item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
