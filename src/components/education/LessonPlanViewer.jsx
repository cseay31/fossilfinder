import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Download, FileText, Clock, Users, Target } from 'lucide-react';

const lessonPlans = {
  "elementary": {
    title: "Archaeology for Young Explorers",
    grade: "K-5",
    duration: "45 minutes per lesson",
    lessons: [
      {
        week: 1,
        title: "What is Archaeology?",
        objectives: ["Understand what archaeologists do", "Learn about artifacts and how they teach us about the past"],
        materials: ["Pictures of artifacts", "Story books", "Drawing materials"],
        activities: [
          "Introduction: Show pictures of famous archaeological sites",
          "Story time: Read an age-appropriate book about archaeology",
          "Activity: Draw and share 'artifacts' from your own life",
          "Discussion: What do your artifacts tell about you?"
        ]
      },
      {
        week: 2,
        title: "Dig Like an Archaeologist",
        objectives: ["Practice excavation techniques", "Learn about careful observation"],
        materials: ["Sandbox", "Small toys/objects", "Brushes", "Notebooks"],
        activities: [
          "Preparation: Bury objects in sandbox before class",
          "Demonstration: Show careful excavation techniques",
          "Hands-on: Students excavate and document their finds",
          "Presentation: Share discoveries with the class"
        ]
      },
      {
        week: 3,
        title: "Ancient Civilizations",
        objectives: ["Learn about different ancient cultures", "Compare ancient and modern life"],
        materials: ["World map", "Pictures", "Art supplies", "Timeline materials"],
        activities: [
          "Map exploration: Locate ancient civilizations",
          "Compare & contrast: Ancient vs. modern homes, food, clothing",
          "Art project: Create ancient Egyptian or Greek art",
          "Timeline activity: Place civilizations on a visual timeline"
        ]
      }
    ]
  },
  "middle-school": {
    title: "Archaeology & Scientific Method",
    grade: "6-8",
    duration: "60 minutes per lesson",
    lessons: [
      {
        week: 1,
        title: "Archaeological Methods",
        objectives: ["Apply scientific method to archaeology", "Understand dating techniques"],
        materials: ["Sample artifacts (replicas)", "Measurement tools", "Documentation forms"],
        activities: [
          "Lecture: Overview of archaeological science",
          "Lab: Examine and measure artifact replicas",
          "Documentation: Complete archaeological record sheets",
          "Analysis: Determine possible uses and time periods"
        ]
      },
      {
        week: 2,
        title: "Site Survey & Excavation",
        objectives: ["Learn survey techniques", "Practice grid system excavation"],
        materials: ["Grid materials", "Excavation tools", "Notebooks", "Cameras"],
        activities: [
          "Field prep: Set up mock excavation site with grid system",
          "Survey: Map the site and identify areas of interest",
          "Excavation: Systematic digging using proper techniques",
          "Recording: Document location and context of all finds"
        ]
      },
      {
        week: 3,
        title: "Artifact Analysis",
        objectives: ["Analyze artifacts scientifically", "Draw conclusions from evidence"],
        materials: ["Artifacts from excavation", "Analysis tools", "Research materials"],
        activities: [
          "Classification: Sort artifacts by type and material",
          "Research: Use reference materials to identify items",
          "Interpretation: What do artifacts tell about past culture?",
          "Presentation: Create exhibit of findings with explanations"
        ]
      }
    ]
  },
  "high-school": {
    title: "Advanced Archaeological Science",
    grade: "9-12",
    duration: "90 minutes per lesson",
    lessons: [
      {
        week: 1,
        title: "Archaeological Theory & Ethics",
        objectives: ["Understand theoretical frameworks", "Discuss ethical considerations"],
        materials: ["Academic readings", "Case studies", "Discussion prompts"],
        activities: [
          "Reading: Review major archaeological theories",
          "Case study: Analyze ethical dilemmas in archaeology",
          "Debate: Cultural heritage vs. scientific study",
          "Essay: Personal stance on archaeological ethics"
        ]
      },
      {
        week: 2,
        title: "Advanced Dating Methods",
        objectives: ["Master relative and absolute dating", "Apply dating techniques to samples"],
        materials: ["Sample materials", "Lab equipment", "Dating technique charts"],
        activities: [
          "Lecture: Radiocarbon, dendrochronology, thermoluminescence",
          "Lab: Hands-on practice with stratigraphy",
          "Calculation: Determine dates using half-life formulas",
          "Report: Write scientific dating analysis"
        ]
      },
      {
        week: 3,
        title: "Research Project",
        objectives: ["Conduct independent archaeological research", "Present findings professionally"],
        materials: ["Research databases", "Presentation tools", "Academic resources"],
        activities: [
          "Topic selection: Choose an archaeological site or question",
          "Research: Use academic sources and databases",
          "Analysis: Synthesize findings and draw conclusions",
          "Presentation: Formal academic presentation to class"
        ]
      }
    ]
  }
};

export default function LessonPlanViewer({ level, onClose }) {
  const plan = lessonPlans[level];
  
  if (!plan) return null;

  const handlePrint = () => {
    window.print();
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
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              {plan.title}
            </h2>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-purple-100 text-purple-800">Grades {plan.grade}</Badge>
              <Badge variant="outline">{plan.duration}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              Print/Save
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">About This Unit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-800">
                This comprehensive archaeology unit for grades {plan.grade} introduces students to archaeological 
                science through hands-on activities and engaging lessons. Each lesson builds on previous knowledge 
                and can be adapted to your classroom needs.
              </p>
            </CardContent>
          </Card>

          {plan.lessons.map((lesson, index) => (
            <Card key={index} className="border-2 border-slate-200">
              <CardHeader className="bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-800">
                    Week {lesson.week}: {lesson.title}
                  </CardTitle>
                  <Badge className="bg-slate-200 text-slate-700">
                    Lesson {index + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Learning Objectives</h4>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-slate-800">Materials Needed</h4>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-7">
                    {lesson.materials.map((material, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-slate-800">Activity Sequence</h4>
                  </div>
                  <ol className="space-y-3 ml-7">
                    {lesson.activities.map((activity, i) => (
                      <li key={i} className="text-slate-600 flex gap-3">
                        <span className="font-semibold text-amber-600 shrink-0">{i + 1}.</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Teaching Tips
                  </h5>
                  <p className="text-sm text-blue-800">
                    Adapt activities to your students' needs. Encourage questions and hands-on participation. 
                    Consider inviting a local archaeologist or using FossilFinder's AI analysis tool for demonstrations.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-900">Assessment Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-purple-800">
              <p>• Student presentations on excavation findings</p>
              <p>• Written reflections on archaeological ethics</p>
              <p>• Quiz on key terminology and concepts</p>
              <p>• Portfolio of documentation and artifacts</p>
              <p>• Peer evaluation of research presentations</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}