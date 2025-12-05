import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Video, 
  FileText, 
  Award,
  Microscope,
  Globe,
  Compass,
  Brain,
  Download,
  ExternalLink,
  CheckCircle,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModuleViewer from "../components/education/ModuleViewer";
import LessonPlanViewer from "../components/education/LessonPlanViewer";
import ProjectGuideViewer from "../components/education/ProjectGuideViewer";
import VirtualTourViewer from "../components/education/VirtualTourViewer";

export default function EducationPage({ isDarkMode }) {
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState(null);
  const [selectedProjectGuide, setSelectedProjectGuide] = useState(null);
  const [selectedVirtualTour, setSelectedVirtualTour] = useState(null);

  const learningModules = [
    {
      id: "intro-archaeology",
      title: "Introduction to Archaeology",
      level: "Beginner",
      duration: "30 min",
      topics: ["What is Archaeology?", "Tools & Methods", "Career Paths"],
      description: "Learn the basics of archaeological science and how discoveries are made.",
      content: "This module covers the fundamental principles of archaeology, including its history, ethical considerations, and various sub-disciplines. You'll explore how archaeologists find and excavate sites, analyze artifacts, and interpret past cultures. Key topics include stratigraphy, seriation, and the importance of context. \n\nLearning Outcomes:\n- Define archaeology and its main goals.\n- Identify basic archaeological tools and methods.\n- Understand ethical guidelines in archaeological practice.\n- Explore different career paths in archaeology.",
      icon: Compass,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "fossil-identification",
      title: "Fossil Identification Guide",
      level: "Intermediate",
      duration: "45 min",
      topics: ["Types of Fossils", "Dating Methods", "Preservation"],
      description: "Master the art of identifying and dating different types of fossils.",
      content: "Dive deep into the world of paleontology with this comprehensive guide to fossil identification. Learn to distinguish between different types of fossils, from trace fossils to body fossils, and understand the processes of fossilization. The module also covers various absolute and relative dating techniques used to determine the age of fossils and the geological periods they represent. \n\nLearning Outcomes:\n- Classify major types of fossils.\n- Explain the processes of fossilization.\n- Apply basic principles of fossil dating.\n- Recognize common fossil specimens from different eras.",
      icon: Microscope,
      color: "from-green-500 to-emerald-600"
    },
    {
      id: "excavation-techniques",
      title: "Excavation Techniques",
      level: "Intermediate",
      duration: "1 hour",
      topics: ["Site Survey", "Digging Methods", "Documentation"],
      description: "Explore professional excavation methods used in the field.",
      content: "This module provides an overview of professional archaeological excavation techniques. It starts with site survey methods, including remote sensing and pedestrian surveys, to locate potential archaeological sites. It then delves into different digging strategies, such as grid systems and trenching, and emphasizes the critical importance of meticulous documentation. \n\nLearning Outcomes:\n- Describe various archaeological survey methods.\n- Understand different excavation strategies.\n- Master documentation techniques like mapping and record-keeping.\n- Learn about post-excavation analysis procedures.",
      icon: Globe,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "ancient-civilizations",
      title: "Ancient Civilizations",
      level: "Advanced",
      duration: "1.5 hours",
      topics: ["Egypt", "Mesopotamia", "Maya", "Rome"],
      description: "Deep dive into major ancient civilizations and their artifacts.",
      content: "Embark on a journey through some of the most influential ancient civilizations. This module explores the archaeological evidence that sheds light on the history, culture, and achievements of ancient Egypt, Mesopotamia, the Maya civilization, and the Roman Empire. Focus will be on key archaeological sites, significant discoveries, and their lasting impact. \n\nLearning Outcomes:\n- Identify major archaeological sites of ancient civilizations.\n- Analyze key artifacts and their cultural significance.\n- Compare and contrast societal structures of different ancient cultures.\n- Understand the contributions of these civilizations to human history.",
      icon: Brain,
      color: "from-amber-500 to-orange-600"
    }
  ];

  const teacherResources = [
    {
      title: "Lesson Plans - Elementary",
      description: "Age-appropriate archaeology activities for grades K-5",
      type: "PDF",
      size: "2.4 MB",
      icon: FileText,
      level: "elementary"
    },
    {
      title: "Lesson Plans - Middle School",
      description: "Engaging archaeology projects for grades 6-8",
      type: "PDF",
      size: "3.1 MB",
      icon: FileText,
      level: "middle-school"
    },
    {
      title: "Lesson Plans - High School",
      description: "Advanced archaeological science curriculum for grades 9-12",
      type: "PDF",
      size: "4.2 MB",
      icon: FileText,
      level: "high-school"
    },
    {
      title: "Virtual Field Trip Guide",
      description: "Interactive guide for exploring archaeological sites online",
      type: "Interactive",
      size: "Web",
      icon: Video
    },
    {
      title: "Assessment Tools",
      description: "Quizzes and evaluation materials for student learning",
      type: "PDF",
      size: "1.8 MB",
      icon: Award
    },
    {
      title: "Classroom Activities",
      description: "Hands-on archaeology activities you can do in the classroom",
      type: "PDF",
      size: "2.7 MB",
      icon: Users
    }
  ];

  const studentProjects = [
    {
      id: "excavation-site",
      title: "Create Your Own Excavation Site",
      difficulty: "Easy",
      duration: "2-3 hours",
      materials: ["Sand box", "Small objects", "Brushes", "Camera"],
      description: "Build a mock excavation site and practice archaeological techniques."
    },
    {
      id: "fossil-casting",
      title: "Fossil Casting Workshop",
      difficulty: "Medium",
      duration: "4-5 hours",
      materials: ["Clay", "Plaster", "Reference images", "Paint"],
      description: "Create realistic fossil casts and learn about preservation methods."
    },
    {
      id: "timeline",
      title: "Timeline of Human History",
      difficulty: "Medium",
      duration: "1 week",
      materials: ["Research materials", "Poster board", "Art supplies"],
      description: "Research and create a comprehensive visual timeline of major archaeological discoveries."
    },
    {
      id: "virtual-museum",
      title: "Virtual Museum Curation",
      difficulty: "Hard",
      duration: "2 weeks",
      materials: ["Digital tools", "Research resources", "Presentation software"],
      description: "Curate a virtual museum exhibition featuring archaeological artifacts."
    }
  ];

  const toggleLesson = (lessonId) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const handleStartModule = (module) => {
    setSelectedModule(module);
  };

  const handleCompleteModule = () => {
    if (selectedModule) {
      toggleLesson(selectedModule.id);
      setSelectedModule(null); // Close the viewer after completion
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      "Beginner": "bg-green-100 text-green-800 border-green-200",
      "Intermediate": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Advanced": "bg-red-100 text-red-800 border-red-200"
    };
    return colors[level] || colors.Beginner;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      "Easy": "bg-green-100 text-green-800 border-green-200",
      "Medium": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Hard": "bg-red-100 text-red-800 border-red-200"
    };
    return colors[difficulty] || colors.Easy;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} p-4 md:p-8`}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 ${isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-700'} rounded-xl flex items-center justify-center`}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                Education Center
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Learning resources for students, teachers, and archaeology enthusiasts
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80'} backdrop-blur-xl shadow-sm`}
            <TabsTrigger value="students" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              For Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              For Teachers
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  Interactive Learning Modules
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Self-paced lessons to learn about archaeology and paleontology
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {learningModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border-2 border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg`}>
                              <module.icon className="w-6 h-6 text-white" />
                            </div>
                            {completedLessons.has(module.id) && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg text-slate-800 mt-3">
                            {module.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-600">
                            {module.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getLevelColor(module.level)}>
                              {module.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ⏱️ {module.duration}
                            </Badge>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-700 mb-2">Topics covered:</p>
                            <div className="flex flex-wrap gap-2">
                              {module.topics.map((topic, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                            onClick={() => handleStartModule(module)}
                          >
                            {completedLessons.has(module.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Review Lesson
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Start Learning
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        Earn Certificates!
                      </h3>
                      <p className="text-slate-600 mb-3">
                        Complete all learning modules to earn a FossilFinder Education Certificate. 
                        Show your knowledge of archaeological science and add it to your portfolio!
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(completedLessons.size / learningModules.length) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                          {completedLessons.size} / {learningModules.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  Teaching Resources
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Downloadable materials and guides for educators
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherResources.map((resource, index) => (
                    <motion.div
                      key={resource.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border-2 border-slate-100 hover:border-purple-200 hover:shadow-xl transition-all duration-200 h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                              <resource.icon className="w-5 h-5 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-base text-slate-800">
                            {resource.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-600">
                            {resource.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{resource.size}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-purple-300 text-purple-700 hover:bg-purple-50"
                              onClick={() => resource.level && setSelectedLessonPlan(resource.level)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {resource.level ? "View" : "Download"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>


              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
              <CardHeader>
                <CardTitle className="text-2xl text-slate-800 flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-600" />
                  Student Projects & Activities
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Hands-on projects to practice archaeological skills
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {studentProjects.map((project, index) => (
                    <motion.div
                      key={project.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white border-2 border-slate-100 hover:border-amber-200 hover:shadow-xl transition-all duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ⏱️ {project.duration}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg text-slate-800">
                            {project.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-600">
                            {project.description}
                          </p>
                          
                          <div>
                            <p className="text-xs font-medium text-slate-700 mb-2">Materials needed:</p>
                            <div className="flex flex-wrap gap-2">
                              {project.materials.map((material, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <Button 
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"
                            onClick={() => setSelectedProjectGuide(project.id)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Project Guide
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-600" />
                      Virtual Field Trips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">
                      Explore famous archaeological sites from around the world through interactive virtual tours.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto flex-col items-start p-4 border-amber-200 hover:bg-amber-50"
                        onClick={() => setSelectedVirtualTour("egypt")}
                      >
                        <Globe className="w-6 h-6 text-amber-600 mb-2" />
                        <span className="font-semibold text-slate-800">Ancient Egypt</span>
                        <span className="text-xs text-slate-600">Pyramids of Giza</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto flex-col items-start p-4 border-amber-200 hover:bg-amber-50"
                        onClick={() => setSelectedVirtualTour("machu_picchu")}
                      >
                        <Globe className="w-6 h-6 text-amber-600 mb-2" />
                        <span className="font-semibold text-slate-800">Machu Picchu</span>
                        <span className="text-xs text-slate-600">Inca Civilization</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto flex-col items-start p-4 border-amber-200 hover:bg-amber-50"
                        onClick={() => setSelectedVirtualTour("pompeii")}
                      >
                        <Globe className="w-6 h-6 text-amber-600 mb-2" />
                        <span className="font-semibold text-slate-800">Pompeii</span>
                        <span className="text-xs text-slate-600">Ancient Rome</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Module Viewer Modal */}
      <AnimatePresence>
        {selectedModule && (
          <ModuleViewer
            module={selectedModule}
            onClose={() => setSelectedModule(null)}
            onComplete={handleCompleteModule}
          />
        )}
      </AnimatePresence>

      {/* Lesson Plan Viewer */}
      <AnimatePresence>
        {selectedLessonPlan && (
          <LessonPlanViewer
            level={selectedLessonPlan}
            onClose={() => setSelectedLessonPlan(null)}
          />
        )}
      </AnimatePresence>

      {/* Project Guide Viewer */}
      <AnimatePresence>
        {selectedProjectGuide && (
          <ProjectGuideViewer
            projectId={selectedProjectGuide}
            onClose={() => setSelectedProjectGuide(null)}
          />
        )}
      </AnimatePresence>

      {/* Virtual Tour Viewer */}
      <AnimatePresence>
        {selectedVirtualTour && (
          <VirtualTourViewer
            siteId={selectedVirtualTour}
            onClose={() => setSelectedVirtualTour(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}