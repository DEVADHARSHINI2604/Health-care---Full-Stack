import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from '../../lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Hello! I\'m HealthPort AI. How can I assist you or your family today?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse = getBotResponse(input);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: botResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInput('');
  };

  const getBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('appointment') || lowerQuery.includes('book')) {
      return 'To book an appointment for Kannan or Maya, head over to the "Find Doctors" tab. Dr. Rajesh is currently available for Cardiology consultations.';
    } else if (lowerQuery.includes('record') || lowerQuery.includes('medical')) {
      return 'You can access clinical records for the entire family in the "Medical Records" tab. You\'ll find recent diagnoses and prescriptions there.';
    } else if (lowerQuery.includes('family')) {
      return 'Your current family members are Kannan, Maya, and Ananya. You can add more members using the "Register New Member" button in the Medical Records section.';
    } else {
      return 'I can help you manage health records for Kannan, Maya, and Ananya. Would you like to check upcoming appointments or view recent medical history?';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 mb-2"
          >
            <Card className="border-none shadow-2xl shadow-indigo-200/50 rounded-3xl overflow-hidden">
              <CardHeader className="bg-indigo-600 text-white flex flex-row items-center justify-between py-5 px-6">
                <CardTitle className="flex items-center gap-2 text-xl font-black italic">
                  <Sparkles className="size-5 text-indigo-200" />
                  HealthPort AI
                </CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                <ScrollArea className="h-96 p-6">
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-tr-none'
                              : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                          }`}
                        >
                          <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                          <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${
                            msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-2">
                  <Input
                    placeholder="Ask about Kannan's health..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="rounded-xl border-slate-200 bg-white font-medium focus-visible:ring-indigo-600"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          size="lg"
          className={`rounded-2xl shadow-2xl size-16 p-0 transition-all ${
            isOpen ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="size-8" /> : <MessageCircle className="size-8" />}
        </Button>
      </motion.div>
    </div>
  );
}
