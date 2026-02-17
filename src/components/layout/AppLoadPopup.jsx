import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, CheckCircle, Megaphone } from "lucide-react";

const typeConfig = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    titleColor: "text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    titleColor: "text-amber-800",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    titleColor: "text-emerald-800",
  },
  announcement: {
    icon: Megaphone,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    titleColor: "text-purple-800",
  },
};

function fireConfetti() {
  const key = "confetti-session-fired";
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { x: 0.1, y: 0.5 } }), 300);
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { x: 0.9, y: 0.5 } }), 500);
}

export default function AppLoadPopup({ isDarkMode }) {
  const [popup, setPopup] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await base44.entities.AppSettings.list();
        if (settings.length === 0 || settings[0].confetti_enabled !== false) {
          fireConfetti();
        }
      } catch (e) {
        fireConfetti(); // default to on if settings fail
      }
    };
    load();

    const loadPopup = async () => {
      try {
        const messages = await base44.entities.PopupMessage.filter({ is_active: true });
        if (messages.length === 0) return;

        const msg = messages[0];

        if (msg.show_once_per_session) {
          const key = `popup-seen-${msg.id}`;
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, "1");
        }

        setPopup(msg);
        setOpen(true);
      } catch (e) {
        // silently fail
      }
    };
    loadPopup();
  }, []);

  if (!popup) return null;

  const config = typeConfig[popup.message_type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`max-w-md ${isDarkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white"}`}>
        <DialogHeader>
          <div className={`flex items-center gap-3 p-3 rounded-lg border mb-2 ${config.bg}`}>
            <Icon className={`w-6 h-6 ${config.color} shrink-0`} />
            <DialogTitle className={`text-lg font-bold ${config.titleColor}`}>
              {popup.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        <DialogDescription className={`text-sm leading-relaxed whitespace-pre-line ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
          {popup.message}
        </DialogDescription>
        <Button
          onClick={() => setOpen(false)}
          className={`w-full mt-2 ${
            popup.message_type === "warning"
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : popup.message_type === "success"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : popup.message_type === "announcement"
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {popup.button_text || "Got it!"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}