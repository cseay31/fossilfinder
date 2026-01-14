import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moduleContent = {
  "intro-archaeology": {
    sections: [
      {
        title: "What is Archaeology? (Part 1)",
        content: `Archaeology is the scientific study of human history and prehistory through the excavation and analysis of artifacts, structures, and other physical remains. It helps us understand how people lived in the past, from ancient civilizations to more recent history.

**The Scope of Archaeology:**
Archaeology covers an enormous time span - from the first stone tools made by our ancestors over 2.5 million years ago to objects from the recent past. Some archaeologists study dinosaurs (paleontology), while others focus on industrial-era factories or even modern garbage dumps!

**Archaeological Evidence Includes:**
• Artifacts (tools, pottery, jewelry, weapons, art)
• Ecofacts (environmental remains like seeds, pollen, bones, shells)
• Features (buildings, roads, burial sites, fire pits, post holes)
• Context (where and how items were found - this is crucial!)

**Why Context Matters:**
Finding a Roman coin is interesting. Finding it in a Viking grave tells a completely different story about trade, conquest, or cultural exchange. The location, depth, and surrounding materials of every find provide crucial information.

**The Archaeological Process:**
1. Survey - Finding sites through research, aerial photography, or walking the land
2. Excavation - Carefully digging and recording everything
3. Analysis - Studying artifacts in labs
4. Interpretation - Forming theories about past peoples
5. Publication - Sharing findings with the world

Archaeologists use various methods to date and analyze findings, including stratigraphy (study of layers), radiocarbon dating, and comparative analysis with known artifacts.`
      },
      {
        title: "What is Archaeology? (Part 2)",
        content: `**Subdisciplines of Archaeology:**

**Prehistoric Archaeology:**
Studies human societies before written records. This includes the Paleolithic (Old Stone Age), Mesolithic (Middle Stone Age), and Neolithic (New Stone Age) periods. Prehistoric archaeologists might study cave paintings, early tools, or the transition to agriculture.

**Historical Archaeology:**
Focuses on civilizations with written records, often combining archaeological evidence with historical documents. Examples include Roman forts, medieval castles, or Colonial American settlements.

**Underwater Archaeology:**
Studies submerged sites like shipwrecks, sunken cities, or flooded caves. Requires special diving skills and equipment. Famous discoveries include the Titanic and ancient Mediterranean shipwrecks.

**Bioarchaeology:**
Analyzes human and animal remains to understand health, diet, disease, and population movements. Can reveal information about violence, nutrition deficiencies, and life expectancy.

**Experimental Archaeology:**
Recreates ancient techniques to understand how things were made and used. This might involve making stone tools, building Roman roads, or firing ancient pottery designs.

**Cultural Resource Management (CRM):**
Archaeological work done before construction projects. Required by law in many places to preserve important sites. This is where most professional archaeologists work today!

**The Archaeological Record:**
Only a tiny fraction of past human activity becomes preserved. Organic materials like wood, leather, and textiles usually decay unless conditions are exceptional (very dry, very wet, frozen, or oxygen-free). This means archaeologists work with an incomplete picture and must be careful about drawing conclusions.`
      },
      {
        title: "Tools & Methods (Part 1: Field Work)",
        content: `Archaeologists use a variety of specialized tools and cutting-edge technology in their work:

**Basic Field Tools:**
• Trowels (flat, pointed) - The archaeologist's most important tool
• Brushes (various sizes) - For delicate cleaning
• Buckets and wheelbarrows - Moving excavated soil
• Screens/sieves (different mesh sizes) - Finding small artifacts
• Line levels and measuring tapes - Precise measurements
• Photography equipment with scales - Documentation
• Total Station or GPS - Precise 3D positioning
• Pencils and waterproof notebooks - Field notes

**Survey Equipment:**
• Transit or theodolite - Mapping elevations
• Metal detectors - Finding buried metal objects
• Soil probes - Testing depth of deposits
• Ranging poles and line - Marking boundaries
• Compasses - Orientation and mapping

**Documentation Tools:**
• Context sheets - Recording stratigraphic units
• Feature forms - Documenting structures
• Photo boards - Labeling images
• Drawing equipment - Plans and sections
• Bags and tags - Organizing finds

**The Grid System:**
Archaeologists typically divide sites into squares (often 5x5 meters or 2x2 meters). Each square is excavated separately and all finds are labeled with their grid coordinates. This creates a 3D map of where everything was found.

**Stratigraphic Excavation:**
Digging by layers (strata) rather than arbitrary depths. Newer layers on top, older below. Each layer represents a period of time - a flood, a building phase, an abandonment, etc. Understanding and recording these layers is fundamental to archaeology.`
      },
      {
        title: "Tools & Methods (Part 2: Lab & Technology)",
        content: `**Laboratory Analysis Tools:**

• Microscopes (stereoscopic, petrographic, SEM) - Examining tiny details, use-wear on tools, material composition
• Spectrometers - Identifying chemical composition of materials
• X-ray fluorescence (XRF) - Non-destructive elemental analysis
• CT scanners - 3D imaging without unwrapping mummies or opening containers
• DNA extraction equipment - Genetic analysis of remains
• Stable isotope analysis - Determining diet and migration patterns
• Residue analysis - Finding traces of food, drink, or other substances

**Modern Remote Sensing Technology:**

**Ground-Penetrating Radar (GPR):**
Sends radar pulses into the ground to map buried structures without excavation. Can detect walls, graves, and other features up to several meters deep.

**LiDAR (Light Detection and Ranging):**
Laser scanning from aircraft that penetrates forest canopy to reveal hidden structures. Revolutionary for finding Maya cities and other sites in dense vegetation.

**Aerial Photography & Satellite Imagery:**
Reveals crop marks, soil changes, and shadows that indicate buried structures. Historical aerial photos can show sites before modern development.

**Magnetometry:**
Detects magnetic variations in soil caused by ancient fires, iron objects, or disturbed earth. Can map entire sites quickly.

**Drones:**
Affordable aerial photography and mapping. Can create detailed 3D models of sites and track excavation progress.

**Geographic Information Systems (GIS):**
Computer mapping that layers different data types - site locations, terrain, water sources, ancient roads, etc. Helps understand settlement patterns and relationships between sites.

**3D Photogrammetry:**
Creating detailed 3D models from multiple photographs. Preserves sites digitally and allows remote study.

The key to archaeology is combining all these methods with careful, methodical work. Every item's location and context provides crucial information about the past. Technology helps us see and preserve more, but human interpretation remains essential.`
      },
      {
        title: "Career Paths",
        content: `Archaeology offers diverse career opportunities:

**Academic Archaeology:**
• University professors and researchers
• Museum curators and educators
• Laboratory specialists

**Field Archaeology:**
• Cultural Resource Management (CRM)
• Excavation directors and technicians
• Site supervisors

**Specialized Areas:**
• Underwater archaeology
• Forensic archaeology
• Heritage conservation
• Archaeological consulting

**Required Education:**
• Bachelor's degree for entry-level positions
• Master's degree for most professional roles
• PhD for academic and research positions
• Field schools and hands-on experience are essential

The field combines outdoor fieldwork, laboratory analysis, and scholarly research, making it perfect for those who love history, science, and discovery!`
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of archaeology?",
        options: [
          "To collect valuable artifacts",
          "To study human history through physical remains",
          "To find buried treasure",
          "To prove historical theories"
        ],
        correctAnswer: 1
      },
      {
        question: "Which technology is commonly used for aerial archaeological surveys?",
        options: [
          "Microscopes",
          "Trowels",
          "LiDAR and drones",
          "Chemical analysis"
        ],
        correctAnswer: 2
      },
      {
        question: "What minimum education is typically required for professional archaeology positions?",
        options: [
          "High school diploma",
          "Bachelor's degree",
          "Master's degree",
          "PhD only"
        ],
        correctAnswer: 2
      }
    ]
  },
  "fossil-identification": {
    sections: [
      {
        title: "Types of Fossils",
        content: `Fossils are the preserved remains or traces of ancient life. There are several main types:

**Body Fossils:**
• Bones and teeth (most common)
• Shells and exoskeletons
• Petrified wood and plant material
• Preserved soft tissue (rare)

**Trace Fossils:**
• Footprints and trackways
• Burrows and nests
• Coprolites (fossilized feces)
• Bite marks and feeding traces

**Chemical Fossils:**
• Biomarkers in rocks
• Organic molecules preserved in sediment

**Preservation Types:**
• Permineralization (minerals fill spaces)
• Replacement (original material replaced)
• Carbonization (carbon film remains)
• Amber preservation (trapped in tree resin)
• Ice and tar preservation

Understanding the type of fossil helps determine its age, the organism it came from, and the environment in which it formed.`
      },
      {
        title: "Dating Methods",
        content: `Scientists use various methods to determine the age of fossils:

**Relative Dating:**
• Stratigraphy (law of superposition - older layers below)
• Index fossils (known age markers)
• Cross-dating with geological events

**Absolute Dating:**
• Radiocarbon dating (up to ~50,000 years)
  - Measures decay of Carbon-14
  - Best for organic materials
• Potassium-Argon dating (millions of years)
  - Used for volcanic rocks
  - Dates surrounding geological layers
• Uranium-Lead dating (billions of years)
  - Most accurate for very old rocks

**Other Methods:**
• Thermoluminescence
• Electron spin resonance
• Amino acid racemization

Combining multiple dating methods provides the most accurate age estimates. Context is crucial - knowing the geological layer and associated materials helps confirm dates.`
      },
      {
        title: "Preservation",
        content: `Fossil preservation requires specific conditions:

**Key Factors:**
• Rapid burial (prevents decay and scavenging)
• Low oxygen environment (slows decomposition)
• Presence of minerals for replacement
• Stable conditions over millions of years

**Best Preservation Environments:**
• Lake beds and ocean floors
• River deltas and floodplains
• Volcanic ash deposits
• Tar pits and bogs
• Amber and ice

**What Gets Preserved:**
Hard parts (bones, shells) preserve better than soft tissue. However, exceptional preservation can capture:
• Skin impressions
• Feathers and fur
• Internal organs
• Last meals in digestive systems

**Modern Fossil Collection:**
• Document exact location (GPS coordinates)
• Photograph in situ (original position)
• Protect during extraction (plaster jackets)
• Properly catalog and store
• Report significant finds to authorities

Remember: In many places, fossil collection requires permits, and significant discoveries should be reported to scientific institutions.`
      }
    ],
    quiz: [
      {
        question: "What are trace fossils?",
        options: [
          "Fossils preserved in amber",
          "Footprints, burrows, and other evidence of activity",
          "Microscopic fossils",
          "Partially preserved bones"
        ],
        correctAnswer: 1
      },
      {
        question: "Which dating method is best for fossils up to 50,000 years old?",
        options: [
          "Uranium-Lead dating",
          "Potassium-Argon dating",
          "Radiocarbon dating",
          "Stratigraphy"
        ],
        correctAnswer: 2
      },
      {
        question: "What is the most important factor for fossil preservation?",
        options: [
          "High oxygen environment",
          "Rapid burial and low oxygen",
          "Extreme heat",
          "Direct sunlight exposure"
        ],
        correctAnswer: 1
      }
    ]
  },
  "excavation-techniques": {
    sections: [
      {
        title: "Site Survey",
        content: `Before excavation begins, archaeologists conduct thorough site surveys:

**Initial Survey Methods:**
• Desktop research (historical records, maps, aerial photos)
• Field walking (systematic surface collection)
• Remote sensing (magnetometry, ground-penetrating radar)
• Test pits and shovel test units

**Site Mapping:**
• Establish datum point (reference marker)
• Create grid system for precise location recording
• Topographic mapping
• GPS coordinates for all features

**Assessment:**
• Determine site boundaries
• Identify areas of interest
• Assess preservation state
• Plan excavation strategy

**Permissions and Permits:**
• Land owner permission
• Archaeological permits from authorities
• Environmental impact assessments
• Indigenous consultation (when applicable)

A good survey saves time, protects the site, and ensures important areas aren't missed.`
      },
      {
        title: "Digging Methods",
        content: `Archaeological excavation is precise, methodical work:

**Basic Principles:**
• Excavate by stratigraphic layers (not arbitrary depths)
• Remove most recent layers first
• Preserve context (3D position of all finds)
• Screen all excavated soil

**Tools and Techniques:**
• Trowels for careful scraping
• Brushes for delicate cleaning
• Buckets and wheelbarrows for soil removal
• Screens (1/4 inch mesh) for artifact recovery
• Dental tools for fine work

**Documentation:**
• Photographs at every stage
• Written notes and forms
• Scale drawings of profiles and plans
• Level measurements
• Artifact bags with context information

**Special Techniques:**
• Flotation (recovering tiny organic remains)
• Block lifting (removing fragile items with surrounding soil)
• Plaster jacketing (protecting fossils during removal)

**The Harris Matrix:**
A diagram showing the stratigraphic sequence - which layers formed when and their relationships. This is crucial for understanding the site's history.

Remember: Excavation destroys context, so documentation must be perfect. You can't go back!`
      },
      {
        title: "Documentation",
        content: `Proper documentation is the archaeologist's most important task:

**Why Documentation Matters:**
Once excavated, a site can never be restored. Documentation is the permanent record that allows future researchers to understand what was found and where.

**Recording System:**
• Context sheets for each stratigraphic unit
• Feature forms for structures and deposits
• Find sheets for artifacts
• Sample logs for environmental remains
• Photo logs with scales and north arrows

**Photography:**
• Overviews and details
• Before, during, and after excavation
• Include scales and information boards
• Multiple angles of features
• Close-ups of important finds

**Plans and Sections:**
• Top-down plans at regular intervals
• Section drawings showing stratigraphy
• Elevation drawings of features
• Scale drawings (usually 1:10 or 1:20)

**Digital Records:**
• GIS mapping
• 3D photogrammetry models
• Database entry
• Cloud backup of all data

**Laboratory Processing:**
• Washing and marking artifacts
• Cataloging in database
• Conservation when needed
• Storage in stable conditions

Good documentation enables:
• Future research and reinterpretation
• Publication and sharing findings
• Heritage management
• Public education

The goal is to create a comprehensive archive that tells the complete story of the site.`
      }
    ],
    quiz: [
      {
        question: "Why do archaeologists excavate by stratigraphic layers?",
        options: [
          "It's faster than other methods",
          "To preserve the chronological sequence of deposits",
          "It requires fewer tools",
          "To find artifacts more easily"
        ],
        correctAnswer: 1
      },
      {
        question: "What is a Harris Matrix?",
        options: [
          "A tool for measuring artifacts",
          "A diagram showing stratigraphic relationships",
          "A type of excavation grid",
          "A computer database system"
        ],
        correctAnswer: 1
      },
      {
        question: "Why is archaeological documentation so important?",
        options: [
          "To impress other archaeologists",
          "Because excavation destroys context permanently",
          "To publish papers quickly",
          "To sell artifacts later"
        ],
        correctAnswer: 1
      }
    ]
  },
  "ancient-civilizations": {
    sections: [
      {
        title: "Ancient Egypt",
        content: `Ancient Egypt thrived along the Nile River from ~3100 BCE to 30 BCE:

**Key Periods:**
• Old Kingdom (2686-2181 BCE) - Age of the Pyramids
• Middle Kingdom (2055-1650 BCE) - Classical period
• New Kingdom (1550-1077 BCE) - Imperial expansion
• Late Period (664-332 BCE) - Foreign rule

**Major Achievements:**
• Pyramids of Giza (last surviving ancient wonder)
• Hieroglyphic writing system
• Advanced mathematics and astronomy
• Sophisticated medical knowledge
• Elaborate religious practices and afterlife beliefs

**Archaeological Sites:**
• Valley of the Kings (royal tombs)
• Karnak and Luxor Temples
• Abu Simbel
• Alexandria (ancient library)

**Famous Discoveries:**
• Tutankhamun's tomb (Howard Carter, 1922)
• Rosetta Stone (key to deciphering hieroglyphs)
• Royal mummies
• Papyrus scrolls

Egyptian archaeology continues to reveal new discoveries, including recently found tombs and lost cities.`
      },
      {
        title: "Mesopotamia & Rome",
        content: `**MESOPOTAMIA (3500-539 BCE):**
"The Cradle of Civilization" between the Tigris and Euphrates rivers.

Major Civilizations:
• Sumerians - Invented writing (cuneiform), wheel, plow
• Akkadians - First empire under Sargon
• Babylonians - Hammurabi's Code of Law
• Assyrians - Powerful military empire
• Persians - Vast multicultural empire

Key Sites:
• Ur - City with ziggurat and royal tombs
• Babylon - Hanging Gardens (lost wonder)
• Nineveh - Assyrian capital with vast library

---

**ANCIENT ROME (753 BCE - 476 CE):**
From small city-state to empire spanning three continents.

Major Periods:
• Kingdom (753-509 BCE)
• Republic (509-27 BCE) - Expansion across Mediterranean
• Empire (27 BCE-476 CE) - Peak power and influence

Engineering Marvels:
• Aqueducts bringing fresh water
• Roads connecting the empire
• Colosseum and amphitheaters
• Concrete construction techniques
• Public baths and sanitation

Famous Sites:
• Pompeii and Herculaneum (preserved by Vesuvius eruption)
• Roman Forum
• Pantheon (still standing with original dome)
• Hadrian's Wall
• Catacombs

Roman archaeology provides insights into daily life, from graffiti in Pompeii to luxury villas.`
      },
      {
        title: "Maya Civilization",
        content: `The Maya civilization flourished in Mesoamerica from ~2000 BCE to Spanish conquest:

**Geographic Range:**
• Southern Mexico (Yucatan Peninsula)
• Guatemala
• Belize
• Honduras
• El Salvador

**Major Achievements:**
• Sophisticated calendar systems
• Complex hieroglyphic writing
• Advanced mathematics (concept of zero)
• Impressive architectural monuments
• Accurate astronomical observations

**Classic Period (250-900 CE):**
The height of Maya civilization with great cities:
• Tikal - Massive pyramids and temples
• Palenque - Ornate architecture and inscriptions
• Copán - Hieroglyphic stairway
• Calakmul - Major political power

**Post-Classic Period (900-1500 CE):**
• Chichen Itza - Pyramid of Kukulkan
• Mayapan - Last great Maya capital
• Uxmal - Governor's Palace

**Archaeological Insights:**
• Ball game courts (ritual sport)
• Elaborate burial practices for rulers
• Trade networks across Mesoamerica
• Complex political systems and warfare
• Agricultural techniques (raised fields, terracing)

**Mystery of the "Collapse":**
Around 900 CE, many southern cities were abandoned. Theories include:
• Drought and climate change
• Overpopulation and resource depletion
• Warfare and political upheaval
• Combination of factors

The Maya civilization didn't disappear - millions of Maya people still live in the region today, maintaining cultural traditions.

**Modern Discoveries:**
LiDAR technology has revealed thousands of previously unknown Maya structures hidden beneath jungle canopy, dramatically changing our understanding of Maya population and complexity.`
      }
    ],
    quiz: [
      {
        question: "What was the primary innovation of ancient Sumerians?",
        options: [
          "The pyramid",
          "Writing (cuneiform)",
          "Democracy",
          "Iron weapons"
        ],
        correctAnswer: 1
      },
      {
        question: "Which Roman city was preserved by a volcanic eruption?",
        options: [
          "Rome",
          "Athens",
          "Pompeii",
          "Carthage"
        ],
        correctAnswer: 2
      },
      {
        question: "What technology has recently revolutionized Maya archaeology?",
        options: [
          "Radiocarbon dating",
          "DNA analysis",
          "LiDAR scanning",
          "Satellite imagery"
        ],
        correctAnswer: 2
      }
    ]
  }
};

export default function ModuleViewer({ module, onClose, onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const content = moduleContent[module.id];
  const totalSections = content.sections.length;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    content.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setQuizScore(correct);
    setQuizSubmitted(true);

    // If passed (75% or higher), mark as complete
    if (correct >= content.quiz.length * 0.75) {
      onComplete();
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{module.title}</h2>
            {!showQuiz && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Section {currentSection + 1} of {totalSections}: {content.sections[currentSection].title}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            {showQuiz && !quizSubmitted && (
              <p className="text-slate-600">Complete the quiz to finish this module (75% required to pass)</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-4">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!showQuiz ? (
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      {content.sections[currentSection].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      {content.sections[currentSection].content.split('\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return <h3 key={idx} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{paragraph.slice(2, -2)}</h3>;
                        } else if (paragraph.startsWith('•')) {
                          return <li key={idx} className="ml-4 text-slate-700">{paragraph.slice(2)}</li>;
                        } else if (paragraph.trim()) {
                          return <p key={idx} className="text-slate-700 mb-3">{paragraph}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {!quizSubmitted ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <HelpCircle className="w-6 h-6 text-amber-600" />
                        Knowledge Check
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {content.quiz.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="font-medium text-slate-800 mb-4">
                            {qIndex + 1}. {question.question}
                          </p>
                          <RadioGroup
                            value={quizAnswers[qIndex]?.toString()}
                            onValueChange={(value) => setQuizAnswers({ ...quizAnswers, [qIndex]: parseInt(value) })}
                          >
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center space-x-2 mb-2">
                                <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`${quizScore >= content.quiz.length * 0.75 ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-orange-50'} border-0`}>
                    <CardHeader className="text-center">
                      <div className={`w-20 h-20 rounded-full ${quizScore >= content.quiz.length * 0.75 ? 'bg-green-500' : 'bg-orange-500'} flex items-center justify-center mx-auto mb-4`}>
                        {quizScore >= content.quiz.length * 0.75 ? (
                          <Award className="w-10 h-10 text-white" />
                        ) : (
                          <HelpCircle className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <CardTitle className="text-2xl">
                        {quizScore >= content.quiz.length * 0.75 ? 'Congratulations!' : 'Keep Learning!'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-lg text-slate-700">
                        You scored <span className="font-bold text-2xl">{quizScore}</span> out of <span className="font-bold text-2xl">{content.quiz.length}</span>
                      </p>
                      <p className="text-slate-600">
                        {quizScore >= content.quiz.length * 0.75 
                          ? "You've successfully completed this module! Your knowledge has been certified."
                          : "You need at least 75% to pass. Review the material and try again!"}
                      </p>
                      <div className="space-y-3">
                        {content.quiz.map((question, qIndex) => {
                          const isCorrect = quizAnswers[qIndex] === question.correctAnswer;
                          return (
                            <div key={qIndex} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                              <div className="flex items-start gap-2">
                                {isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : (
                                  <X className="w-5 h-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-slate-800">{question.question}</p>
                                  {!isCorrect && (
                                    <p className="text-sm text-slate-600 mt-1">
                                      Correct answer: {question.options[question.correctAnswer]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {quizScore < content.quiz.length * 0.75 && (
                        <Button
                          onClick={handleRetakeQuiz}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Review & Retake Quiz
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-xl flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0 || showQuiz}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {!showQuiz && (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
            >
              {currentSection === totalSections - 1 ? 'Take Quiz' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {showQuiz && !quizSubmitted && (
            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < content.quiz.length}
              className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"
            >
              Submit Quiz
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}

          {quizSubmitted && (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
            >
              {quizScore >= content.quiz.length * 0.75 ? 'Complete Module' : 'Close'}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}