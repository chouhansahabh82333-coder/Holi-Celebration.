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
    visionText: "This experience was designed by Khushal Singh Chouhan to push the boundaries of digital celebration.",
    sendGreetings: "Send Your Greetings",
    greetingsDesc: "Craft a personalized message and share the spirit of Holi.",
    yourName: "Your Name",
    recipient: "Recipient",
    message: "Message",
    generate: "Post Greeting",
    communityGreetings: "Community Greetings",
    heroTitle1: "HAPPY",
    heroTitle2: "HOLI",
    visionImage: "https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=800&h=1000&auto=format&fit=crop"
  },
  hi: {
    craftedBy: "कुशल सिंह चौहान द्वारा निर्मित",
    festivalOfColors: "रंगों का त्योहार",
    scrollToExplore: "खोजने के लिए स्क्रॉल करें",
    vision: "हमारा दृष्टिकोण",
    visionText: "यह डिजिटल अनुभव कुशल सिंह चौहान द्वारा रंगों और खुशियों के उत्सव को एक नई पहचान देने के लिए बनाया गया है।",
    sendGreetings: "अपनी शुभकामनाएं भेजें",
    greetingsDesc: "एक व्यक्तिगत संदेश तैयार करें और होली की भावना साझा करें।",
    yourName: "आपका नाम",
    recipient: "प्राप्तकर्ता",
    message: "संदेश",
    generate: "शुभकामना पोस्ट करें",
    communityGreetings: "सामुदायिक शुभकामनाएं",
    heroTitle1: "होली की",
    heroTitle2: "शुभकामनाएं",
    visionImage: "https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?q=80&w=800&h=1000&auto=format&fit=crop"
  }
};

type Theme = { id: string; name: { en: string; hi: string }; bg: string; accents: string[] };
const themes: Theme[] = [
  { id: "midnight", name: { en: "Midnight", hi: "मिडनाइट" }, bg: "#050505", accents: ["#FF007F", "#FFD700", "#00FF7F", "#00BFFF"] },
  { id: "royal", name: { en: "Royal Gold", hi: "शाही स्वर्ण" }, bg: "#1a1605", accents: ["#FFD700", "#FFA500", "#F5F5DC", "#DAA520"] },
  { id: "emerald", name: { en: "Emerald Forest", hi: "पन्ना वन" }, bg: "#051a10", accents: ["#00FF7F", "#32CD32", "#20B2AA", "#00FA9A"] }
];

export default function App() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [greetings, setGreetings] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: "", recipient: "", message: "" });
  const t = translations[lang];

  useEffect(() => {
    fetch("/api/greetings").then(res => res.json()).then(setGreetings);
  }, []);

  const postGreeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/greetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
    if (res.ok) {
      setFormData({ name: "", recipient: "", message: "" });
      fetch("/api/greetings").then(res => res.json()).then(setGreetings);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: currentTheme.bg, color: 'white' }}>
      <header className="fixed top-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference">
        <h2 className="font-bold tracking-tighter text-xl">KSC</h2>
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
        <h1 className="text-7xl md:text-9xl font-serif italic font-black">{t.heroTitle1}<br/>{t.heroTitle2}</h1>
        <p className="mt-8 text-white/50 max-w-md mx-auto">{t.visionText}</p>
      </section>

      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
          <img src={t.visionImage} alt="Old Bridge" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-pink-500 text-xs uppercase font-bold">{t.vision}</span>
          <h2 className="text-5xl font-serif italic mt-4">A Symphony of Vibrancy</h2>
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
            <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all">Post Greeting</button>
          </form>
        </div>
      </section>
    </div>
  );
}
