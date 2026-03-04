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
  },
  {
    id: "rose",
    name: { en: "Deep Rose", hi: "गहरा गुलाब" },
    bg: "#1a050d",
    accents: ["#FF1493", "#C71585", "#8B008B", "#FF69B4"],
    gradient: "from-rose-600/20 via-purple-600/20 to-pink-600/10"
  },
  {
    id: "ocean",
    name: { en: "Ocean", hi: "महासागर" },
    bg: "#05121a",
    accents: ["#00BFFF", "#1E90FF", "#00CED1", "#4169E1"],
    gradient: "from-blue-600/20 via-cyan-600/20 to-indigo-600/10"
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

const FloatingDust = React.memo(() => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div style={{ y: y1 }} className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px]" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.6 }} />
        ))}
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-pink-500/10 rounded-full blur-[2px]" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
        ))}
      </motion.div>
    </div>
  );
});

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
      setTrail(prev => [...prev, { id: Date.now() + Math.random(), x, y, color }].slice(-8));
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
        id: id + 2 + i, x, y, color, angle: (i / particleCount) * Math.PI * 2, distance: 80 + Math.random() * 80
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
