import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Search, Brain, FileSearch, AlertTriangle } from 'lucide-react';

// Detect Safari
function useIsSafari() {
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setIsSafari(/^((?!chrome|android).)*safari/i.test(ua));
  }, []);
  return isSafari;
}

export default function AnalysisProgress() {
  const isSafari = useIsSafari();
  const steps = [
    { icon: FileSearch, label: "Processing Image", active: true },
    { icon: Brain, label: "AI Analysis", active: true },
    { icon: Search, label: "Identifying Features", active: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {isSafari && (
        <Alert className="mb-4 border-amber-300 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Safari Warning:</strong> GPS location capture may not work in Safari. For full functionality, use Chrome, Firefox, or Edge.
          </AlertDescription>
        </Alert>
      )}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Analysis Steps
            </h2>
            <p className="text-stone-600">
              Our AI is examining the archaeological features in your photo
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
                className="flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.active 
                    ? 'bg-gradient-to-r from-amber-500 to-stone-600 text-white' 
                    : 'bg-stone-200 text-stone-500'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`font-medium ${
                  step.active ? 'text-stone-800' : 'text-stone-500'
                }`}>
                  {step.label}
                </span>
                {step.active && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="ml-auto"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-stone-700">
              <strong>Tip:</strong> Analysis typically takes 30-60 seconds. We're examining geological features, 
              texture patterns, and comparing against our extensive archaeological database.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}