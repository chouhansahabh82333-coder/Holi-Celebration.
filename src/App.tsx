import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import { 
  Palette, 
  Share2, 
  Heart, 
  Sparkles,
  Send,
  ArrowRight,
  ChevronDown,
  Globe,
  MessageSquare,
  User,
  Clock
} from "lucide-react";

const translations = {
  en: {
    craftedBy: "Crafted by Khushal Singh Chouhan",
    festivalOfColors: "The Festival of Colors",
    scrollToExplore: "Scroll to Explore",
    vision: "The Vision",
    symphony: "A Symphony of Vibrancy",
    visionText: "This experience was designed by Khushal Singh Chouhan to push the boundaries of digital celebration. Every interaction is a brushstroke, and every splash is a memory.",
    wishesSent: "Wishes Sent",
    colorShades: "Color Shades",
    sendGreetings: "Send Your Greetings",
    greetingsDesc: "Craft a personalized message and share the spirit of Holi with the world.",
    yourName: "Your Name",
    recipient: "Recipient",
    message: "Message",
    generate: "Post Greeting",
    communityGreetings: "Community Greetings",
    communityDesc: "See how others are celebrating around the world.",
    footerDesc: "A premium digital celebration of the Indian Festival of Colors.",
    rightsReserved: "All Rights Reserved",
    madeWithPassion: "Made with Passion",
    placeholderName: "Your Name",
    placeholderMessage: "May your life be as colorful as the festival of Holi...",
    postedBy: "Posted by",
    justNow: "Just now",
    translating: "Translating...",
    heroTitle1: "HAPPY",
    heroTitle2: "HOLI",
    visionImage: "https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=800&h=1000&auto=format&fit=crop"
  },
  hi: {
    craftedBy: "कुशल सिंह चौहान द्वारा निर्मित",
    festivalOfColors: "रंगों का त्योहार",
    scrollToExplore: "खोजने के लिए स्क्रॉल करें",
    vision: "हमारा दृष्टिकोण",
    symphony: "रंगों का अनूठा संगम",
    visionText: "यह डिजिटल अनुभव कुशल सिंह चौहान द्वारा रंगों और खुशियों के उत्सव को एक नई पहचान देने के लिए बनाया गया है। यहाँ हर स्पर्श एक कला है और हर रंग एक खूबसूरत याद।",
    wishesSent: "शुभकामनाएं भेजी गईं",
    colorShades: "रंगों की छटा",
    sendGreetings: "अपनी शुभकामनाएं भेजें",
    greetingsDesc: "एक व्यक्तिगत संदेश तैयार करें और दुनिया के साथ होली की भावना साझा करें।",
    yourName: "आपका नाम",
    recipient: "प्राप्तकर्ता",
    message: "संदेश",
    generate: "शुभकामना पोस्ट करें",
    communityGreetings: "सामुदायिक शुभकामनाएं",
    communityDesc: "देखें कि दुनिया भर में अन्य लोग कैसे जश्न मना रहे हैं।",
    footerDesc: "भारतीय रंगों के त्योहार का एक प्रीमियम डिजिटल उत्सव।",
    rightsReserved: "सर्वाधिकार सुरक्षित",
    madeWithPassion: "जुनून के साथ बनाया गया",
    placeholderName: "आपका नाम",
    placeholderMessage: "आपका जीवन होली के त्योहार की तरह रंगीन हो...",
    postedBy: "द्वारा पोस्ट किया गया",
    justNow: "अभी-अभी",
    translating: "अनुवाद हो रहा है...",
    heroTitle1: "होली की",
    heroTitle2: "शुभकामनाएं",
    visionImage: "https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=800&h=1000&auto=format&fit=crop"
  }
};

interface Greeting {
  id: string;
  name: string;
  recipient: string;
  message: string;
  timestamp: number;
}

type Theme = {
  id: string;
  name: { en: string; hi: string };
  bg: string;
  accents: string[];
  gradient: string;
};

const themes: Theme[] = [
  {
    id: "midnight",
    name: { en: "Midnight", hi: "मिडनाइट" },
    bg: "#050505",
    accents: ["#FF007F", "#FFD700", "#00FF7F", "#00BFFF"],
    gradient: "from-pink-600/20 via-indigo-600/20 to-emerald-600/10"
  },
  {
    id: "royal",
    name: { en: "Royal Gold", hi: "शाही स्वर्ण" },
    bg: "#1a1605",
    accents: ["#FFD700", "#FFA500", "#F5F5DC", "#DAA520"],
    gradient: "from-yellow-600/20 via-amber-600/20 to-orange-600/10"
  },
  {
    id: "emerald",
    name: { en: "Emerald", hi: "पन्ना" },
    bg: "#051a10",
    accents: ["#00FF7F", "#32CD32", "#20B2AA", "#00FA9A"],
    gradient: "from-emerald-600/20 via-teal-600/20 to-lime-600/10"
  }
];

const TrailParticle = React.memo(({ x, y, color, onComplete }: { x: number, y: number, color: string, onComplete: () => void }) => (
  <motion.div
    initial={{ x, y, scale: 0.5, opacity: 0.6 }}
    animate={{ scale: 0, opacity: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    onAnimationComplete={onComplete}
    className="fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[60]"
    style={{ backgroundColor: color }}
  />
));

const Particle = React.memo(({ x, y, color, angle, distance, onComplete }: { x: number, y: number, color: string, angle: number, distance: number, onComplete: () => void }) => (
  <motion.div
    initial={{ x, y, scale: 1, opacity: 1 }}
    animate={{ 
      x: x + Math.cos(angle) * distance, 
      y: y + Math.sin(angle) * distance,
      scale: 0,
      opacity: 0,
      rotate: 360
    }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    onAnimationComplete={onComplete}
    className="absolute w-3 h-3 rounded-full pointer-events-none z-50"
    style={{ backgroundColor: color, filter: "blur(2px)" }}
  />
));

const Ripple = React.memo(({ x, y, color, onComplete }: { x: number, y: number, color: string, onComplete: () => void }) => (
  <motion.div
    initial={{ x, y, scale: 0, opacity: 0.6, border: `1px solid ${color}` }}
    animate={{ scale: [0, 4, 6], opacity: 0 }}
    transition={{ duration: 1, ease: "easeOut" }}
    onAnimationComplete={onComplete}
    className="absolute w-12 h-12 md:w-20 md:h-20 rounded-full pointer-events-none z-40"
    style={{ marginLeft: -24, marginTop: -24 }}
  />
));

const Splash = React.memo(({ x, y, color, onComplete }: { x: number, y: number, color: string, onComplete: () => void }) => (
  <motion.div
    initial={{ scale: 0, opacity: 1, x: x - 50, y: y - 50 }}
    animate={{ 
      scale: [0, 1.8, 2.2], 
      opacity: [1, 0.7, 0],
      rotate: [0, 90, 180],
      x: x - 50 + (Math.random() - 0.5) * 40,
      y: y - 50 + (Math.random() - 0.5) * 40
    }}
    transition={{ duration: 1.2, ease: "easeOut" }}
    onAnimationComplete={onComplete}
    className="absolute pointer-events-none z-40"
    style={{ 
      width: 100, 
      height: 100, 
      backgroundColor: color,
      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
      filter: "blur(10px)"
    }}
  />
));

const InteractionLayer = React.memo(({ loading, theme }: { loading: boolean, theme: Theme }) => {
  const [splashes, setSplashes] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [ripples, setRipples] = useState<any[]>([]);
  const [trail, setTrail] = useState<any[]>([]);
  const colors = theme.accents;
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (loading) return;
      const now = Date.now();
      if (now - lastMoveTime.current < 32) return;
      lastMoveTime.current = now;

      const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      setTrail(prev => {
        const newTrail = [...prev, { id: Date.now() + Math.random(), x, y, color }];
        if (newTrail.length > 8) return newTrail.slice(-8);
        return newTrail;
      });
    };

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      if (loading) return;
      const x = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const y = 'clientY' in e ? e.clientY : e.touches[0].clientY;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const id = Date.now();

      setSplashes(prev => [...prev, { id, x, y, color }].slice(-3));
      setRipples(prev => [...prev, { id: id + 1, x, y, color }].slice(-3));
      
      const particleCount = 8;
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: id + 2 + i,
        x, y, color,
        angle: (i / particleCount) * Math.PI * 2,
        distance: 80 + Math.random() * 80
      }));
      setParticles(prev => [...prev, ...newParticles].slice(-20));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mousedown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mousedown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [loading, colors]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {trail.map(t => <TrailParticle key={t.id} {...t} onComplete={() => setTrail(p => p.filter(x => x.id !== t.id))} />)}
        {ripples.map(r => <Ripple key={r.id} {...r} onComplete={() => setRipples(p => p.filter(x => x.id !== r.id))} />)}
        {splashes.map(s => <Splash key={s.id} {...s} onComplete={() => setSplashes(p => p.filter(x => x.id !== s.id))} />)}
        {particles.map(p => <Particle key={p.id} {...p} onComplete={() => setParticles(x => x.filter(y => y.id !== p.id))} />)}
      </AnimatePresence>
    </div>
  );
});

export default function App() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [formData, setFormData] = useState({ name: "", recipient: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const t = translations[lang];
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    fetch("/api/greetings").then(res => res.json()).then(setGreetings);
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const postGreeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.recipient || !formData.message || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/greetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: "", recipient: "", message: "" });
        fetch("/api/greetings").then(res => res.json()).then(setGreetings);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden transition-colors duration-1000" style={{ backgroundColor: currentTheme.bg }}>
      <AnimatePresence>
        {loading && (
          <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <motion.h1 animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-emerald-500">KSC HOLI</motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <InteractionLayer loading={loading} theme={currentTheme} />
        
        <header className="fixed top-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference">
          <h2 className="font-black tracking-tighter text-xl">KSC</h2>
          <div className="flex gap-4">
            <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="bg-white/10 p-2 rounded-full border border-white/20"><Palette size={18} /></button>
            <button onClick={() => setLang(l => l === "en" ? "hi" : "en")} className="bg-white/10 px-4 py-2 rounded-full border border-white/20 text-xs font-bold uppercase">{lang === "en" ? "Hindi" : "English"}</button>
          </div>
        </header>

        <AnimatePresence>
          {showThemeMenu && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 right-6 bg-black/80 backdrop-blur-xl p-4 rounded-2xl z-50 border border-white/10">
              {themes.map(theme => (
                <button key={theme.id} onClick={() => { setCurrentTheme(theme); setShowThemeMenu(false); }} className="block w-full text-left p-3 hover:bg-white/10 rounded-xl text-xs uppercase tracking-widest font-bold">{theme.name[lang]}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <section className="h-screen flex flex-col items-center justify-center text-center px-6">
          <motion.span className="text-pink-500 text-xs uppercase tracking-[0.5em] mb-4">{t.festivalOfColors}</motion.span>
          <h1 className="text-7xl md:text-9xl font-serif italic font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-emerald-400 animate-shimmer" style={{ backgroundSize: '200% auto' }}>{t.heroTitle1}<br/>{t.heroTitle2}</h1>
          <p className="mt-8 text-white/50 max-w-md mx-auto">{t.visionText}</p>
        </section>

        <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img src={t.visionImage} alt="Holi" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div>
            <span className="text-pink-500 text-xs uppercase font-bold">{t.vision}</span>
            <h2 className="text-5xl font-serif italic mt-4">{t.symphony}</h2>
            <p className="mt-6 text-white/60 leading-relaxed">{t.visionText}</p>
          </div>
        </section>

        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-xl mx-auto bg-black/40 p-10 rounded-[3rem] border border-white/10">
            <h2 className="text-3xl font-serif italic mb-8 text-center">{t.sendGreetings}</h2>
            <form onSubmit={postGreeting} className="space-y-4">
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t.yourName} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-pink-500" />
              <input value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} placeholder={t.recipient} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500" />
              <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder={t.message} rows={4} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500" />
              <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all">{t.generate}</button>
            </form>
          </div>
        </section>

        <section className="py-20 px-6 max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-serif italic mb-12">{t.communityGreetings}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {greetings.map(g => (
              <div key={g.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <p className="text-lg italic mb-4">"{g.message}"</p>
                <p className="text-xs uppercase tracking-widest text-white/40">{t.postedBy} <span className="text-white font-bold">{g.name}</span></p>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-12 text-center border-t border-white/5">
          <p className="text-white/40 text-xs uppercase tracking-widest">© 2026 {t.craftedBy}</p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { animation: shimmer 4s linear infinite; }
        @keyframes flow { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -20px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
        .animate-flow { animation: flow 15s ease-in-out infinite; }
        body { cursor: crosshair; }
      `}} />
    </div>
  );
}
