import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageSquare, Mic, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, 
  Car, ShieldCheck, Zap, Users, BarChart3, Database, Layers, Sparkles, RefreshCw, 
  Volume2, Globe, Clock, Star, Play, AlertCircle
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hi! I'm LotLine AI. Looking for a specific vehicle, trade-in quote, or test drive schedule?", time: '07:42 PM' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('Idle');
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Text Chat Handler
  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      let aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I found 2 verified listings in our sample inventory matching your criteria. Would you like to view specs or schedule a test drive?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vehicles: [
          { name: '2021 Toyota Camry SE (Automatic)', price: '$21,450', miles: '34,200 mi' },
          { name: '2020 Toyota Camry LE (Automatic)', price: '$19,900', miles: '42,100 mi' }
        ]
      };

      if (query.toLowerCase().includes('trade') || query.toLowerCase().includes('civic')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I can log your 2017 Honda Civic details for an appraisal. A salesperson will verify the condition during your appointment.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      } else if (query.toLowerCase().includes('drive') || query.toLowerCase().includes('saturday')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: "Saturday open slots: 10:30 AM and 2:15 PM. Shall I reserve a slot for your test drive?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsThinking(false);
    }, 900);
  };

  const resetChat = () => {
    setMessages([
      { id: 1, sender: 'ai', text: "Session reset. Ask me anything about our sample used inventory!", time: '07:42 PM' }
    ]);
  };

  // Voice Interaction Mock
  const toggleVoice = () => {
    if (voiceStatus === 'Idle') {
      setVoiceStatus('Listening...');
      setTimeout(() => setVoiceStatus('Thinking...'), 2500);
      setTimeout(() => setVoiceStatus('Speaking...'), 4000);
      setTimeout(() => setVoiceStatus('Idle'), 7500);
    } else {
      setVoiceStatus('Idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#160D0B] text-[#FBF4EF] font-['Poppins',sans-serif] selection:bg-[#FF5A2C] selection:text-white">
      {/* Global CSS Inject */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        .font-serif-luxury {
          font-family: 'Instrument Serif', Georgia, serif;
        }

        .glass-pill-nav {
          background: rgba(22, 13, 11, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 235, 225, 0.12);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 235, 225, 0.1);
        }
        .glass-panel {
          background: rgba(27, 17, 14, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 235, 225, 0.12);
        }
        
        /* Continuous Revolving Tire Animation */
        @keyframes spinWheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-wheel {
          animation: spinWheel 2s linear infinite;
          transform-origin: center;
        }

        /* Pulse Orb Animation */
        @keyframes orbPulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 90, 44, 0.4); }
          70% { box-shadow: 0 0 0 35px rgba(255, 90, 44, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 90, 44, 0); }
        }
        .animate-orb {
          animation: orbPulse 2s infinite;
        }

        /* Orbital Floating Partner Badges */
        @keyframes floatOrbit {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-orbit-float {
          animation: floatOrbit 6s ease-in-out infinite;
        }
      `}</style>

      {/* FLOATING PILL NAVBAR (Reference Image 1 Style) */}
      <nav className="sticky top-6 z-50 max-w-4xl mx-auto px-4">
        <div className="glass-pill-nav rounded-full px-5 py-2.5 flex items-center justify-between shadow-2xl">
          {/* Logo */}
          <a href="#" className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
            LotLine<span className="text-[#FF5A2C]">.Ai</span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#B9AAA3]">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
          </div>

          {/* Right Action Button */}
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="bg-white text-[#1A0F0D] hover:bg-[#F5FBFC] transition-transform active:scale-95 font-semibold text-xs md:text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <span className="w-2 h-4 bg-[#FF5A2C] -skew-x-12 rounded-sm inline-block" />
            Book a Demo
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 md:py-24 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#FF5A2C]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5A2C]/10 border border-[#FF5A2C]/20 text-[#FF5A2C] text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> AI Customer Engagement for Dealerships
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif-luxury leading-[1.05] tracking-tight">
              Turn every conversation <br />
              <span className="italic text-[#D3EAF0]">into your next sale.</span>
            </h1>

            <p className="text-lg text-[#B9AAA3] max-w-xl font-normal leading-relaxed">
              LotLine AI captures chats and calls, qualifies buyers 24/7, maintains exact customer history, and guides your sales staff on the next best action.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#demo"
                className="bg-white text-[#1A0F0D] hover:bg-[#D3EAF0] transition-all font-semibold px-7 py-3.5 rounded-full text-sm flex items-center gap-3 shadow-xl hover:scale-[1.02]"
              >
                <span className="w-2 h-4 bg-[#FF5A2C] -skew-x-12 rounded-sm" />
                Try Live AI
              </a>
              <button 
                onClick={() => setIsBookModalOpen(true)}
                className="bg-transparent text-white border border-white/30 hover:border-white transition-all font-semibold px-7 py-3.5 rounded-full text-sm"
              >
                Book a Demo
              </button>
            </div>

            <p className="text-xs text-[#B9AAA3]/70 pt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A2C]" /> Interactive sample dealership demo · Verified stock pipeline
            </p>
          </div>

          {/* Right Side: Animated Car Graphic & Frosted Chat Bubbles Overlay */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            
            {/* SVG Silhouette Car - Scaled Up with Revolving Rim Spokes */}
            <div className="relative w-full max-w-xl lg:max-w-2xl mx-auto">
              <svg viewBox="0 0 620 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl scale-110 md:scale-125 transition-transform duration-500">
                {/* Static Car Body Silhouette */}
                <path d="M30 160Q34 118 102 108L182 66Q215 48 272 48H412Q462 54 494 100L578 112Q608 122 608 160Z" fill="#261713" stroke="rgba(255, 235, 225, 0.2)" strokeWidth="2.5" />
                <path d="M200 76H310V104H160ZM326 76H412Q440 80 456 104H326Z" fill="#D3EAF0" opacity="0.3"/>

                {/* Rear Wheel Group with Revolving Tyre Spokes */}
                <g transform="translate(150, 162)">
                  <circle cx="0" cy="0" r="36" fill="#0D0705" stroke="#3A251E" strokeWidth="5" />
                  <circle cx="0" cy="0" r="20" fill="#1C100D" />
                  {/* Continuously Revolving Rim */}
                  <g className="animate-spin-wheel">
                    <line x1="-16" y1="0" x2="16" y2="0" stroke="#FF5A2C" strokeWidth="3" />
                    <line x1="0" y1="-16" x2="0" y2="16" stroke="#FF5A2C" strokeWidth="3" />
                    <line x1="-12" y1="-12" x2="12" y2="12" stroke="#B9AAA3" strokeWidth="2" />
                    <line x1="-12" y1="12" x2="12" y2="-12" stroke="#B9AAA3" strokeWidth="2" />
                  </g>
                  <circle cx="0" cy="0" r="6" fill="#FFF" />
                </g>

                {/* Front Wheel Group with Revolving Tyre Spokes */}
                <g transform="translate(470, 162)">
                  <circle cx="0" cy="0" r="36" fill="#0D0705" stroke="#3A251E" strokeWidth="5" />
                  <circle cx="0" cy="0" r="20" fill="#1C100D" />
                  {/* Continuously Revolving Rim */}
                  <g className="animate-spin-wheel">
                    <line x1="-16" y1="0" x2="16" y2="0" stroke="#FF5A2C" strokeWidth="3" />
                    <line x1="0" y1="-16" x2="0" y2="16" stroke="#FF5A2C" strokeWidth="3" />
                    <line x1="-12" y1="-12" x2="12" y2="12" stroke="#B9AAA3" strokeWidth="2" />
                    <line x1="-12" y1="12" x2="12" y2="-12" stroke="#B9AAA3" strokeWidth="2" />
                  </g>
                  <circle cx="0" cy="0" r="6" fill="#FFF" />
                </g>
              </svg>

              {/* Overlaid Glassmorphic Chat Bubble Stack */}
              <div className="space-y-3 mt-6 relative z-10">
                <div className="glass-card p-4 rounded-2xl max-w-sm ml-auto shadow-2xl backdrop-blur-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-700 to-orange-500 flex items-center justify-center text-xs font-bold text-white">AM</div>
                    <span className="text-xs font-medium text-[#B9AAA3]">Alex M. · Website Chat</span>
                    <span className="text-[10px] text-white/40 ml-auto">07:42 PM</span>
                  </div>
                  <p className="text-sm text-white font-normal">Do you have an automatic Camry under $22,000 in stock?</p>
                </div>

                <div className="glass-card p-4 rounded-2xl max-w-sm mr-auto shadow-2xl backdrop-blur-xl border border-[#FF5A2C]/20 bg-[#FF5A2C]/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#FF5A2C]">LotLine AI Assistant</span>
                    <span className="text-[10px] text-white/40 ml-auto">07:42 PM</span>
                  </div>
                  <p className="text-sm text-white/90">Yes — 2 matching Camrys available today! Would you like details or a Saturday test drive?</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[11px] bg-[#D3EAF0] text-[#1A0F0D] px-2.5 py-0.5 rounded-full font-medium">≤ $22,000</span>
                    <span className="text-[11px] bg-[#D3EAF0] text-[#1A0F0D] px-2.5 py-0.5 rounded-full font-medium">Automatic</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHERE SALES QUIETLY LEAK */}
      <section className="py-20 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif-luxury tracking-tight">Where sales quietly leak</h2>
            <p className="text-[#B9AAA3] text-sm md:text-base mt-4 font-normal">
              Most dealerships already have a website chat, WhatsApp, and CRM. They just don't talk to each other.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-8 rounded-3xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5A2C]/10 flex items-center justify-center text-[#FF5A2C] mb-6">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-3">After-hours drop-off</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                60% of used-car shoppers research on evenings and weekends. Unanswered messages buy from competitor lots.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5A2C]/10 flex items-center justify-center text-[#FF5A2C] mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Disconnected inboxes</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                Website chat, WhatsApp, Messenger, and calls live in separate silos. Context is lost between channels.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5A2C]/10 flex items-center justify-center text-[#FF5A2C] mb-6">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Forgotten follow-ups</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                Test-drive requests and price inquiries slip through the cracks without automated tasks and reminders.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl hover:-translate-y-1.5 transition-transform duration-300">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5A2C]/10 flex items-center justify-center text-[#FF5A2C] mb-6">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Scattered context</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                Budgets, trade-ins, and timelines are buried in raw text. Sales staff start every call from scratch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI-NATIVE DEALERSHIP CRM (Reference Image 4 Style) */}
      <section id="product" className="py-24 border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A2C] font-semibold mb-2 block">// UNIFIED INTELLIGENCE PLATFORM</span>
            <h2 className="text-4xl sm:text-6xl font-serif-luxury tracking-tight">AI-Native Dealership CRM</h2>
            <p className="text-[#B9AAA3] text-sm md:text-base mt-4 max-w-xl mx-auto">
              LotLine brings every conversation, appointment, and buyer preference into one unified intelligence system built to sell more cars.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Dynamic Mockup Panel */}
            <div className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative transition-all duration-500">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-[#B9AAA3] font-mono ml-2">
                    {activeAccordion === 0 && 'Omnichannel Inbox · Active Session'}
                    {activeAccordion === 1 && 'Customer 360 · Extracted Facts & Provenance'}
                    {activeAccordion === 2 && 'Live Inventory Matching · SQL Query Stream'}
                    {activeAccordion === 3 && 'Action Queue · Lead Priority & Handoff'}
                  </span>
                </div>
                <span className="text-xs bg-[#FF5A2C]/20 text-[#FF5A2C] px-3 py-1 rounded-full font-medium">
                  {activeAccordion === 0 && '24/7 Active AI'}
                  {activeAccordion === 1 && 'Qualified Lead'}
                  {activeAccordion === 2 && 'Verified Stock'}
                  {activeAccordion === 3 && 'Action Required'}
                </span>
              </div>

              {/* Dynamic View 0: Never miss a single inquiry */}
              {activeAccordion === 0 && (
                <div className="animate-fadeIn space-y-4 my-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-[#211513] p-5 rounded-2xl border border-white/5">
                      <span className="text-xs text-[#B9AAA3] uppercase tracking-wider block mb-1">Inbound Captured</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-serif-luxury text-white">1,842</span>
                        <span className="text-xs text-emerald-400 font-medium">+100% 24/7 Response</span>
                      </div>
                      <p className="text-[11px] text-[#B9AAA3] mt-2">Captured across Chat, WhatsApp, Messenger & Voice</p>
                    </div>

                    <div className="bg-[#D3EAF0] text-[#1A0F0D] p-5 rounded-2xl">
                      <span className="text-xs opacity-75 uppercase tracking-wider block mb-1">Avg Response Speed</span>
                      <span className="text-5xl font-serif-luxury font-medium block">&lt; 1.2s</span>
                      <p className="text-[11px] opacity-75 mt-2">Zero wait times during after-hours peak traffic</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-medium text-white">WhatsApp Inquiry · 2022 Rav4</span>
                      </div>
                      <span className="text-[#B9AAA3]">Replied 12s ago</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-medium text-white">Inbound Call · Saturday Test Drive</span>
                      </div>
                      <span className="text-[#B9AAA3]">Transcribed & Saved</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic View 1: Extract structured facts automatically */}
              {activeAccordion === 1 && (
                <div className="animate-fadeIn space-y-4 my-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-[#211513] p-5 rounded-2xl border border-white/5">
                      <span className="text-xs text-[#B9AAA3] uppercase tracking-wider block mb-1">Lead Intent Score</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-serif-luxury text-white">87</span>
                        <span className="text-xs text-emerald-400 font-medium">/ 100 (Hot)</span>
                      </div>
                      <p className="text-[11px] text-[#B9AAA3] mt-2">High intent: specific model inquiry + Saturday test drive request</p>
                    </div>

                    <div className="bg-[#D3EAF0] text-[#1A0F0D] p-5 rounded-2xl">
                      <span className="text-xs opacity-75 uppercase tracking-wider block mb-1">Max Budget Ceiling</span>
                      <span className="text-5xl font-serif-luxury font-medium block">$22,000</span>
                      <p className="text-[11px] opacity-75 mt-2">Financing inquiry + 2017 Honda Civic trade-in</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl text-xs">
                      <span className="text-[#B9AAA3]">Target Vehicle</span>
                      <span className="text-white font-medium">2021 Toyota Camry SE (Automatic)</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 bg-white/5 rounded-xl text-xs">
                      <span className="text-[#B9AAA3]">Buying Timeline</span>
                      <span className="text-white font-medium">Within 14 Days</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic View 2: Ground stock recommendations in real inventory */}
              {activeAccordion === 2 && (
                <div className="animate-fadeIn space-y-4 my-6">
                  <div className="p-4 bg-[#211513] rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#B9AAA3] uppercase tracking-wider block">Structured Feed Sync</span>
                      <span className="text-lg font-serif-luxury text-white">Live Inventory SQL Match</span>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono">0 Hallucinations</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-white/5 rounded-xl flex items-center justify-between text-xs border-l-2 border-[#FF5A2C]">
                      <div>
                        <span className="font-semibold text-white block">2021 Toyota Camry SE</span>
                        <span className="text-[#B9AAA3]">VIN: 4T1G11AK3 · 34,200 mi</span>
                      </div>
                      <span className="font-bold text-[#D3EAF0] text-sm">$21,450</span>
                    </div>
                    <div className="p-3.5 bg-white/5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">2020 Toyota Camry LE</span>
                        <span className="text-[#B9AAA3]">VIN: 4T1B11HK9 · 42,100 mi</span>
                      </div>
                      <span className="font-bold text-[#D3EAF0] text-sm">$19,900</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#B9AAA3] italic">* Rechecks real-time stock & price before delivering quotes to buyers.</p>
                </div>
              )}

              {/* Dynamic View 3: Empower staff with next-action guidance */}
              {activeAccordion === 3 && (
                <div className="animate-fadeIn space-y-4 my-6">
                  <div className="bg-[#FF5A2C]/10 border border-[#FF5A2C]/30 p-5 rounded-2xl">
                    <span className="text-xs text-[#FF5A2C] font-semibold uppercase tracking-wider block mb-1">Recommended Next Action</span>
                    <span className="text-2xl font-serif-luxury text-white block">Call Alex M. to confirm Saturday 10:30 AM Slot</span>
                    <p className="text-xs text-[#B9AAA3] mt-2">Customer expressed high interest and shared trade-in details 4 minutes ago.</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                      <span className="text-[#B9AAA3]">Assigned Salesperson</span>
                      <span className="text-white font-medium">Marcus Vance (Desk 2)</span>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                      <span className="text-[#B9AAA3]">Follow-up Priority</span>
                      <span className="text-amber-400 font-semibold">High (Hot Lead)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Accordion List (Reference Image 4 Style) */}
            <div className="lg:col-span-5 space-y-4">
              {[
                { title: 'Never miss a single inquiry', desc: 'Answer every shopper instantly 24/7 across website chat, WhatsApp, social DMs, and phone calls.' },
                { title: 'Extract structured facts automatically', desc: 'Budgets, trade-ins, preferred features, and timelines are parsed directly into clear customer records.' },
                { title: 'Ground stock recommendations in real inventory', desc: 'Answers come strictly from your live inventory feed — zero hallucinations or unverified pricing.' },
                { title: 'Empower staff with next-action guidance', desc: 'Give your team exact customer context, lead scoring rationale, and automated follow-up tasks.' }
              ].map((item, idx) => (
                <div key={idx} className="border-b border-white/10 pb-4">
                  <button 
                    onClick={() => setActiveAccordion(idx)}
                    className="w-full text-left py-3 flex items-start gap-4 transition-colors group"
                  >
                    <span className="text-[#FF5A2C] font-mono text-sm font-semibold">//</span>
                    <span className={`text-xl font-serif-luxury transition-colors ${activeAccordion === idx ? 'text-white' : 'text-[#B9AAA3] group-hover:text-white'}`}>
                      {item.title}
                    </span>
                  </button>
                  {activeAccordion === idx && (
                    <p className="text-sm text-[#B9AAA3] pl-8 pb-2 leading-relaxed">
                      {item.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LIVE AI DEMO CENTER */}
      <section id="demo" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A2C] font-semibold mb-2 block">INTERACTIVE PROTOTYPE</span>
            <h2 className="text-4xl sm:text-6xl font-serif-luxury tracking-tight">Try Live AI Demo</h2>
            <p className="text-[#B9AAA3] text-sm md:text-base mt-4">
              Test LotLine AI in real time across text chat, browser voice, and simulated phone calls.
            </p>
          </div>

          {/* Interactive Shell */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl grid md:grid-cols-12 min-h-[580px]">
            {/* Sidebar Controls */}
            <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[#B9AAA3] font-semibold uppercase tracking-wider block mb-4">Select Mode</span>
                <div className="space-y-2">
                  {[
                    { id: 'text', label: 'Text Chat', icon: MessageSquare },
                    { id: 'voice', label: 'Browser Voice', icon: Mic },
                    { id: 'phone', label: 'Phone Call', icon: Phone }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setActiveTab(mode.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        activeTab === mode.id
                          ? 'bg-white text-[#1A0F0D] font-semibold shadow-lg'
                          : 'text-[#B9AAA3] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <mode.icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  <div className="bg-[#211513] p-4 rounded-2xl border border-white/5">
                    <span className="text-xs text-[#B9AAA3] block">Sample Location</span>
                    <span className="text-sm font-semibold text-white">Sample Lot Motors</span>
                  </div>
                  <div className="bg-[#211513] p-4 rounded-2xl border border-white/5">
                    <span className="text-xs text-[#B9AAA3] block">Status</span>
                    <span className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready & Listening
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={resetChat}
                className="mt-6 text-xs text-[#FF5A2C] hover:underline flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Session
              </button>
            </div>

            {/* Demo Display Area */}
            <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
              {/* TAB 1: TEXT CHAT */}
              {activeTab === 'text' && (
                <div className="flex flex-col h-full justify-between space-y-6">
                  {/* Message Stream */}
                  <div className="space-y-4 overflow-y-auto max-h-[360px] pr-2">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-[#B9AAA3] mb-1">
                          {msg.sender === 'user' ? 'You' : 'LotLine AI'} · {msg.time}
                        </span>
                        <div 
                          className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === 'user' 
                              ? 'bg-white text-[#1A0F0D] rounded-tr-none font-medium' 
                              : 'bg-[#211513] text-[#FBF4EF] border border-white/10 rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                          {msg.vehicles && (
                            <div className="mt-3 space-y-2">
                              {msg.vehicles.map((v, i) => (
                                <div key={i} className="bg-[#D3EAF0] text-[#1A0F0D] p-3 rounded-xl flex justify-between items-center text-xs">
                                  <div>
                                    <span className="font-semibold block">{v.name}</span>
                                    <span className="opacity-75">{v.miles}</span>
                                  </div>
                                  <span className="font-bold text-sm">{v.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="text-xs text-[#B9AAA3] italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF5A2C] animate-ping" /> LotLine AI is thinking...
                      </div>
                    )}
                  </div>

                  {/* Preset Quick Chips & Input */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Do you have an automatic Camry under $22k?",
                        "Can I trade in my Civic?",
                        "Can I book a Saturday test drive?"
                      ].map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(chip)}
                          className="text-xs bg-white/5 hover:bg-white/10 text-[#B9AAA3] hover:text-white px-3 py-1.5 rounded-full border border-white/10 transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a buyer question..."
                        className="flex-1 bg-[#211513] border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-[#B9AAA3]/50 focus:outline-none focus:border-[#D3EAF0]"
                      />
                      <button 
                        type="submit"
                        className="bg-white text-[#1A0F0D] hover:bg-[#D3EAF0] font-semibold px-6 py-3 rounded-full text-sm transition-colors"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: BROWSER VOICE */}
              {activeTab === 'voice' && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
                  <div className="relative">
                    <button
                      onClick={toggleVoice}
                      className={`w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                        voiceStatus !== 'Idle' 
                          ? 'bg-gradient-to-tr from-[#FF5A2C] to-amber-500 text-white animate-orb' 
                          : 'bg-[#211513] border border-white/20 text-[#FF5A2C] hover:scale-105'
                      }`}
                    >
                      <Mic className="w-12 h-12" />
                    </button>
                  </div>

                  <div>
                    <span className="text-xl font-serif-luxury block mb-1">{voiceStatus}</span>
                    <p className="text-xs text-[#B9AAA3] max-w-sm mx-auto">
                      {voiceStatus === 'Idle' 
                        ? 'Tap the orb to start browser audio testing.' 
                        : 'Speech synthesis simulation active. Microphone input captured.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: PHONE CALL */}
              {activeTab === 'phone' && (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-[#211513] border border-white/10 flex items-center justify-center text-[#FF5A2C]">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs text-[#FF5A2C] font-semibold tracking-widest uppercase block mb-2">Simulated Phone Line</span>
                    <span className="text-3xl sm:text-4xl font-serif-luxury text-white block">+1 (800) LOTLINE-AI</span>
                    <p className="text-xs text-[#B9AAA3] mt-2 max-w-xs mx-auto">
                      Dedicated inbound testing line. Standard carrier rates may apply.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('text')}
                    className="text-xs text-white border border-white/20 hover:border-white px-5 py-2.5 rounded-full"
                  >
                    Use Text Chat Prototype Instead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A2C] font-semibold mb-2 block">WORKFLOW ARCHITECTURE</span>
            <h2 className="text-4xl sm:text-6xl font-serif-luxury tracking-tight">Three steps from inquiry to sale</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl relative">
              <span className="text-6xl font-serif-luxury text-[#FF5A2C] block mb-4">01</span>
              <h3 className="text-xl font-semibold mb-3">Capture every conversation</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                Chats and phone calls are logged instantly and linked to customer profiles via exact email or phone matching.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl relative">
              <span className="text-6xl font-serif-luxury text-[#FF5A2C] block mb-4">02</span>
              <h3 className="text-xl font-semibold mb-3">Extract buyer intelligence</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                AI parses budget, financing needs, trade-ins, and timelines into clear explainable lead scores.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl relative">
              <span className="text-6xl font-serif-luxury text-[#FF5A2C] block mb-4">03</span>
              <h3 className="text-xl font-semibold mb-3">Empower sales action</h3>
              <p className="text-sm text-[#B9AAA3] leading-relaxed">
                Your team receives prioritized leads, next-step recommendations, and automated test-drive confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEAMLESS SYSTEM INTEGRATION (Reference Image 3 Style) */}
      <section className="py-28 border-t border-white/10 relative overflow-hidden bg-[#120A08]">
        {/* Concentric Orbital Arc Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg className="w-[1000px] h-[600px]" viewBox="0 0 1000 600" fill="none">
            <ellipse cx="500" cy="300" rx="480" ry="260" stroke="white" strokeWidth="1" strokeDasharray="6 6" />
            <ellipse cx="500" cy="300" rx="360" ry="190" stroke="white" strokeWidth="1" />
            <ellipse cx="500" cy="300" rx="240" ry="120" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#FF5A2C] font-semibold mb-2 block">// BUILT TO CONNECT</span>
            <h2 className="text-4xl sm:text-6xl font-serif-luxury tracking-tight">Seamless system integration</h2>
            <p className="text-[#B9AAA3] text-sm md:text-base mt-4">
              We integrate with your existing dealership technology stack, including inventory feeds, DMS, schedulers, and CRM.
            </p>
          </div>

          {/* Floating White Partner Badges in Orbital Formation */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { title: 'vAuto', subtitle: 'by Cox Automotive', delay: '0s' },
              { title: 'VinSolutions', subtitle: 'Inventory Sync', delay: '1s' },
              { title: 'DealerSocket', subtitle: 'Solera DMS', delay: '2s' },
              { title: 'DealerFX', subtitle: 'Service CRM', delay: '0.5s' },
              { title: 'UpdatePromise', subtitle: 'Messaging Feed', delay: '1.5s' },
              { title: 'MyKaarma', subtitle: 'Telephony Stack', delay: '2.5s' },
              { title: 'WhatsApp', subtitle: 'Cloud API', delay: '0.8s' },
              { title: 'Twilio', subtitle: 'SIP Trunking', delay: '1.8s' }
            ].map((partner, i) => (
              <div 
                key={i}
                style={{ animationDelay: partner.delay }}
                className="bg-white text-[#1A0F0D] p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center animate-orbit-float hover:scale-105 transition-transform"
              >
                <span className="font-bold text-base tracking-tight">{partner.title}</span>
                <span className="text-[11px] text-gray-500 font-medium">{partner.subtitle}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-6xl font-serif-luxury tracking-tight">Transparent Pricing</h2>
            <p className="text-[#B9AAA3] text-sm md:text-base mt-4">
              Proposed pricing plans subject to pilot validation. Tailored for used-car dealerships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-sm font-semibold text-[#B9AAA3] block mb-2">Starter</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-serif-luxury text-white">$99</span>
                  <span className="text-xs text-[#B9AAA3]">/ month</span>
                </div>
                <p className="text-xs text-[#B9AAA3] mb-6">Essential chat capture and AI lead qualification for single-location lots.</p>
                <ul className="space-y-3 text-xs text-white/90">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Website Chat Widget</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Basic WhatsApp Integration</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> CSV Inventory Import</li>
                </ul>
              </div>
              <button onClick={() => setIsBookModalOpen(true)} className="mt-8 w-full py-3 rounded-full border border-white/20 text-white font-semibold text-xs hover:bg-white hover:text-[#1A0F0D] transition-colors">
                Select Starter
              </button>
            </div>

            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between border-[#FF5A2C]/40 relative bg-[#FF5A2C]/5">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5A2C] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">Most Popular</span>
              <div>
                <span className="text-sm font-semibold text-[#FF5A2C] block mb-2">Growth</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-serif-luxury text-white">$249</span>
                  <span className="text-xs text-[#B9AAA3]">/ month</span>
                </div>
                <p className="text-xs text-[#B9AAA3] mb-6">Full multi-channel inbox and lead intelligence for growing dealerships.</p>
                <ul className="space-y-3 text-xs text-white/90">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> All Starter Features</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Lead Intent Scoring (0-100)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Automated Follow-up Tasks</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Call Transcription Allowance</li>
                </ul>
              </div>
              <button onClick={() => setIsBookModalOpen(true)} className="mt-8 w-full py-3 rounded-full bg-white text-[#1A0F0D] font-semibold text-xs hover:bg-[#D3EAF0] transition-colors shadow-lg">
                Join Growth Pilot
              </button>
            </div>

            <div className="glass-card p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-sm font-semibold text-[#B9AAA3] block mb-2">Pro</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-5xl font-serif-luxury text-white">$499</span>
                  <span className="text-xs text-[#B9AAA3]">/ month</span>
                </div>
                <p className="text-xs text-[#B9AAA3] mb-6">Advanced CRM integrations and custom multi-user roles for high-volume dealers.</p>
                <ul className="space-y-3 text-xs text-white/90">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> All Growth Features</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Unlimited Staff Seats</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#FF5A2C]" /> Live DMS & CRM Sync</li>
                </ul>
              </div>
              <button onClick={() => setIsBookModalOpen(true)} className="mt-8 w-full py-3 rounded-full border border-white/20 text-white font-semibold text-xs hover:bg-white hover:text-[#1A0F0D] transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REFINED LIGHT FAQ SECTION (Contained Rounded Card Style) */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#E6F2F5] text-[#1A0F0D] rounded-3xl md:rounded-[40px] p-8 md:p-16 lg:p-20 shadow-2xl">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* Left Heading Column */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-semibold tracking-widest text-[#FF5A2C] uppercase block">// FAQS</span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#1A0F0D] tracking-tight leading-[1.1]">
                  Have any questions?
                </h2>
                <p className="text-sm text-gray-600 font-normal leading-relaxed pt-2">
                  Everything you need to know about LotLine AI platform capabilities and setup.
                </p>
              </div>

              {/* Right Accordion Column */}
              <div className="lg:col-span-7 divide-y divide-gray-300/80">
                {[
                  { q: 'How does LotLine AI work for used-car dealerships?', a: 'LotLine AI captures customer inquiries across chat, WhatsApp, and phone calls. It verifies stock against your live inventory, extracts buying budget and trade-in details, and alerts your sales team.' },
                  { q: 'Can I control how LotLine AI communicates with buyers?', a: 'Yes. You define response guidelines, promotional messaging approval rules, and inventory thresholds.' },
                  { q: 'How does the AI prevent vehicle price hallucinations?', a: 'Answers are generated strictly from structured inventory records. If a vehicle is unverified or sold, the AI hands off to a salesperson.' },
                  { q: 'How does LotLine AI match returning customers?', a: 'Only by exact normalized email or phone match within your dealership database to prevent inaccurate profile merges.' },
                  { q: 'Does LotLine AI integrate with my DMS and CRM?', a: 'Yes. We support CSV/XML inventory imports, inventory APIs, and direct connections to platforms like vAuto and DealerSocket.' }
                ].map((faq, idx) => (
                  <div key={idx} className="py-5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                      className="w-full text-left flex items-center justify-between gap-4 font-medium text-base sm:text-lg text-[#1A0F0D] group"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-[#FF5A2C] font-mono font-bold">//</span>
                        {faq.q}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-gray-200/80 flex items-center justify-center text-sm shrink-0 transition-colors group-hover:bg-gray-300/80">
                        {activeFaq === idx ? '–' : '+'}
                      </span>
                    </button>
                    {activeFaq === idx && (
                      <p className="mt-3 pl-8 text-sm text-gray-600 leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <h2 className="text-4xl sm:text-6xl font-serif-luxury tracking-tight">
            Ready to give every conversation <br />
            <span className="italic text-[#D3EAF0]">a better chance to sell?</span>
          </h2>
          <div className="flex justify-center gap-4 pt-4">
            <button 
              onClick={() => setIsBookModalOpen(true)}
              className="bg-white text-[#1A0F0D] hover:bg-[#D3EAF0] font-semibold px-8 py-3.5 rounded-full text-sm shadow-xl transition-all"
            >
              Book a Demo
            </button>
            <a 
              href="#demo"
              className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-full text-sm hover:border-white transition-all"
            >
              Try Live AI
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-xs text-[#B9AAA3]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 LotLine AI Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </footer>

      {/* BOOK DEMO MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-white/20 relative">
            <button 
              onClick={() => setIsBookModalOpen(false)}
              className="absolute top-4 right-4 text-[#B9AAA3] hover:text-white text-lg"
            >
              ✕
            </button>

            {!formSubmitted ? (
              <div>
                <h3 className="text-2xl font-serif-luxury text-white mb-2">Book a LotLine AI Demo</h3>
                <p className="text-xs text-[#B9AAA3] mb-6">See how LotLine AI converts buyer conversations into dealership appointments.</p>
                
                <form 
                  onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}
                  className="space-y-4"
                >
                  <input required placeholder="Your Name" className="w-full bg-[#211513] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
                  <input required placeholder="Dealership Name" className="w-full bg-[#211513] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
                  <input required type="email" placeholder="Business Email" className="w-full bg-[#211513] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
                  <input placeholder="Phone Number (Optional)" className="w-full bg-[#211513] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
                  <button type="submit" className="w-full bg-white text-[#1A0F0D] font-semibold py-3 rounded-xl text-xs hover:bg-[#D3EAF0] transition-colors">
                    Request Demo Access
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-2xl font-serif-luxury text-white">Demo Request Received</h3>
                <p className="text-xs text-[#B9AAA3]">Thank you! A LotLine AI specialist will reach out shortly to schedule your personalized walkthrough.</p>
                <button 
                  onClick={() => { setIsBookModalOpen(false); setFormSubmitted(false); }}
                  className="bg-white text-[#1A0F0D] font-semibold px-6 py-2 rounded-full text-xs"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}