import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Camera, Map, Users, ChevronRight, Star, Zap, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SplashPage() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stay = urlParams.get("stay") === "1";
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) {
        setIsAuthed(true);
        if (!stay) {
          navigate(createPageUrl("Upload"), { replace: true });
        }
      }
    });
  }, []);

  const [isDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fossilfinder-theme");
      if (saved !== null) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const features = [
    { icon: Camera, title: "AI Analysis", desc: "Identify fossils & artifacts instantly with photo AI" },
    { icon: Map, title: "Discovery Map", desc: "Explore a global map of community finds" },
    { icon: Users, title: "Community", desc: "Connect with fossil hunters around the world" },
    { icon: Zap, title: "Expert Match", desc: "Get matched with real archaeologists & paleontologists" },
  ];

  const handleSignIn = () => {
    if (isAuthed) {
      navigate(createPageUrl("Upload"), { replace: true });
    } else {
      base44.auth.redirectToLogin("/Upload");
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col ${
        isDarkMode
          ? "bg-slate-950 text-white"
          : "bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 text-stone-900"
      }`}
    >
      {/* Background blobs */}
      {isDarkMode ? (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>
      ) : (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-300/30 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow ${
              isDarkMode
                ? "bg-gradient-to-br from-cyan-500 to-emerald-600"
                : "bg-gradient-to-br from-amber-600 to-stone-700"
            }`}
          >
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-stone-800"}`}>
            FossilFinder
          </span>
        </div>
        <button
          onClick={handleSignIn}
          className={`text-sm font-medium px-4 py-2 rounded-xl transition ${
            isDarkMode
              ? "text-cyan-300 hover:bg-white/10"
              : "text-amber-700 hover:bg-amber-100"
          }`}
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl ${
              isDarkMode
                ? "bg-gradient-to-br from-cyan-500 to-emerald-600"
                : "bg-gradient-to-br from-amber-500 to-stone-700"
            }`}
          >
            <Compass className="w-12 h-12 text-white" />
          </div>

          <h1
            className={`text-5xl md:text-7xl font-extrabold tracking-tight mb-4 ${
              isDarkMode ? "text-white" : "text-stone-900"
            }`}
          >
            Fossil
            <span
              className={`${
                isDarkMode ? "text-cyan-400" : "text-amber-600"
              }`}
            >
              Finder
            </span>
          </h1>

          <p
            className={`text-base font-semibold tracking-wide uppercase mb-3 ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`}
          >
            Help the world, free forever.
          </p>
          <p
            className={`text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}
          >
            AI-powered fossil & artifact identification. Upload a photo and get instant analysis from our archaeological AI.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSignIn}
              className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold shadow-lg transition ${
                isDarkMode
                  ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSignIn}
              className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold border transition ${
                isDarkMode
                  ? "border-white/20 text-white hover:bg-white/10"
                  : "border-stone-300 text-stone-700 hover:bg-white"
              }`}
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl w-full"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className={`rounded-2xl p-5 text-left shadow-sm border transition ${
                isDarkMode
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-white/70 border-stone-200 hover:bg-white"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  isDarkMode
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className={`font-semibold text-sm mb-1 ${isDarkMode ? "text-white" : "text-stone-800"}`}>
                {title}
              </h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-stone-500"}`}>
                {desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={`flex items-center gap-2 mt-12 text-sm ${isDarkMode ? "text-slate-400" : "text-stone-500"}`}
        >
          <div className="flex -space-x-2">
            {["🦕", "🪨", "🦴", "🔍"].map((emoji, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${
                  isDarkMode ? "border-slate-950 bg-slate-800" : "border-amber-50 bg-white"
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
          <span>Join fossil enthusiasts worldwide</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className={`relative z-10 text-center py-6 text-xs ${isDarkMode ? "text-slate-600" : "text-stone-400"}`}>
        © 2026 FossilFinder · Built by seayc31
      </footer>
    </div>
  );
}