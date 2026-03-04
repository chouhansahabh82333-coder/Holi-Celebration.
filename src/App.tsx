import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import React, { useState, useEffect, useRef } from "react";
import { Palette, Share2, Send, ChevronDown, Globe, User, Clock } from "lucide-react";

const translations = {
  en: {
    craftedBy: "Crafted by Khushal Singh Chouhan",
    festivalOfColors: "The Festival of Colors",
    scrollToExplore: "Scroll to Explore",
    vision: "The Vision",
    symphony: "A Symphony of Vibrancy",
    visionText: "This experience was designed by Khushal Singh Chouhan to push the boundaries of digital celebration. Every interaction is a brushstroke, and every splash is a memory.",
    quote: "Color is a power which directly influences the soul.",
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
    quote: "रंग एक ऐसी शक्ति है जो सीधे आत्मा को प्रभावित करती है।",
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
    translating: "अनुवाद हो रहा है...",
    heroTitle1: "होली की",
    heroTitle2: "शुभकामनाएं",
    visionImage: "https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=800&h=1000&auto=format&fit=crop"
  }
};

interface Greeting { id: string; name: string; recipient: string; message: string; timestamp: number; }
type Theme = { id: string; name: { en: string; hi: string }; bg: string; accents: string[]; };

const themes: Theme[] = [
  { id: "midnight", name: { en: "Midnight", hi: "मिडनाइट" }, bg: "#050505", accents: ["#FF007F", "#FFD700", "#00FF7F", "#00BFFF"] },
  { id: "royal", name: { en: "Royal Gold", hi: "शाही स्वर्ण" }, bg: "#1a1605", accents: ["#FFD700", "#FFA500", "#F5F5DC", "#DAA520"] },
  { id: "rose", name: { en: "Deep Rose", hi: "गहरा गुलाब" }, bg: "#1a050d", accents: ["#FF1493", "#C71585", "#8B008B", "#FF69B4"] }
];

const TrailParticle = React.memo(({ x, y, color, onComplete }: any) => (
  <motion.div initial={{ x, y, scale: 0.5, opacity: 0.6 }} animate={{ scale: 0, opacity: 0 }} transition={{ duration: 0.4 }} onAnimationComplete={onComplete} className="fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[60]" style={{ backgroundColor: color }} />
));

const Particle = React.memo(({ x, y, color, angle, distance, onComplete }: any) => (
  <motion.div initial={{ x, y, scale: 1, opacity: 1 }} animate={{ x: x + Math.cos(angle) * distance, y: y + Math.sin(angle) * distance, scale: 0, opacity: 0 }} transition={{ duration: 0.8 }} onAnimationComplete={onComplete} className="absolute w-3 h-3 rounded-full pointer-events-none z-50" style={{ backgroundColor: color }} />
));

const Splash = React.memo(({ x, y, color, onComplete }: any) => (
  <motion.div initial={{ scale: 0, opacity: 1, x: x - 50, y: y - 50 }} animate={{ scale: [0, 2, 2.5], opacity: 0 }} transition={{ duration: 1 }} onAnimationComplete={onComplete} className="absolute pointer-events-none z-40 w-[100px] h-[100px] blur-xl rounded-full" style={{ backgroundColor: color }} />
));

const InteractionLayer = React.memo(({ loading, theme }: { loading: boolean, theme: Theme }) => {
  const [splashes, setSplashes] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [trail, setTrail] = useState<any[]>([]);
  const colors = theme.accents;

  useEffect(() => {
    const handleMove = (e: any) => {
      if (loading) return;
      const x = e.clientX || e.touches?.[0]?.clientX;
      const y = e.clientY || e.touches?.[0]?.clientY;
      if (!x || !y) return;
      const color = colors[Math.floor(Math.random() * colors.length)];
      setTrail(prev => [...prev, { id: Math.random(), x, y, color }].slice(-8));
    };
    const handleDown = (e: any) => {
      if (loading) return;
      const x = e.clientX || e.touches?.[0]?.clientX;
      const y = e.clientY || e.touches?.[0]?.clientY;
      if (!x || !y) return;
      const color = colors[Math.floor(Math.random() * colors.length)];
      setSplashes(prev => [...prev, { id: Math.random(), x, y, color }].slice(-3));
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({ id: Math.random(), x, y, color, angle: (i / 8) * Math.PI * 2, distance: 100 }));
      setParticles(prev => [...prev, ...newParticles].slice(-20));
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mousedown", handleDown); };
  }, [loading, colors]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {trail.map(t => <TrailParticle key={t.id} {...t} onComplete={() => setTrail(p => p.filter(x => x.id !== t.id))} />)}
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
    const timer = setTimeout(() => setLoading(false), 4000);
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
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="relative min-h-screen text-white font-sans overflow-x-hidden transition-colors duration-1000" style={{ backgroundColor: currentTheme.bg }}>
      
      {/* BACKGROUND FLOW EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full animate-flow opacity-20" style={{ backgroundColor: currentTheme.accents[0] }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full animate-flow opacity-20 [animation-delay:5s]" style={{ backgroundColor: currentTheme.accents[1] }} />
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div key="preloader" exit={{ opacity: 0, y: -100 }} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} className="mb-10 w-32 h-32 border border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
              <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-yellow-500 to-emerald-500 z-10">KSC</span>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-t-2 border-pink-500/20 rounded-[2rem]" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl md:text-5xl font-serif italic text-white mb-4">Khushal Singh Chouhan</motion.h1>
            
            {/* LOADING DOTS */}
            <div className="flex gap-2 mt-4">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-pink-500" />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.6em] text-slate-500 mt-6">{t.craftedBy}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <InteractionLayer loading={loading} theme={currentTheme} />
        <header className="fixed top-0 w-full z-50 p-8 flex justify-between items-center mix-blend-difference">
          <div className="w-12 h-12 border border-white/20 rounded-xl flex items-center justify-center bg-white/5 backdrop-blur-sm"><span className="font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-pink-500 via-yellow-500 to-emerald-500">KSC</span></div>
          <div className="flex gap-4">
            <button onClick={() => setShowThemeMenu(!showThemeMenu)} className="bg-white/10 p-3 rounded-full border border-white/20"><Palette size={18} /></button>
            <button onClick={() => setLang(l => l === "en" ? "hi" : "en")} className="bg-white/10 px-6 py-2 rounded-full border border-white/20 text-xs font-bold uppercase tracking-widest">{lang === "en" ? "Hindi" : "English"}</button>
          </div>
        </header>

        <AnimatePresence>
          {showThemeMenu && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-24 right-8 bg-black/80 backdrop-blur-xl p-4 rounded-2xl z-50 border border-white/10 min-w-[180px]">
              {themes.map(theme => (
                <button key={theme.id} onClick={() => { setCurrentTheme(theme); setShowThemeMenu(false); }} className="block w-full text-left p-4 hover:bg-white/10 rounded-xl text-[10px] uppercase tracking-widest font-bold">{theme.name[lang]}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <section className="h-screen flex flex-col items-center justify-center text-center px-8 relative z-10">
          <motion.span className="text-pink-500 text-[10px] uppercase tracking-[0.6em] mb-8">{t.festivalOfColors}</motion.span>
          <h1 className="text-[clamp(3rem,15vw,10rem)] leading-[0.85] font-serif italic font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-400 to-emerald-400 animate-shimmer" style={{ backgroundSize: '200% auto' }}>{t.heroTitle1}<br/>{t.heroTitle2}</h1>
          <p className="mt-12 text-white/50 max-w-2xl mx-auto text-lg font-light">{t.visionText}</p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-16">
            <button onClick={() => document.getElementById('wishes')?.scrollIntoView({ behavior: 'smooth' })} className="group relative px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-widest text-sm overflow-hidden transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-yellow-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3 group-hover:text-white">{t.sendGreetings} <Send size={18} /></span>
            </button>
          </motion.div>
        </section>

        <section id="vision" className="py-32 px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="aspect-[4/5] rounded-[3rem] overflow-hidden relative group">
            <img src={t.visionImage} alt="Holi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
            <div className="absolute bottom-12 left-12 pr-12">
              <p className="text-3xl font-serif italic text-white drop-shadow-2xl">"{t.quote}"</p>
            </div>
          </motion.div>
          <div className="space-y-12">
            <span className="text-pink-500 text-xs uppercase font-bold tracking-widest">{t.vision}</span>
            <h2 className="text-7xl font-serif font-light leading-tight">{t.symphony}</h2>
            <p className="text-white/60 text-lg leading-relaxed font-light">{t.visionText}</p>
          </div>
        </section>

        <section id="wishes" className="py-32 px-8 bg-white/5">
          <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-3xl p-12 md:p-24 rounded-[4rem] border border-white/10 text-center">
            <h2 className="text-5xl font-serif italic mb-8">{t.sendGreetings}</h2>
            <p className="text-white/50 mb-12 max-w-lg mx-auto">{t.greetingsDesc}</p>
            <form onSubmit={postGreeting} className="space-y-8 text-left">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t.yourName}</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t.placeholderName} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-pink-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t.recipient}</label>
                <input value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} placeholder={t.recipient} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-yellow-500" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-4">{t.message}</label>
                <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder={t.placeholderMessage} rows={4} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-emerald-500 resize-none" />
              </div>
              <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-3">{t.generate} <Send size={18} /></button>
            </form>
          </div>
        </section>

        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-20"><span className="text-pink-500 text-xs uppercase font-bold tracking-widest">{t.communityGreetings}</span><h2 className="text-5xl font-serif italic mt-4">{t.communityDesc}</h2></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {greetings.map(g => (
                <motion.div key={g.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all cursor-default">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center text-pink-500 mb-6"><User size={24} /></div>
                  <p className="text-xl italic mb-8 font-light leading-relaxed">"{g.message}"</p>
                  <div className="pt-6 border-t border-white/5"><p className="text-xs uppercase tracking-widest text-white/40">{t.postedBy} <span className="text-white font-bold">{g.name}</span></p></div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <footer className="py-24 px-8 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-left"><h3 className="text-2xl font-serif italic font-bold mb-4">HoliFest</h3><p className="text-white/40 text-sm max-w-xs">{t.footerDesc}</p></div>
            <div className="text-center"><span className="text-[10px] uppercase tracking-[0.4em] text-white/30">Designed & Developed By</span><h3 className="text-2xl font-serif italic mt-2">Khushal Singh Chouhan</h3></div>
            <div className="text-center md:text-right"><p className="text-white/60 text-sm">© 2026 {t.rightsReserved}</p><p className="text-white/20 text-[10px] uppercase tracking-widest">Made with Passion</p></div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-shimmer { animation: shimmer 4s linear infinite; }
        @keyframes flow { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -30px) scale(1.1); } 66% { transform: translate(-30px, 30px) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
        .animate-flow { animation: flow 15s ease-in-out infinite; }
        body { background-color: #050505; cursor: crosshair; }
      `}} />
    </div>
  );
}
