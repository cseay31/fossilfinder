import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Calendar, Ruler, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const virtualTours = {
  egypt: {
    name: "Pyramids of Giza",
    location: "Giza, Egypt",
    period: "c. 2580-2560 BCE",
    civilization: "Ancient Egypt",
    description: "Explore the last remaining Wonder of the Ancient World",
    stops: [
      {
        title: "Great Pyramid of Khufu",
        image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800",
        description: "The largest of the three pyramids, built for Pharaoh Khufu. Originally 481 feet tall, it was the tallest man-made structure for 3,800 years.",
        facts: [
          "Contains approximately 2.3 million limestone blocks",
          "Each block weighs 2.5 to 15 tons",
          "Built over 20 years with estimated 100,000 workers",
          "Aligned almost perfectly with cardinal directions"
        ]
      },
      {
        title: "Pyramid of Khafre",
        image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800",
        description: "The second-largest pyramid, built for Pharaoh Khafre, son of Khufu. Appears taller due to its elevated location.",
        facts: [
          "Originally 471 feet tall",
          "Still retains some original limestone casing at peak",
          "Adjacent to the Great Sphinx",
          "Contains two entrances on north face"
        ]
      },
      {
        title: "The Great Sphinx",
        image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800",
        description: "Massive limestone statue with a lion's body and human head, likely representing Pharaoh Khafre.",
        facts: [
          "Carved from single piece of limestone",
          "240 feet long and 66 feet high",
          "Face is 13 feet wide",
          "Missing nose possibly destroyed by Napoleonic troops"
        ]
      },
      {
        title: "Valley Temple",
        image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800",
        description: "Mortuary temple where pharaoh's body was mummified and prepared for burial.",
        facts: [
          "Built with massive limestone and granite blocks",
          "Connected to pyramid by causeway",
          "Used for mummification rituals",
          "Features alabaster floors and granite pillars"
        ]
      }
    ]
  },
  machu_picchu: {
    name: "Machu Picchu",
    location: "Cusco Region, Peru",
    period: "c. 1450 CE",
    civilization: "Inca Empire",
    description: "Lost City of the Incas high in the Andes Mountains",
    stops: [
      {
        title: "Overview of Machu Picchu",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
        description: "Built by Inca Emperor Pachacuti, this 'Lost City' remained hidden from Spanish conquistadors and was rediscovered in 1911 by Hiram Bingham.",
        facts: [
          "Located 7,970 feet above sea level",
          "Built without mortar - stones fit perfectly",
          "Abandoned during Spanish conquest",
          "UNESCO World Heritage Site since 1983"
        ]
      },
      {
        title: "Temple of the Sun",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
        description: "Semi-circular tower with windows aligned to solstices, used for astronomical observations.",
        facts: [
          "Only curved wall in Machu Picchu",
          "Windows align with June solstice sunrise",
          "Built over natural rock formation",
          "Likely used for religious ceremonies"
        ]
      },
      {
        title: "Intihuatana Stone",
        image: "https://images.unsplash.com/photo-1596520743446-ca07d0bf1b7e?w=800",
        description: "Ritual stone or 'hitching post of the sun,' used as astronomical clock or calendar.",
        facts: [
          "Carved from single piece of granite",
          "Aligned with mountains and celestial events",
          "One of few intact examples (others destroyed)",
          "Name means 'to tie the sun'"
        ]
      },
      {
        title: "Agricultural Terraces",
        image: "https://images.unsplash.com/photo-1531065208531-4036c0dba3f5?w=800",
        description: "Ingenious farming terraces that prevented erosion and maximized arable land.",
        facts: [
          "Over 700 terraces at the site",
          "Built with multiple drainage layers",
          "Allowed cultivation of crops at high altitude",
          "Still stable after 500+ years"
        ]
      }
    ]
  },
  pompeii: {
    name: "Pompeii",
    location: "Campania, Italy",
    period: "79 CE (destruction)",
    civilization: "Roman Empire",
    description: "Ancient Roman city frozen in time by Mount Vesuvius eruption",
    stops: [
      {
        title: "Forum of Pompeii",
        image: "https://images.unsplash.com/photo-1545125566-7c876c7c9b18?w=800",
        description: "The political, economic, and religious center of ancient Pompeii, surrounded by temples, markets, and government buildings.",
        facts: [
          "150m x 38m rectangular plaza",
          "Surrounded by two-story colonnades",
          "Location of markets, courts, elections",
          "Paved with travertine stone blocks"
        ]
      },
      {
        title: "Amphitheater",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
        description: "One of the oldest surviving Roman amphitheaters, built around 70 BCE.",
        facts: [
          "Capacity: 20,000 spectators",
          "Oldest surviving Roman amphitheater",
          "Hosted gladiatorial games and shows",
          "Remarkably well-preserved structure"
        ]
      },
      {
        title: "Villa of the Mysteries",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
        description: "Suburban villa famous for its well-preserved frescoes depicting mysterious Dionysian cult rituals.",
        facts: [
          "Frescoes cover entire room walls",
          "Depicts initiation into cult of Dionysus",
          "Colors still vibrant after 2000 years",
          "Figures appear life-sized"
        ]
      },
      {
        title: "Plaster Casts of Victims",
        image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800",
        description: "Haunting casts of Pompeii's citizens, created by pouring plaster into voids left in ash deposits.",
        facts: [
          "Technique developed by Giuseppe Fiorelli in 1863",
          "Captures final moments of victims",
          "Preserves clothing and facial expressions",
          "Estimated 2,000 people died in eruption"
        ]
      }
    ]
  }
};

export default function VirtualTourViewer({ siteId, onClose }) {
  const [currentStop, setCurrentStop] = useState(0);
  const tour = virtualTours[siteId];
  
  if (!tour) return null;

  const stop = tour.stops[currentStop];
  const totalStops = tour.stops.length;

  const nextStop = () => {
    if (currentStop < totalStops - 1) {
      setCurrentStop(currentStop + 1);
    }
  };

  const prevStop = () => {
    if (currentStop > 0) {
      setCurrentStop(currentStop - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold">{tour.name}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {tour.location}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {tour.period}
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {tour.civilization}
            </Badge>
          </div>
          <p className="mt-2 text-amber-50">{tour.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Stop {currentStop + 1} of {totalStops}
            </span>
            <div className="flex gap-1">
              {tour.stops.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStop(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentStop ? 'bg-amber-600 w-6' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStop}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 space-y-6"
            >
              {/* Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={stop.image} 
                  alt={stop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-2xl font-bold text-white">{stop.title}</h3>
                </div>
              </div>

              {/* Description */}
              <Card className="border-2 border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-slate-800">{stop.description}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Facts */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-amber-600" />
                  Fascinating Facts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stop.facts.map((fact, idx) => (
                    <Card key={idx} className="border-slate-200">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <p className="text-sm text-slate-700">{fact}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <Button
            onClick={prevStop}
            disabled={currentStop === 0}
            variant="outline"
            className="border-slate-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-slate-600 font-medium">
            {stop.title}
          </span>
          <Button
            onClick={nextStop}
            disabled={currentStop === totalStops - 1}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}