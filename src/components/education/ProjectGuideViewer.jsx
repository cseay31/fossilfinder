import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Download, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

const projectGuides = {
  "excavation-site": {
    title: "Create Your Own Excavation Site",
    difficulty: "Easy",
    duration: "2-3 hours",
    overview: "Learn archaeological excavation techniques by creating and excavating your own mock site.",
    materials: [
      "Large sandbox or plastic bin (at least 2ft x 2ft)",
      "Sand or soil",
      "Small objects to bury (toys, coins, bones, pottery pieces)",
      "Excavation tools (small brushes, plastic spoons, popsicle sticks)",
      "String and stakes for grid system",
      "Notebook and pencil for documentation",
      "Camera or smartphone",
      "Graph paper",
      "Measuring tape or ruler"
    ],
    steps: [
      {
        title: "Site Preparation",
        description: "Fill your container with sand/soil. Gather small objects to serve as 'artifacts'. These could be old toys, buttons, shells, or fake bones.",
        tips: ["Mix objects from different time periods for added challenge", "Include both large and small items"]
      },
      {
        title: "Create Layers (Stratigraphy)",
        description: "Add a 3-inch layer of soil, place some artifacts, add another 3-inch layer, place more artifacts. Repeat 2-3 times to create distinct layers representing different time periods.",
        tips: ["Deeper layers = older artifacts", "Try to remember what you buried where (or have a partner do it)"]
      },
      {
        title: "Set Up Grid System",
        description: "Divide your excavation site into a grid using string and stakes. Label sections (A1, A2, B1, B2, etc.).",
        tips: ["Make 6-inch squares for easier tracking", "Draw your grid system on graph paper"]
      },
      {
        title: "Begin Excavation",
        description: "Working one grid square at a time, carefully remove soil using brushes and small tools. Go slowly and check frequently for artifacts.",
        tips: ["Remove only 1-2 inches at a time", "Use brushes to expose artifacts gently", "Don't remove artifacts immediately"]
      },
      {
        title: "Document Everything",
        description: "When you find an artifact: 1) Leave it in place, 2) Take a photo, 3) Measure depth and location, 4) Record grid square, 5) Sketch it in your notebook.",
        tips: ["Include a ruler in photos for scale", "Note the layer/depth of each find", "Describe soil color and texture"]
      },
      {
        title: "Remove and Label",
        description: "After documenting, carefully remove the artifact and place it in a labeled bag with grid location and depth.",
        tips: ["Use small bags or containers", "Keep artifacts from different levels separate"]
      },
      {
        title: "Analysis",
        description: "Once excavation is complete, lay out all artifacts. Group them by type, material, or time period. What patterns do you see?",
        tips: ["Create a catalog with descriptions", "Draw conclusions about site use"]
      },
      {
        title: "Present Findings",
        description: "Create a display or presentation showing your excavation process, artifacts found, and conclusions about the 'site.'",
        tips: ["Include photos, maps, and drawings", "Explain stratigraphy and dating"]
      }
    ],
    learningGoals: [
      "Understand the importance of context in archaeology",
      "Practice systematic excavation techniques",
      "Learn to document findings properly",
      "Recognize stratigraphy and layer dating",
      "Develop patience and attention to detail"
    ],
    extensions: [
      "Create a more complex site with features (walls, fire pits)",
      "Exchange sites with classmates and excavate theirs",
      "Research real archaeological sites and compare methods",
      "Write a scientific report on your findings"
    ]
  },
  "fossil-casting": {
    title: "Fossil Casting Workshop",
    difficulty: "Medium",
    duration: "4-5 hours (including drying time)",
    overview: "Create realistic fossil casts using molds and learn about fossilization and preservation.",
    materials: [
      "Air-dry clay or modeling clay",
      "Plaster of Paris",
      "Water and mixing container",
      "Reference images of fossils",
      "Petroleum jelly or cooking oil",
      "Sculpting tools",
      "Paint and brushes",
      "Clear sealant (optional)"
    ],
    steps: [
      {
        title: "Research Your Fossil",
        description: "Choose a fossil type to recreate (trilobite, ammonite, fern leaf, dinosaur tooth, etc.). Study reference images to understand details.",
        tips: ["Start with simpler fossils like shells or leaves", "Print reference images to work from"]
      },
      {
        title: "Create the Original",
        description: "Use clay to sculpt your fossil. Add texture and details based on your research. Make it at least 1 inch thick.",
        tips: ["Press real leaves into clay for realistic texture", "Use tools to add fine details", "Make deeper impressions than you think"]
      },
      {
        title: "Prepare for Molding",
        description: "Let your clay fossil dry slightly (30 mins). Coat entire surface with petroleum jelly as a release agent.",
        tips: ["Don't skip the release agent", "Apply thin, even coat"]
      },
      {
        title: "Create the Mold",
        description: "Build a clay wall around your fossil (2 inches high). Mix plaster according to package directions. Pour over fossil until covered by 1 inch.",
        tips: ["Tap container to release air bubbles", "Work quickly as plaster sets fast"]
      },
      {
        title: "Wait and Separate",
        description: "Let plaster dry completely (1-2 hours). Carefully separate plaster mold from clay fossil. Clean both pieces.",
        tips: ["Don't rush drying time", "Gently wiggle pieces apart"]
      },
      {
        title: "Make the Cast",
        description: "Coat inside of plaster mold with release agent. Mix fresh plaster and pour into mold. Let dry completely (2+ hours).",
        tips: ["You can make multiple casts from one mold", "Tap mold to remove bubbles"]
      },
      {
        title: "Remove and Finish",
        description: "Carefully remove cast from mold. Sand any rough edges. Paint to look like real stone/fossil.",
        tips: ["Use earth tones (browns, grays, tans)", "Add weathering effects with dark wash", "Highlight raised areas with lighter paint"]
      },
      {
        title: "Seal and Display",
        description: "Apply clear sealant if desired. Create a label with fossil name, time period, and location where real version was found.",
        tips: ["Display on sand or in a shadow box", "Research the real fossil's history"]
      }
    ],
    learningGoals: [
      "Understand the fossilization process",
      "Learn about different types of fossils",
      "Develop observation and replication skills",
      "Practice mold-making techniques",
      "Appreciate fossil preservation"
    ],
    extensions: [
      "Create a fossil collection with multiple specimens",
      "Make casts of modern objects to compare",
      "Research and recreate famous fossil discoveries",
      "Create an educational display about fossilization"
    ]
  },
  "timeline": {
    title: "Timeline of Human History",
    difficulty: "Medium",
    duration: "1 week",
    overview: "Create a comprehensive visual timeline of major archaeological periods and discoveries.",
    materials: [
      "Large poster board or roll of paper (6+ feet)",
      "Colored markers and pens",
      "Printed images of artifacts and sites",
      "Ruler and pencil",
      "Glue stick",
      "Reference materials (books, internet)",
      "Index cards for notes"
    ],
    steps: [
      {
        title: "Research Archaeological Periods",
        description: "Study major periods: Paleolithic, Mesolithic, Neolithic, Bronze Age, Iron Age, Classical Period, Medieval Period, etc.",
        tips: ["Focus on 8-10 major periods", "Note date ranges for each"]
      },
      {
        title: "Establish Timeline Scale",
        description: "Decide how to represent time. For deep history, use logarithmic scale or split into sections (one for prehistory, one for historic periods).",
        tips: ["Label clearly: BCE/CE or BC/AD", "Use different colors for each era"]
      },
      {
        title: "Draw Timeline Base",
        description: "Draw a horizontal line across your poster. Mark major time divisions. Add vertical lines for important dates.",
        tips: ["Leave room above and below for images/text", "Use pencil first, then marker"]
      },
      {
        title: "Add Major Developments",
        description: "For each period, add key innovations: fire, tools, agriculture, writing, metallurgy, etc.",
        tips: ["Use symbols or small drawings", "Connect innovations with arrows"]
      },
      {
        title: "Include Archaeological Sites",
        description: "Add famous sites with discovery dates: Olduvai Gorge, Lascaux Caves, Stonehenge, Pompeii, Machu Picchu, etc.",
        tips: ["Include location and significance", "Add small maps or site plans"]
      },
      {
        title: "Feature Important Artifacts",
        description: "Include images of significant artifacts: Venus figurines, Rosetta Stone, Terracotta Warriors, Dead Sea Scrolls, etc.",
        tips: ["Print small images", "Write brief descriptions"]
      },
      {
        title: "Add Human Evolution",
        description: "Include major hominin species and their approximate dates: Homo habilis, H. erectus, Neanderthals, H. sapiens.",
        tips: ["Show overlapping periods", "Include where fossils were found"]
      },
      {
        title: "Final Touches",
        description: "Add title, legend, and your name. Include interesting facts or quotes. Make it colorful and engaging.",
        tips: ["Use different sections for different continents", "Add 'Today' marker at the end"]
      }
    ],
    learningGoals: [
      "Understand the scope of human history",
      "Recognize major archaeological periods",
      "See connections between discoveries",
      "Develop research and organization skills",
      "Create effective visual presentations"
    ],
    extensions: [
      "Create separate timelines for different regions",
      "Add climate changes and migrations",
      "Include extinction events",
      "Make it 3D with pop-up elements"
    ]
  },
  "virtual-museum": {
    title: "Virtual Museum Curation",
    difficulty: "Hard",
    duration: "2 weeks",
    overview: "Curate a virtual museum exhibition featuring archaeological artifacts and tell their stories.",
    materials: [
      "Computer with internet access",
      "Presentation software (PowerPoint, Google Slides, etc.)",
      "Research databases and websites",
      "Image editing software (optional)",
      "Note-taking materials"
    ],
    steps: [
      {
        title: "Choose Your Theme",
        description: "Select an exhibition theme: specific civilization, time period, artifact type, or archaeological method.",
        tips: ["Be specific enough to research deeply", "Choose something you're interested in"]
      },
      {
        title: "Research Artifacts",
        description: "Find 10-15 artifacts that fit your theme. Use museum websites, academic sources, and archaeological databases.",
        tips: ["Focus on well-documented pieces", "Look for high-quality images", "Record sources"]
      },
      {
        title: "Create Artifact Catalog",
        description: "For each artifact document: name, culture/period, materials, dimensions, where found, when found, current location, significance.",
        tips: ["Use consistent format", "Include catalog numbers if available"]
      },
      {
        title: "Write Exhibition Text",
        description: "Create wall text for each artifact (150-200 words) explaining what it is, its context, and why it matters.",
        tips: ["Write clearly for general audience", "Tell stories, not just facts"]
      },
      {
        title: "Design Exhibition Layout",
        description: "Plan how artifacts will be presented. Group related items. Create a flow through the exhibition.",
        tips: ["Start with introduction panel", "End with conclusion/takeaways"]
      },
      {
        title: "Create Introduction Panel",
        description: "Write an opening statement (300-400 words) introducing your theme, its importance, and what visitors will learn.",
        tips: ["Hook readers with interesting question", "Preview exhibition highlights"]
      },
      {
        title: "Add Interactive Elements",
        description: "Include maps, timelines, videos, 3D models, or interactive quizzes to engage visitors.",
        tips: ["Link to relevant websites", "Add zoom features for artifact details"]
      },
      {
        title: "Design and Present",
        description: "Create your virtual exhibition using slides, a website, or video. Practice presenting it to others.",
        tips: ["Use consistent visual design", "Test all links", "Include credits and bibliography"]
      }
    ],
    learningGoals: [
      "Develop curatorial skills",
      "Master archaeological research methods",
      "Practice science communication",
      "Understand museum interpretation",
      "Create professional presentations"
    ],
    extensions: [
      "Partner with others for collaborative exhibition",
      "Create physical exhibition at school",
      "Interview real museum curators",
      "Develop educational programs for your exhibition"
    ]
  }
};

export default function ProjectGuideViewer({ projectId, onClose }) {
  const guide = projectGuides[projectId];
  
  if (!guide) return null;

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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {guide.title}
            </h2>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-amber-100 text-amber-800">{guide.difficulty}</Badge>
              <Badge variant="outline">{guide.duration}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-lg text-amber-900">Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800">{guide.overview}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg text-blue-900">Materials Needed</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {guide.materials.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Step-by-Step Instructions</h3>
            <div className="space-y-4">
              {guide.steps.map((step, index) => (
                <Card key={index} className="border-2 border-slate-200">
                  <CardHeader className="bg-slate-50">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <p className="text-slate-700">{step.description}</p>
                    {step.tips && step.tips.length > 0 && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-yellow-900 mb-1">Tips:</p>
                            <ul className="space-y-1">
                              {step.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-yellow-800">• {tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Learning Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {guide.learningGoals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">Extension Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800 mb-3">Take your project further with these ideas:</p>
              <ul className="space-y-2">
                {guide.extensions.map((ext, i) => (
                  <li key={i} className="flex items-start gap-2 text-purple-700">
                    <span className="text-purple-600 font-bold">→</span>
                    <span>{ext}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Safety Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-800 space-y-2">
              <p>• Always have adult supervision when using tools or materials</p>
              <p>• Work in a well-ventilated area</p>
              <p>• Wear appropriate safety gear (gloves, goggles if needed)</p>
              <p>• Clean up workspace when finished</p>
              <p>• Follow all material instructions carefully</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}