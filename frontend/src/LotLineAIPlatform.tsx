import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import lotlineLogo from "./assets/lotline-logo.png";
import {
  LotLineApiError,
  sendChatTurn,
  sendVoiceTurn,
} from "./lib/lotlineApi";
import type { ApiHistoryTurn } from "./lib/lotlineApi";
import {
  ArrowRight, CalendarCheck, Car, Check, CheckCircle2, ChevronRight, Clock3,
  Database, Headphones, Layers3, Menu, MessageSquare, Mic, Phone,
  Pause, Play, RefreshCw, Search, Send, ShieldCheck, Sparkles, Target, TrendingUp,
  UserRoundCheck, Volume2, X, Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type DemoMode = "text" | "voice" | "phone";
type VoiceState = "Idle" | "Requesting permission" | "Listening" | "Thinking" | "Speaking" | "Stopped" | "Error";
type Vehicle = { name: string; price: string; miles: string; stock: string };
type ChatMessage = { id: string; sender: "ai" | "user"; text: string; time: string; vehicles?: Vehicle[] };

const sampleVehicles: Vehicle[] = [
  { name: "2021 Toyota Camry SE", price: "$21,450", miles: "34,200 mi", stock: "SAMPLE-214" },
  { name: "2020 Toyota Camry LE", price: "$19,900", miles: "42,100 mi", stock: "SAMPLE-198" },
];

const inventoryVehicles: Record<string, Vehicle> = {
  "car-001": { name: "2024 Ford Transit T250 Medium Roof", price: "$34,990", miles: "20,865 mi · Salvage title", stock: "car-001" },
  "car-002": { name: "2018 Honda Accord Sport", price: "$14,990", miles: "140,780 mi", stock: "car-002" },
  "car-003": { name: "2018 Mazda Mazda3 Touring Hatchback", price: "$14,990", miles: "97,870 mi", stock: "car-003" },
  "car-004": { name: "2018 BMW X1 xDrive28i", price: "$14,490", miles: "53,490 mi", stock: "car-004" },
  "car-005": { name: "2020 Ford Transit T150 Low Roof", price: "$19,990", miles: "123,750 mi", stock: "car-005" },
  "car-006": { name: "2019 Ford Transit Connect XL", price: "$18,990", miles: "Mileage not listed", stock: "car-006" },
  "car-007": { name: "2009 Lexus IS 250", price: "$8,990", miles: "172,250 mi", stock: "car-007" },
  "car-008": { name: "2014 Lexus IS 250", price: "$15,990", miles: "131,220 mi", stock: "car-008" },
  "car-009": { name: "2012 Lexus RX 350 FWD", price: "$10,990", miles: "145,880 mi", stock: "car-009" },
};

const initialChatMessage = (): ChatMessage => ({
  id: crypto.randomUUID(),
  sender: "ai",
  text: "Hi! I’m LotLine AI for Istanbul Motors. What kind of vehicle are you looking for?",
  time: now(),
});

const heroConversation = [
  { sender: "buyer", label: "Alex", text: "Hi, I need to book an oil change for my Camry this week.", time: "7:42 PM" },
  { sender: "ai", label: "LotLine", text: "Of Course!", time: "7:42 PM" },
  { sender: "ai", label: "LotLine", text: "I have Thursday at 10 AM or Friday at 2 PM. Which works best for you?", time: "7:43 PM" },
  { sender: "buyer", label: "Alex", text: "Thursday at 10 works great.", time: "7:43 PM" },
  { sender: "ai", label: "LotLine", text: "Perfect, you’re confirmed for Thursday at 10 AM.", time: "7:44 PM" },
  { sender: "ai", label: "LotLine", text: "You’re all set. Thanks for choosing LotLine!", time: "7:44 PM" },
] as const;

const voiceConversation = [
  { sender: "buyer", text: "My budget is under $22,000. What automatic sedan do you recommend?", time: "09:41 AM" },
  { sender: "ai", text: "The 2020 Toyota Camry LE is $19,900 with 42,100 miles—comfortably inside your budget.", time: "09:41 AM" },
  { sender: "buyer", text: "Do you have something with lower mileage?", time: "09:42 AM" },
  { sender: "ai", text: "Yes. The 2021 Camry SE has 34,200 miles at $21,450. Both are sample listings, and I can compare them side by side.", time: "09:42 AM" },
] as const;

const capabilityTabs = [
  { label: "Every inquiry", copy: "A clear, illustrative view of how website chat, calls, and lead context can arrive in one place.", bullets: [] },
  { label: "Buyer context", copy: "Budget, vehicle interest, timeline, and trade-in intent stay traceable to the conversation that supplied them.", bullets: [] },
  { label: "Verified matching", copy: "Filters for price, mileage, transmission, and availability return grounded sample results.", bullets: [] },
  { label: "Bring customers back", copy: "Automatically reach the right customers at the right time and turn service opportunities into appointments.", bullets: ["Contact every customer due for service", "Follow up on missed appointments and declined service", "Notify customers about open recalls"] },
] as const;

const faqs = [
  { question: "What can I test in the live demo?", answer: "The website prototype demonstrates grounded sample-inventory chat, browser microphone permission states, and browser speech output. The phone line remains disabled until a real provider and reviewed call flow are connected." },
  { question: "Does the demo use real dealership inventory?", answer: "No. Every vehicle and dealership detail is marked as sample data. Production inventory answers will use structured dealership records or a verified inventory API." },
  { question: "Can LotLine AI approve financing or complete a purchase?", answer: "No. It can explain dealership-approved information and capture interest, but it must never claim financing approval, complete a purchase, or request sensitive financial identifiers." },
  { question: "How are returning customers intended to be matched?", answer: "The planned MVP uses an exact normalized email or E.164 phone match within the same dealership. Names, devices, IP addresses, and conversation similarity never trigger an automatic merge." },
  { question: "Are the prices and platform modules final?", answer: "No. Pricing is a pilot hypothesis and planned modules are labelled as previews. The public site keeps demo-ready, illustrative, and planned capabilities visibly separate." },
];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function AnimatedNumber({ value, suffix = "", delay = 0, duration = 1100 }: { value: number; suffix?: string; delay?: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => {
      if (reduced) { animationFrame = window.requestAnimationFrame(() => setDisplayValue(value)); return; }
      const startedAt = performance.now();
      const update = (time: number) => {
        const progress = Math.min((time - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(value * eased));
        if (progress < 1) animationFrame = window.requestAnimationFrame(update);
      };
      animationFrame = window.requestAnimationFrame(update);
    }, delay);
    return () => { window.clearTimeout(timeout); window.cancelAnimationFrame(animationFrame); };
  }, [delay, duration, value]);

  return <>{displayValue}{suffix && <span>{suffix}</span>}</>;
}

function BoostCar() {
  return (
    <div className="boost-car" aria-label="Stylized accelerating car illustration">
      <div className="speed-lines" aria-hidden="true"><i /><i /><i /><i /></div>
      <svg viewBox="0 0 720 300" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="bodyPaint" x1="0" x2="1"><stop offset="0" stopColor="#2a1511" /><stop offset=".55" stopColor="#4b2118" /><stop offset="1" stopColor="#1a0d0a" /></linearGradient>
          <linearGradient id="glassPaint" x1="0" x2="1"><stop offset="0" stopColor="#d9f3f7" stopOpacity=".76" /><stop offset="1" stopColor="#6d9cab" stopOpacity=".18" /></linearGradient>
          <filter id="carGlow" x="-30%" y="-50%" width="160%" height="200%"><feGaussianBlur stdDeviation="9" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <ellipse cx="368" cy="252" rx="290" ry="18" fill="#ff5a2c" opacity=".13" filter="url(#carGlow)" />
        <path d="M49 211c8-53 34-72 95-82l96-56c30-18 67-26 111-26h113c62 0 105 30 137 83l58 13c35 8 49 27 44 68H49Z" fill="url(#bodyPaint)" stroke="#ffbea9" strokeOpacity=".22" strokeWidth="3" />
        <path d="M252 78h100v58H174l78-58Zm121 0h88c42 2 74 20 98 58H373V78Z" fill="url(#glassPaint)" />
        <path d="M58 180h75M585 174h101" stroke="#ff5a2c" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        <path d="M176 141h411" stroke="#fff" strokeOpacity=".07" strokeWidth="2" />
        {[177, 553].map((x) => <g className="wheel" transform={`translate(${x} 214)`} key={x}><circle r="55" fill="#090504" stroke="#3c2822" strokeWidth="12" /><circle r="35" fill="#160b09" stroke="#ff5a2c" strokeOpacity=".45" strokeWidth="3" /><g className="rim">{Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" y1="-8" x2="0" y2="-32" stroke={i % 2 ? "#ff5a2c" : "#d8edf1"} strokeWidth="5" transform={`rotate(${i * 45})`} strokeLinecap="round" />)}</g><circle r="8" fill="#f6f8fc" /></g>)}
      </svg>
      <div className="dust-field" aria-hidden="true">{Array.from({ length: 10 }, (_, particle) => <i key={particle} style={{ "--i": particle } as React.CSSProperties} />)}</div>
      <div className="boost-caption">
        <span className="velocity-meter" aria-hidden="true">
          <svg viewBox="0 0 80 48">
            <path className="meter-arc" d="M10 40a30 30 0 0 1 60 0" />
            <g className="meter-ticks">{Array.from({ length: 13 }, (_, index) => <line key={index} x1="40" y1="5" x2="40" y2="11" transform={`rotate(${-105 + index * 17.5} 40 40)`} style={{ "--tick": index } as React.CSSProperties} />)}</g>
            <line className="meter-needle" x1="40" y1="40" x2="40" y2="15" />
            <circle cx="40" cy="40" r="4" />
          </svg>
        </span>
        <span>Conversation velocity</span>
      </div>
    </div>
  );
}

function ProductPreview({ active }: { active: number }) {
  if (active === 0) return <div className="preview-panel preview-inbox" key="inbox"><div className="preview-toolbar"><span>Conversations</span><span className="live-dot">AI online</span></div>{["Website chat · Alex M.", "Browser voice · Sam T.", "Missed call · New lead"].map((item, index) => <div className="conversation-row" key={item} style={{ "--delay": `${index * 80}ms` } as React.CSSProperties}><span className="avatar">{index === 0 ? "AM" : index === 1 ? "ST" : "?"}</span><span><b>{item}</b><small>{index === 0 ? "Automatic Camry under $22k" : index === 1 ? "Trade-in and Saturday visit" : "Callback task suggested"}</small></span><em>{index === 0 ? "Now" : `${index * 3}m`}</em></div>)}</div>;
  if (active === 1) return <div className="preview-panel profile-preview" key="profile"><div className="profile-heading"><span className="avatar large">AM</span><span><b>Alex Morgan</b><small>Illustrative customer profile</small></span><strong>87<span>/100</span></strong></div><div className="fact-grid">{["Toyota Camry", "$18k–$22k", "Automatic", "Within 2 weeks", "Financing interest", "Trade-in: Civic"].map((fact, index) => <span key={fact} style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}>{fact}<small>{index < 4 ? "Explicit" : "Stated interest"}</small></span>)}</div><p className="source-note"><ShieldCheck size={14} /> Each fact keeps its source, confidence, and update history.</p></div>;
  if (active === 2) return <div className="preview-panel inventory-preview" key="inventory"><div className="query-line"><Search size={15} /><span>Camry · automatic · max $22,000</span><em>2 sample matches</em></div>{sampleVehicles.map((vehicle, index) => <div className="inventory-row" key={vehicle.stock} style={{ "--delay": `${index * 100}ms` } as React.CSSProperties}><span className="vehicle-thumb"><Car /></span><span><b>{vehicle.name}</b><small>{vehicle.miles} · {vehicle.stock}</small></span><strong>{vehicle.price}</strong></div>)}<p className="source-note"><Database size={14} /> Sample structured inventory—not generated vehicle facts.</p></div>;
  return (
    <div className="preview-panel comeback-preview" key="comeback">
      <div className="comeback-glow" aria-hidden="true" />
      <article className="comeback-message lotline-message">
        <span className="ai-mark"><Sparkles size={14} /></span>
        <p><small>LotLine AI</small>Hi Steve! Your Jeep is due for maintenance. Does Tuesday at 10 AM or Wednesday at 2 PM work?<time>09:06 AM</time></p>
      </article>
      <article className="comeback-message customer-message">
        <span className="avatar">SM</span>
        <p><small>Steve</small>Wednesday at 2 PM works for me!<time>09:11 AM</time></p>
      </article>
      <div className="comeback-metrics" aria-label="Illustrative service outreach metrics">
        <article className="comeback-metric appointments"><small>Illustrative appointments booked</small><strong><AnimatedNumber value={247} delay={1250} /></strong><i /></article>
        <article className="comeback-metric replies"><small>Illustrative reply rate</small><strong><AnimatedNumber value={47} suffix="%" delay={1420} /></strong><i /></article>
      </div>
    </div>
  );
}

export default function LotLineAIPlatform() {
  const rootRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const chatTouchedRef = useRef(false);
  const voicePlaybackIdRef = useRef(0);
  const chatAbortRef = useRef<AbortController | null>(null);
  const voiceAbortRef = useRef<AbortController | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef(0);
  const recordingTimerRef = useRef<number | null>(null);
  const discardRecordingRef = useRef(false);
  const sessionIdRef = useRef(crypto.randomUUID());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const [demoMode, setDemoMode] = useState<DemoMode>("text");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [initialChatMessage()]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("Idle");
  const [voiceError, setVoiceError] = useState("");
  const [voiceTurnsRemaining, setVoiceTurnsRemaining] = useState(2);
  const [voicePreviewPlaying, setVoicePreviewPlaying] = useState(false);
  const [heroStep, setHeroStep] = useState<number>(heroConversation.length - 1);
  const [voiceFlowStep, setVoiceFlowStep] = useState(0);
  const reducedMotion = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    if (!rootRef.current) return;
    let lenis: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;
    if (!reducedMotion) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -88 } });
      lenis.on("scroll", ScrollTrigger.update);
      ticker = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }
    const context = gsap.context(() => {
      if (reducedMotion) { gsap.set("[data-reveal], [data-hero-word]", { clearProps: "all" }); return; }
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-nav]", { y: -30, autoAlpha: 0, duration: 0.75 })
        .from("[data-hero-word]", { yPercent: 120, rotate: 2, duration: 1, stagger: 0.055 }, 0.16)
        .from("[data-hero-copy]", { y: 22, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, 0.45)
        .from(".boost-car", { x: 70, scale: 0.92, autoAlpha: 0, duration: 1.05 }, 0.32)
        .from(".hero-thread", { y: 28, autoAlpha: 0, duration: 0.8 }, 0.76);
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => gsap.from(element, { y: 42, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 86%", once: true } }));
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => { const amount = Number(element.dataset.parallax ?? 40); gsap.fromTo(element, { y: -amount }, { y: amount, ease: "none", scrollTrigger: { trigger: element.parentElement, start: "top bottom", end: "bottom top", scrub: 0.7 } }); });
      const storyTrack = rootRef.current?.querySelector<HTMLElement>(".story-track");
      const storySection = rootRef.current?.querySelector<HTMLElement>(".story-section");
      if (storyTrack && storySection && window.innerWidth > 900) gsap.to(storyTrack, { xPercent: -52, ease: "none", scrollTrigger: { trigger: storySection, start: "top top", end: "+=1300", scrub: 0.8, pin: true, anticipatePin: 1 } });
    }, rootRef);
    return () => { context.revert(); if (ticker) gsap.ticker.remove(ticker); lenis?.destroy(); };
  }, [reducedMotion]);

  useEffect(() => { if (reducedMotion) return; const timeout = window.setTimeout(() => setActiveFeature((current) => (current + 1) % capabilityTabs.length), 6200); return () => window.clearTimeout(timeout); }, [activeFeature, reducedMotion]);
  useEffect(() => { if (reducedMotion) return; const timeout = window.setTimeout(() => setHeroStep((current) => current === heroConversation.length - 1 ? -1 : current + 1), heroStep === -1 ? 900 : 2200); return () => window.clearTimeout(timeout); }, [heroStep, reducedMotion]);
  useEffect(() => {
    if (reducedMotion || voicePreviewPlaying) return;
    const timeout = window.setTimeout(
      () => setVoiceFlowStep((current) => current === voiceConversation.length - 1 ? -1 : current + 1),
      voiceFlowStep === -1 ? 1000 : 3200,
    );
    return () => window.clearTimeout(timeout);
  }, [voiceFlowStep, reducedMotion, voicePreviewPlaying]);
  useEffect(() => { if (!chatTouchedRef.current) return; messageEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" }); }, [messages, thinking, reducedMotion]);
  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    if (recordingTimerRef.current !== null) window.clearTimeout(recordingTimerRef.current);
    discardRecordingRef.current = true;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
    chatAbortRef.current?.abort();
    voiceAbortRef.current?.abort();
    window.speechSynthesis?.cancel();
  }, []);
  useEffect(() => { if (!bookModal) return; const handleKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setBookModal(false); }; window.addEventListener("keydown", handleKey); document.body.style.overflow = "hidden"; return () => { window.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; }; }, [bookModal]);

  const clearTimers = () => { timersRef.current.forEach((timer) => window.clearTimeout(timer)); timersRef.current = []; };
  const historyFromMessages = (source: ChatMessage[]): ApiHistoryTurn[] => source.slice(-6).map((message) => ({
    role: message.sender === "user" ? "user" : "assistant",
    content: message.text,
  }));
  const vehiclesFromIds = (ids: string[]) => ids.map((id) => inventoryVehicles[id]).filter((vehicle): vehicle is Vehicle => Boolean(vehicle));

  const sendMessage = async (value?: string) => {
    const query = (value ?? input).trim(); if (!query || thinking) return;
    const history = historyFromMessages(messages);
    chatTouchedRef.current = true;
    setMessages((current) => [...current, { id: crypto.randomUUID(), sender: "user", text: query, time: now() }]);
    setInput("");
    setThinking(true);
    chatAbortRef.current?.abort();
    const controller = new AbortController();
    chatAbortRef.current = controller;
    try {
      const result = await sendChatTurn({
        sessionId: sessionIdRef.current,
        message: query,
        history,
        signal: controller.signal,
      });
      setMessages((current) => [...current, {
        id: result.message_id,
        sender: "ai",
        text: result.assistant_text,
        time: now(),
        vehicles: vehiclesFromIds(result.vehicles),
      }]);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const message = error instanceof LotLineApiError
        ? error.message
        : "I couldn’t reach the LotLine demo service. Please try again.";
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        sender: "ai",
        text: message,
        time: now(),
      }]);
    } finally {
      if (chatAbortRef.current === controller) {
        chatAbortRef.current = null;
        setThinking(false);
      }
    }
  };
  const stopVoiceRecording = (discard = false) => {
    discardRecordingRef.current = discard;
    if (recordingTimerRef.current !== null) {
      window.clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
  };
  const resetChat = () => {
    chatTouchedRef.current = true;
    clearTimers();
    chatAbortRef.current?.abort();
    voiceAbortRef.current?.abort();
    stopVoiceRecording(true);
    window.speechSynthesis?.cancel();
    sessionIdRef.current = crypto.randomUUID();
    setThinking(false);
    setVoiceState("Idle");
    setVoiceError("");
    setMessages([initialChatMessage()]);
  };
  const handleInputKey = (event: KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") sendMessage(); };

  const speakResponse = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setVoiceState("Idle");
      setVoiceError("Your browser cannot play speech, but the response is available in text chat.");
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    speech.voice = voices.find((voice) => voice.lang.toLowerCase() === "en-us")
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
      ?? null;
    speech.rate = 1;
    speech.onstart = () => setVoiceState("Speaking");
    speech.onend = () => setVoiceState("Idle");
    speech.onerror = () => { setVoiceState("Error"); setVoiceError("Speech playback failed. The response is still available in text chat."); };
    window.speechSynthesis.speak(speech);
  };

  const submitVoiceRecording = async (audio: Blob, durationMs: number) => {
    if (!audio.size) { setVoiceState("Error"); setVoiceError("The recording was empty. Please try again."); return; }
    setVoiceState("Thinking");
    setVoiceError("");
    const controller = new AbortController();
    voiceAbortRef.current = controller;
    try {
      const result = await sendVoiceTurn({
        sessionId: sessionIdRef.current,
        audio,
        durationMs,
        history: historyFromMessages(messages),
        signal: controller.signal,
      });
      setVoiceTurnsRemaining(result.voice_turns_remaining);
      chatTouchedRef.current = true;
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), sender: "user", text: result.transcript, time: now() },
        { id: result.message_id, sender: "ai", text: result.assistant_text, time: now(), vehicles: vehiclesFromIds(result.vehicles) },
      ]);
      speakResponse(result.assistant_text);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") { setVoiceState("Stopped"); return; }
      const apiError = error instanceof LotLineApiError ? error : null;
      if (apiError?.code === "VOICE_LIMIT_REACHED") setVoiceTurnsRemaining(0);
      setVoiceState("Error");
      setVoiceError(apiError?.message ?? "The voice message could not be processed. Please use text chat or try again.");
    } finally {
      if (voiceAbortRef.current === controller) voiceAbortRef.current = null;
    }
  };

  const startVoiceDemo = async () => {
    if (voiceState === "Listening") { stopVoiceRecording(); return; }
    if (voiceState === "Thinking") { voiceAbortRef.current?.abort(); setVoiceState("Stopped"); return; }
    if (voiceState === "Speaking") { window.speechSynthesis?.cancel(); setVoiceState("Stopped"); return; }
    if (voiceTurnsRemaining <= 0) { setVoiceState("Error"); setVoiceError("This browser has used both voice messages for today. Text chat is still available."); return; }
    if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) { setVoiceState("Error"); setVoiceError("Microphone recording is not supported in this browser. Use text chat instead."); return; }
    try {
      setVoiceError("");
      setVoiceState("Requesting permission");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStreamRef.current = stream;
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      discardRecordingRef.current = false;
      recorder.ondataavailable = (event) => { if (event.data.size) audioChunksRef.current.push(event.data); };
      recorder.onerror = () => { setVoiceState("Error"); setVoiceError("The browser could not record this message."); stream.getTracks().forEach((track) => track.stop()); };
      recorder.onstart = (event) => {
        recordingStartedAtRef.current = event.timeStamp;
        setVoiceState("Listening");
      };
      recorder.onstop = (event) => {
        stream.getTracks().forEach((track) => track.stop());
        voiceStreamRef.current = null;
        mediaRecorderRef.current = null;
        if (discardRecordingRef.current) { discardRecordingRef.current = false; return; }
        const durationMs = Math.min(event.timeStamp - recordingStartedAtRef.current, 20_000);
        const audio = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void submitVoiceRecording(audio, durationMs);
      };
      recorder.start(250);
      recordingTimerRef.current = window.setTimeout(() => stopVoiceRecording(), 20_000);
    } catch {
      voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
      setVoiceState("Error");
      setVoiceError("Microphone permission was denied or recording is unavailable. Use text chat instead.");
    }
  };

  const toggleVoicePreview = () => {
    if (!("speechSynthesis" in window)) return;
    if (voicePreviewPlaying) {
      voicePlaybackIdRef.current += 1;
      window.speechSynthesis.cancel();
      setVoicePreviewPlaying(false);
      return;
    }
    const playbackId = voicePlaybackIdRef.current + 1;
    voicePlaybackIdRef.current = playbackId;
    window.speechSynthesis.cancel();
    setVoiceFlowStep(-1);
    setVoicePreviewPlaying(true);
    const spokenLines = [
      "My budget is under twenty two thousand dollars. What automatic sedan do you recommend?",
      "The 2020 Toyota Camry L E is nineteen thousand nine hundred dollars with forty two thousand one hundred miles, comfortably inside your budget.",
      "Do you have something with lower mileage?",
      "Yes. The 2021 Camry S E has thirty four thousand two hundred miles at twenty one thousand four hundred fifty dollars. Both are sample listings, and I can compare them side by side.",
    ];
    spokenLines.forEach((line, index) => {
      const speech = new SpeechSynthesisUtterance(line);
      speech.rate = 1.5;
      speech.onstart = () => {
        if (voicePlaybackIdRef.current === playbackId) setVoiceFlowStep(index);
      };
      if (index === spokenLines.length - 1) {
        speech.onend = () => {
          if (voicePlaybackIdRef.current === playbackId) setVoicePreviewPlaying(false);
        };
        speech.onerror = () => {
          if (voicePlaybackIdRef.current === playbackId) setVoicePreviewPlaying(false);
        };
      }
      window.speechSynthesis.speak(speech);
    });
  };

  return (
    <div ref={rootRef} className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-nav" data-nav><a className="brand logo-brand" href="#top" aria-label="LotLine AI home"><img className="brand-logo" src={lotlineLogo} alt="LotLine AI" /></a><nav className="desktop-nav" aria-label="Primary navigation"><a href="#product">Product</a><a href="#solutions">Solutions</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#demo">Live demo</a></nav><button className="button button-light nav-cta" onClick={() => setBookModal(true)}>Book a demo <ArrowRight size={15} /></button><button className="menu-button" aria-label="Open navigation" aria-expanded={mobileMenu} onClick={() => setMobileMenu((value) => !value)}>{mobileMenu ? <X /> : <Menu />}</button>{mobileMenu && <nav className="mobile-nav" aria-label="Mobile navigation"><a href="#product" onClick={() => setMobileMenu(false)}>Product</a><a href="#solutions" onClick={() => setMobileMenu(false)}>Solutions</a><a href="#how" onClick={() => setMobileMenu(false)}>How it works</a><a href="#pricing" onClick={() => setMobileMenu(false)}>Pricing</a><a href="#demo" onClick={() => setMobileMenu(false)}>Live demo</a><button onClick={() => { setMobileMenu(false); setBookModal(true); }}>Book a demo</button></nav>}</header>
      <main id="main">
        <section id="top" className="hero-section">
          <div className="hero-glow" data-parallax="45" />
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow" data-hero-copy><Sparkles size={14} /> AI customer engagement for dealerships</p>
              <h1>{["Every", "conversation.", "A", "better", "chance", "to", "sell."].map((word) => <span className="word-mask" key={word}><span data-hero-word>{word}&nbsp;</span></span>)}</h1>
              <p className="hero-lede" data-hero-copy>Capture buyer questions, ground answers in inventory, and turn every interaction into clear next-step context for the sales team.</p>
              <div className="hero-actions" data-hero-copy><a className="button button-light" href="#demo">Try live AI <ArrowRight size={16} /></a><button className="button button-ghost" onClick={() => setBookModal(true)}>Book a demo</button></div>
              <p className="truth-label" data-hero-copy><span /> Interactive sample dealership · Sample inventory</p>
            </div>
            <div className="hero-visual">
              <div className="hero-thread" aria-live="polite" aria-label="Sample buyer and LotLine AI conversation">
                <div className="thread-status"><i /> Live sample conversation</div>
                {heroConversation.map((message, index) => {
                  const firstVisible = Math.max(0, heroStep - 2);
                  const isVisible = heroStep >= 0 && index >= firstVisible && index <= heroStep;
                  const resetSlot = index - (heroConversation.length - 3);
                  const queueClass = heroStep === -1 ? resetSlot >= 0 ? `slot-${resetSlot} reset` : "hidden" : isVisible ? `slot-${index - firstVisible}` : index === firstVisible - 1 ? "exit" : index === heroStep + 1 ? "pending" : "hidden";
                  return <article className={`chat-card hero-message ${message.sender} ${queueClass}`} key={`hero-message-${index}`} aria-hidden={!isVisible}>
                    <span className={message.sender === "ai" ? "ai-mark" : "avatar"}>{message.sender === "ai" ? <Sparkles size={14} /> : "AM"}</span>
                    <p><small>{message.label}</small>{message.text}</p>
                    <time>{message.time}</time>
                  </article>;
                })}
              </div>
              <BoostCar />
            </div>
          </div>
        </section>
        <section className="signal-strip" aria-label="LotLine AI capability summary"><div className="marquee-track">{["Website chat", "Browser voice", "Structured inventory", "Buyer context", "Sales handoff", "24/7 response", "Website chat", "Browser voice", "Structured inventory", "Buyer context", "Sales handoff", "24/7 response"].map((label, index) => <span key={`${label}-${index}`}><i />{label}</span>)}</div></section>
        <section className="leak-section section-pad" id="solutions"><div className="section-heading" data-reveal><p className="eyebrow">Where sales quietly leak</p><h2>The customer is ready.<br /><em>The system isn’t.</em></h2><p>Disconnected tools create small gaps that become lost opportunities. LotLine AI is designed to keep the context moving.</p></div><div className="leak-grid">{[{ icon: Clock3, title: "After-hours silence", copy: "A high-intent vehicle question arrives after the team has left." }, { icon: Layers3, title: "Disconnected channels", copy: "Chat, calls, and follow-up context sit in separate places." }, { icon: CalendarCheck, title: "Forgotten next steps", copy: "A test-drive preference never becomes a visible sales task." }, { icon: Database, title: "Buried buyer context", copy: "Budget and trade-in intent remain trapped in raw conversation text." }].map(({ icon: Icon, title, copy }, index) => <article className="leak-card" data-reveal key={title}><span><Icon /></span><b>0{index + 1}</b><h3>{title}</h3><p>{copy}</p><ChevronRight /></article>)}</div></section>
        <section className="product-section section-pad" id="product"><div className="section-heading centered" data-reveal><p className="eyebrow">One conversation. Complete context.</p><h2>An AI-native <em>sales intelligence layer.</em></h2><p>Explore an illustrative product preview. Each panel tells one part of the path from inquiry to action.</p></div><div className="product-stage" data-reveal><div className="product-window"><div className="window-chrome"><span /><span /><span /><em>Illustrative product preview</em></div><ProductPreview active={activeFeature} /></div><div className="feature-tabs" role="tablist" aria-label="Product capabilities">{capabilityTabs.map((tab, index) => <button className={tab.bullets.length ? "has-detail" : ""} key={tab.label} role="tab" aria-selected={activeFeature === index} onClick={() => setActiveFeature(index)}><span className="tab-number">0{index + 1}</span><span><b>{tab.label}</b>{activeFeature === index && <small>{tab.copy}</small>}{activeFeature === index && tab.bullets.length > 0 && <ul className="capability-list">{tab.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</span>{activeFeature === index && <i className="tab-progress" key={activeFeature} />}</button>)}</div></div></section>
        <section className="story-section"><div className="story-track"><article className="story-card story-intro"><p className="eyebrow">The LotLine path</p><h2>From a question<br />to a <em>sales-ready</em> next step.</h2><p>Scroll through the handoff. Each stage preserves what was said and what remains uncertain.</p></article>{[{ n: "01", icon: MessageSquare, title: "Capture", copy: "A buyer asks for an automatic Camry under a clear budget." }, { n: "02", icon: Search, title: "Ground", copy: "Structured sample inventory returns exact matching records." }, { n: "03", icon: UserRoundCheck, title: "Understand", copy: "Vehicle, budget, timeline, and trade-in interest become traceable facts." }, { n: "04", icon: Target, title: "Act", copy: "The team sees the recommended next step and the reason behind it." }].map(({ n, icon: Icon, title, copy }) => <article className="story-card" key={n}><span>{n}</span><Icon /><h3>{title}</h3><p>{copy}</p><i /></article>)}</div></section>
        <section className="sales-section section-pad" id="how"><div className="section-heading" data-reveal><p className="eyebrow">Built for the moments that matter</p><h2>Four buyer moments.<br /><em>One connected story.</em></h2></div><div className="sales-grid">{[{ icon: Phone, title: "Missed sales call", copy: "Surface the callback need and preserve why the buyer called.", tag: "Callback task" }, { icon: Car, title: "Vehicle question", copy: "Return only sample records that satisfy the requested filters.", tag: "2 grounded matches" }, { icon: TrendingUp, title: "Dormant interest", copy: "Preview how a future workflow could identify a relevant next action.", tag: "Planned workflow" }, { icon: CalendarCheck, title: "Test-drive request", copy: "Capture the preferred day without pretending an appointment is booked.", tag: "Preference captured" }].map(({ icon: Icon, title, copy, tag }, index) => <article className="sales-card" tabIndex={0} data-reveal key={title}><div className="sales-card-top"><span><Icon /></span><small>0{index + 1}</small></div><h3>{title}</h3><p>{copy}</p><div className="sales-mini"><i /><b>{tag}</b><ChevronRight /></div><div className="sales-fx" aria-hidden="true"><span /><span /><span /></div></article>)}</div></section>
        <section className="connect-section section-pad">
          <div className="integration-orbit" data-reveal>
            <div className="orbit-art" aria-hidden="true"><i /><i /><i /><i /></div>
            <div className="orbit-card-field">
              {["Calendar", "Telephony", "Website chat", "Email", "DMS", "Analytics"].map((label, index) => <span className={`orbit-chip chip-${index + 1}`} key={label}><i>{index % 2 === 0 ? <Database /> : <Zap />}</i>{label}<small>Planned</small></span>)}
            </div>
            <div className="connect-center">
              <p className="eyebrow"><Sparkles size={13} /> Built to connect</p>
              <h2>Fits around the <em>dealership stack.</em></h2>
              <p>These are planned connector categories—not partnership claims. The first release uses controlled sample data.</p>
              <button className="button button-light" onClick={() => setBookModal(true)}>Discuss your stack <ArrowRight size={15} /></button>
            </div>
          </div>
        </section>
        <section className="listen-section section-pad">
          <div className="section-heading centered listen-heading" data-reveal>
            <p className="eyebrow"><Headphones size={14} /> Hear the interaction</p>
            <h2>A conversation that moves at <em>buyer speed.</em></h2>
            <p>Hear LotLine AI compare sample pricing and recommend cars that stay inside the buyer’s stated budget.</p>
          </div>
          <div className={`listen-window listen-dashboard ${voicePreviewPlaying ? "is-playing" : ""}`} data-reveal>
            <div className="listen-appbar"><span className="listen-brand" aria-label="LotLine AI"><img src={lotlineLogo} alt="" /></span><div className="listen-search"><Search size={14} /> Sample voice conversation</div><span><ShieldCheck size={15} /><Volume2 size={15} /></span></div>
            <div className="listen-sidebar" aria-label="Conversation dashboard navigation"><span><Database /></span><span><MessageSquare /></span><span className="active"><Phone /></span><span><CalendarCheck /></span><span><Target /></span></div>
            <div className="voice-thread price-thread">
              {voiceConversation.map((message, index) => {
                const firstVisible = Math.max(0, voiceFlowStep - 2);
                const isVisible = voiceFlowStep >= 0 && index >= firstVisible && index <= voiceFlowStep;
                const resetSlot = index - (voiceConversation.length - 3);
                const queueClass = voiceFlowStep === -1
                  ? resetSlot >= 0 ? `slot-${resetSlot} reset` : "hidden"
                  : isVisible ? `slot-${index - firstVisible}`
                    : index === firstVisible - 1 ? "exit"
                      : index === voiceFlowStep + 1 ? "pending" : "hidden";
                return <article className={`chat-card voice-message ${message.sender} ${queueClass}`} key={`voice-message-${index}`} aria-hidden={!isVisible}><span className={message.sender === "buyer" ? "avatar" : "ai-mark"}>{message.sender === "buyer" ? "AM" : <Sparkles size={14} />}</span><p><small>{message.sender === "buyer" ? "Alex" : "LotLine"}</small>{message.text}</p><time>{message.time}</time></article>;
              })}
            </div>
            <div className="voice-wave-center">
              <div className="waveform" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ "--height": `${12 + (index % 7) * 5}px`, "--delay": `${index * -.035}s` } as React.CSSProperties} />)}</div>
            </div>
          </div>
          <div className="listen-controls"><button className="listen-button" onClick={toggleVoicePreview} aria-pressed={voicePreviewPlaying}>{voicePreviewPlaying ? <Pause /> : <Play />}<span>{voicePreviewPlaying ? "Pause conversation" : "Play conversation"}</span></button></div>
        </section>
        <section className="demo-section section-pad" id="demo"><div className="section-heading centered" data-reveal><p className="eyebrow">Try the interface</p><h2>Three ways to experience <em>LotLine AI.</em></h2><p>Text and browser voice connect to the grounded dealership demo. Phone remains transparently unavailable.</p></div><div className="demo-shell" data-reveal><aside className="demo-rail"><p>Demo mode</p>{([["text", MessageSquare, "Text chat", "Live AI demo"], ["voice", Mic, "Browser voice", `${voiceTurnsRemaining} messages left`], ["phone", Phone, "Phone call", "Not connected"]] as const).map(([mode, Icon, label, note]) => <button key={mode} className={demoMode === mode ? "active" : ""} onClick={() => setDemoMode(mode)}><Icon /><span><b>{label}</b><small>{note}</small></span>{demoMode === mode && <ChevronRight />}</button>)}<div className="demo-trust"><ShieldCheck /><span><b>Grounded demo environment</b><small>Responses use the configured sample inventory. Audio and chat are not stored by LotLine.</small></span></div></aside><div className="demo-main"><div className="demo-header"><span><i />Istanbul Motors demo</span><button onClick={resetChat}><RefreshCw /> Reset</button></div>{demoMode === "text" && <div className="chat-demo"><div className="message-list" aria-live="polite">{messages.map((message) => <div className={`message ${message.sender}`} key={message.id}><small>{message.sender === "ai" ? "LotLine AI" : "You"} · {message.time}</small><p>{message.text}</p>{message.vehicles && message.vehicles.length > 0 && <div className="vehicle-results">{message.vehicles.map((vehicle) => <article key={vehicle.stock}><span><Car /></span><div><b>{vehicle.name}</b><small>{vehicle.miles} · {vehicle.stock}</small></div><strong>{vehicle.price}</strong></article>)}</div>}</div>)}{thinking && <div className="thinking"><i /><i /><i /><span>Checking dealership inventory</span></div>}<div ref={messageEndRef} /></div><div className="prompt-chips">{["Automatic sedans under $15,000", "Can I trade in my Civic?", "Book the 2018 Honda Accord Monday at 10 AM", "What about financing?"].map((prompt) => <button key={prompt} onClick={() => void sendMessage(prompt)} disabled={thinking}>{prompt}</button>)}</div><div className="chat-input"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleInputKey} aria-label="Ask the dealership" placeholder="Ask about inventory…" disabled={thinking} /><button onClick={() => void sendMessage()} aria-label="Send message" disabled={thinking || !input.trim()}><Send /></button></div></div>}{demoMode === "voice" && <div className="voice-demo"><button className={`voice-orb state-${voiceState.toLowerCase().replaceAll(" ", "-")}`} onClick={() => void startVoiceDemo()} aria-label={voiceState === "Listening" ? "Stop and send recording" : voiceState === "Speaking" ? "Stop speech playback" : "Start browser voice message"} disabled={voiceTurnsRemaining <= 0 && voiceState !== "Speaking"}><Mic /><i /><i /></button><h3>{voiceState}</h3><p>{voiceState === "Idle" && "Tap to record a voice message, then tap again to send. Recording stops automatically after 20 seconds."}{voiceState === "Requesting permission" && "Your browser is requesting microphone access."}{voiceState === "Listening" && "Listening now. Tap again to send, or wait for the 20-second limit."}{voiceState === "Thinking" && "Transcribing your message and checking dealership inventory."}{voiceState === "Speaking" && "LotLine AI is speaking. Your transcript and response are also available in text chat."}{voiceState === "Stopped" && "Voice stopped. Tap the orb to record another message."}{voiceState === "Error" && (voiceError || "Microphone or speech output is unavailable. Use text chat instead.")}</p><small>{voiceTurnsRemaining} of 2 voice messages remaining today · Maximum 20 seconds</small></div>}{demoMode === "phone" && <div className="phone-demo"><span><Phone /></span><p className="eyebrow">Phone demo not connected</p><h3>A real line will appear here only after provider and legal review.</h3><p>We will never display a simulated PSTN number as a live demo. Try browser voice or text chat now.</p><button className="button button-light" onClick={() => setDemoMode("voice")}>Use browser voice <ArrowRight size={15} /></button></div>}</div></div></section>
        <section className="pricing-section section-pad" id="pricing"><div className="section-heading centered" data-reveal><p className="eyebrow">Proposed pilot pricing</p><h2>Start with the workflow that <em>matters.</em></h2><p>These figures are hypotheses subject to pilot validation. Provider usage and final package scope are not yet fixed.</p></div><div className="pricing-grid">{[{ name: "Starter", price: "$99", desc: "A proposed entry point for a single-location dealership.", items: ["Website chat", "Sample qualification flow", "CSV inventory concept"] }, { name: "Growth", price: "$249", desc: "A proposed package for connected lead context.", items: ["Everything in Starter", "Multi-channel preview", "Planned follow-up workflows"], featured: true }, { name: "Pro", price: "$499", desc: "A proposed package for deeper operational needs.", items: ["Everything in Growth", "Advanced analytics concept", "Integration discovery"] }].map((plan) => <article className={`price-card ${plan.featured ? "featured" : ""}`} data-reveal key={plan.name}>{plan.featured && <em>Proposed popular fit</em>}<p>{plan.name}</p><h3>{plan.price}<span>/month USD</span></h3><small>{plan.desc}</small><ul>{plan.items.map((item) => <li key={item}><Check />{item}</li>)}</ul><button className={plan.featured ? "button button-light" : "button button-ghost"} onClick={() => setBookModal(true)}>Discuss {plan.name}<ArrowRight size={14} /></button></article>)}</div></section>
        <section className="faq-section section-pad"><div className="faq-card" data-reveal><div className="faq-heading"><p className="eyebrow">FAQs</p><h2>Questions, answered without the sales fog.</h2><p>Clear distinctions between the working website demo and the platform that comes next.</p></div><div className="faq-list">{faqs.map((faq, index) => <article key={faq.question} className={activeFaq === index ? "open" : ""}><button aria-expanded={activeFaq === index} onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}><span><em>0{index + 1}</em>{faq.question}</span><i>{activeFaq === index ? "−" : "+"}</i></button><div className="faq-answer"><p>{faq.answer}</p></div></article>)}</div></div></section>
        <section className="final-cta section-pad"><div className="cta-glow" data-parallax="35" /><p className="eyebrow" data-reveal>Ready when your buyers are</p><h2 data-reveal>Give every conversation<br /><em>a better chance to sell.</em></h2><div data-reveal><button className="button button-light" onClick={() => setBookModal(true)}>Book a demo <ArrowRight size={16} /></button><a className="button button-ghost" href="#demo">Try live AI</a></div></section>
      </main>
      <footer><div><a className="brand logo-brand" href="#top" aria-label="LotLine AI home"><img className="brand-logo" src={lotlineLogo} alt="LotLine AI" /></a><p>AI customer engagement and sales intelligence for used-car dealerships.</p></div><nav aria-label="Footer navigation"><a href="#product">Product</a><a href="#demo">Live demo</a><a href="#pricing">Pricing</a><a href="#">Privacy</a><a href="#">Terms</a></nav><small>© 2026 LotLine AI. Illustrative website prototype.</small></footer>
      {bookModal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setBookModal(false); }}><div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" aria-label="Close booking form" onClick={() => setBookModal(false)}><X /></button>{!submitted ? <><p className="eyebrow">Start a conversation</p><h2 id="booking-title">Book a LotLine AI demo.</h2><p>Tell us about the dealership. This prototype stores nothing and does not submit to a CRM yet.</p><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><label>Name<input required name="name" autoFocus /></label><label>Dealership<input required name="dealership" /></label><label>Business email<input required name="email" type="email" /></label><label>Main challenge<select required name="challenge" defaultValue=""><option value="" disabled>Select one</option><option>After-hours response</option><option>Disconnected lead context</option><option>Inventory questions</option><option>Follow-up consistency</option></select></label><label className="consent"><input required type="checkbox" /><span>I understand this is a prototype form and agree to the future privacy notice before real submission is enabled.</span></label><button className="button button-light" type="submit">Request a demo <ArrowRight size={15} /></button></form></> : <div className="success-state"><CheckCircle2 /><p className="eyebrow">Prototype complete</p><h2>Thank you.</h2><p>The form interaction works, but no data was transmitted. A verified lead destination will be connected before launch.</p><button className="button button-light" onClick={() => { setBookModal(false); setSubmitted(false); }}>Close</button></div>}</div></div>}
    </div>
  );
}
