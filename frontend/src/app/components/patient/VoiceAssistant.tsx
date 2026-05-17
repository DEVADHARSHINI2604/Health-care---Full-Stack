import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Mic, MicOff, Keyboard, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { motion, AnimatePresence } from 'framer-motion';

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textCommand, setTextCommand] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setShowTranscript(true);
        setMicPermissionDenied(false);
        toast.info('HealthPort AI is listening...');
      };

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.trim());
        }
      };

      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
          setShowTextInput(true);
        }
        setTimeout(() => setShowTranscript(false), 2000);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setTimeout(() => setShowTranscript(false), 3000);
      };

      setRecognition(recognitionInstance);
    } else {
      setShowTextInput(true);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const response = getResponse(command);
    toast.success(`Voice Protocol: "${command}"`);
    speak(response);
  };

  const getResponse = (command: string): string => {
    const lower = command.toLowerCase();
    if (lower.includes('help')) return "I am your voice assistant. You can ask for appointments, medical records, or help with finding a doctor.";
    if (lower.includes('appointment')) return "Opening your upcoming appointments. You have a consultation with Doctor Rajesh tomorrow.";
    if (lower.includes('record')) return "Scanning clinical records. Kannan's recent checkup shows normal vitals.";
    return "Command received. I am processing your healthcare request.";
  };

  const toggleVoiceAssistant = () => {
    if (!recognition) {
      setShowTextInput(true);
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => recognition.start())
        .catch(() => {
          setMicPermissionDenied(true);
          setShowTextInput(true);
        });
    }
  };

  const handleTextCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (textCommand.trim()) {
      handleVoiceCommand(textCommand);
      setTextCommand('');
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4 px-4">
      <AnimatePresence>
        {(showTranscript && (transcript || isSpeaking)) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-80"
          >
            <Card className={`border-none shadow-2xl rounded-[32px] overflow-hidden transition-all duration-500 ${isSpeaking ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`size-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : isSpeaking ? 'bg-indigo-300 animate-pulse' : 'bg-slate-500'}`} />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {isListening ? 'Listening' : isSpeaking ? 'Audio Protocol' : 'Standby'}
                  </p>
                </div>
                <p className="text-sm font-bold leading-relaxed">{transcript || (isSpeaking ? "Broadcasting Response..." : "")}</p>
                {isSpeaking && (
                  <div className="mt-4 flex gap-1 h-4 items-end">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 16, 4] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-1 bg-white/40 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {showTextInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-80"
          >
            <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden">
              <div className="bg-slate-50 p-6 border-b">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manual Entry Mode</p>
              </div>
              <CardContent className="p-6">
                <form onSubmit={handleTextCommand} className="space-y-4">
                  <Input
                    placeholder="Type command..."
                    value={textCommand}
                    onChange={(e) => setTextCommand(e.target.value)}
                    autoFocus
                    className="rounded-2xl border-slate-100 bg-slate-50 py-7 font-bold text-slate-900"
                  />
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl py-7 font-black transition-all">
                    Process Command
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            className={`rounded-[24px] shadow-2xl size-16 p-0 transition-all ${
              isListening ? 'bg-red-500 shadow-red-200' : isSpeaking ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-900 shadow-slate-200'
            }`}
            onClick={toggleVoiceAssistant}
          >
            {isListening ? (
              <MicOff className="size-8 text-white" />
            ) : isSpeaking ? (
              <Activity className="size-8 text-white animate-pulse" />
            ) : (
              <Mic className="size-8 text-white" />
            )}
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            variant="outline"
            className={`rounded-[24px] shadow-2xl size-16 p-0 bg-white border-none ${
              showTextInput ? 'text-indigo-600 shadow-indigo-100' : 'text-slate-400 shadow-slate-100'
            }`}
            onClick={() => setShowTextInput(!showTextInput)}
          >
            <Keyboard className="size-8" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}