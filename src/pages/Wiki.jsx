import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Eye,
  Clock,
  User,
  Tag,
  Filter } from
"lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WikiArticleViewer from "../components/wiki/WikiArticleViewer";
import WikiArticleEditor from "../components/wiki/WikiArticleEditor";

export default function WikiPage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  useEffect(() => {
    loadArticles();
    initializeWiki();
  }, []);

  useEffect(() => {
    let filtered = articles;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter((a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedCategory, searchTerm]);

  const initializeWiki = async () => {
    // Check if wiki has initial articles, if not create them
    const existing = await base44.entities.WikiArticle.list();
    if (existing.length === 0) {
      await createInitialArticles();
    }
  };

  const createInitialArticles = async () => {
    const initialArticles = [
    {
      title: "Getting Started with FossilFinder",
      slug: "getting-started",
      category: "getting-started",
      tags: ["tutorial", "basics", "upload"],
      content: `# Getting Started with FossilFinder

Welcome to FossilFinder! This guide will help you get started with analyzing your archaeological discoveries.

## How to Upload a Discovery

1. **Navigate to "Analyze Photo"** from the sidebar
2. **Take a photo** or upload an existing image of your fossil or artifact
3. **Add location information** (GPS coordinates or site name)
4. **Add notes** about where and how you found the item
5. **Click "Analyze Discovery"** to start the AI analysis

## What Happens Next?

Our AI will analyze your photo and provide:
- Classification of the item
- Confidence level (0-100%)
- Time period estimate
- Detailed description
- Significance assessment
- Expert recommendations

## Tips for Best Results

- Use good lighting when taking photos
- Include a scale reference (coin, ruler) if possible
- Capture multiple angles
- Clean the item gently before photographing
- Provide accurate location data
- Only upload real photographs (AI-generated images are blocked)

## Need Help?

Visit our other wiki articles or contact an administrator through the "Contact Admin" page.`
    },
    {
      title: "Understanding Analysis Results",
      slug: "understanding-analysis",
      category: "features",
      tags: ["analysis", "results", "confidence"],
      content: `# Understanding Your Analysis Results

## Confidence Score

The confidence score (0-100%) indicates how certain our AI is about the identification:

- **80-100%**: High confidence - likely accurate identification
- **60-79%**: Medium confidence - probable but may need expert review
- **Below 60%**: Low confidence - expert consultation recommended

## Significance Levels

### Low Significance
Common finds, well-documented specimens

### Medium Significance
Interesting specimens with research value

### High Significance
Rare or scientifically important discoveries

### Exceptional Significance
Extremely rare finds that may warrant immediate expert attention

## What to Do Next

Based on your results:

1. **High confidence + High significance**: Contact an expert immediately
2. **Medium confidence**: Compare with reference materials
3. **Low confidence**: Upload additional photos or seek expert review
4. **Any exceptional finds**: Report to local archaeological authorities

## Time Period Information

The AI provides estimates of:
- Geological eras (for fossils)
- Archaeological periods (for artifacts)
- Cultural contexts (when applicable)

Always verify important findings with qualified experts.`
    },
    {
      title: "Finding and Contacting Experts",
      slug: "contact-experts",
      category: "features",
      tags: ["experts", "consultation", "archaeologists"],
      content: `# Finding and Contacting Experts

## Browse the Expert Directory

Visit the **Experts** page from the sidebar to see our network of professional archaeologists and paleontologists.

## Expert Profiles Include

- Name and institution
- Areas of specialization
- Geographic expertise
- Contact information
- Current availability

## Specializations Available

- Paleontology (fossils)
- Prehistoric Archaeology
- Classical Archaeology
- Underwater Archaeology
- Forensic Archaeology
- Biblical Archaeology
- Industrial Archaeology
- Environmental Archaeology

## How to Request a Consultation

1. Find an expert matching your discovery type
2. Click "Request Consultation"
3. Provide details about your finding
4. Include your analysis results
5. Wait for the expert to respond

## Best Practices

- Be clear and concise in your request
- Include all relevant photos
- Provide accurate location data
- Mention any unique features
- Be patient - experts may take time to respond

## Emergency Discoveries

For potentially significant finds:
1. Stop excavation immediately
2. Document the find location
3. Contact local authorities
4. Reach out to multiple experts
5. Protect the site from disturbance`
    },
    {
      title: "Educational Resources",
      slug: "education",
      category: "features",
      tags: ["learning", "students", "teachers"],
      content: `# Educational Resources

## For Students

Visit our **Education Center** to access:

### Interactive Learning Modules
- Introduction to Archaeology
- Fossil Identification Guide
- Excavation Techniques
- Ancient Civilizations

Complete modules to earn certificates!

### Student Projects
- Create Your Own Excavation Site
- Fossil Casting Workshop
- Timeline of Human History
- Virtual Museum Curation

### Virtual Field Trips
Explore famous sites:
- Ancient Egypt (Pyramids of Giza)
- Machu Picchu (Inca Civilization)
- Pompeii (Ancient Rome)

## For Teachers

Download resources including:
- Lesson plans (K-5, 6-8, 9-12)
- Assessment tools
- Classroom activities
- Virtual field trip guides

### Professional Development
Register for webinars on:
- Integrating technology in archaeology education
- Hands-on archaeology activities

## Learning Path

1. Start with beginner modules
2. Complete knowledge checks (75% required)
3. Progress to advanced topics
4. Earn completion certificates
5. Apply knowledge to real discoveries`
    },
    {
      title: "Safety and Legal Guidelines",
      slug: "safety-legal",
      category: "getting-started",
      tags: ["safety", "legal", "permits", "ethics"],
      content: `# Safety and Legal Guidelines

## Before You Start

### Check Local Laws
- Many areas require permits for fossil/artifact collection
- Some sites are protected by law
- National parks and monuments have strict rules
- Private property requires owner permission

### Respect Cultural Heritage
- Indigenous sites may be sacred
- Report significant finds to authorities
- Never sell or trade protected items
- Respect local cultural sensitivities

## Field Safety

### Personal Safety
- Never excavate alone
- Inform someone of your location
- Carry first aid supplies
- Watch for wildlife and hazards
- Stay hydrated

### Site Safety
- Check for unstable ground
- Avoid cliff edges
- Watch for falling rocks
- Don't enter caves or mines without training
- Be aware of weather conditions

## Ethical Collecting

### Do:
- Document find locations precisely
- Take photos before removing items
- Record environmental context
- Share important finds with researchers
- Follow all applicable laws

### Don't:
- Excavate protected sites
- Remove items from national parks
- Destroy archaeological context
- Sell protected artifacts
- Withhold important discoveries

## Reporting Discoveries

### Report to Authorities if You Find:
- Human remains
- Significant artifacts
- Sites with multiple artifacts
- Unusual or rare specimens
- Items on protected land

### Contact:
- Local archaeological society
- State archaeologist
- Natural history museum
- University archaeology department

## AI Detection Note

FossilFinder automatically blocks AI-generated images to maintain scientific integrity. Only upload authentic photographs.`
    },
    {
      title: "Frequently Asked Questions",
      slug: "faq",
      category: "faq",
      tags: ["faq", "help", "common questions"],
      content: `# Frequently Asked Questions

## General Questions

### What is FossilFinder?
FossilFinder is an AI-powered platform for analyzing archaeological discoveries, connecting with experts, and learning about archaeology.

### Is FossilFinder free to use?
Yes! The core features are free for all users.

### Who can use FossilFinder?
Anyone interested in archaeology - students, teachers, amateur archaeologists, and professionals.

## Analysis Questions

### How accurate is the AI?
Our AI provides estimates with confidence scores. Always verify important findings with experts.

### What file formats are supported?
JPEG and PNG only. WebP is not supported.

### Why was my image rejected?
We automatically detect and block AI-generated images to maintain scientific integrity.

### How long does analysis take?
Typically 30-60 seconds.

### Can I analyze the same item multiple times?
Yes! Try different angles or lighting conditions.

## Account Questions

### Do I need an account?
Yes, you need to register to upload discoveries.

### Can I make my discoveries private?
Discoveries are visible to you and administrators only.

### How do I contact support?
Use the "Contact Admin" link in the sidebar.

## Expert Questions

### How do I become a listed expert?
Contact an administrator to request addition to the expert directory.

### Are expert consultations free?
Consultation arrangements are between you and the expert.

### How long do experts take to respond?
Response times vary. Most experts respond within a few days.

## Technical Questions

### What browsers are supported?
Modern browsers (Chrome, Firefox, Safari, Edge).

### Can I use FossilFinder on mobile?
Yes! The app is fully responsive.

### Is my data secure?
Yes, we follow industry-standard security practices.

### Can I delete my discoveries?
Contact an administrator for data deletion requests.

## Educational Questions

### Can I use FossilFinder for my class?
Absolutely! Check out our Education Center for teaching resources.

### Do the learning modules cost anything?
No, all educational content is free.

### Can I download the lesson plans?
Teachers can download PDF resources from the Education Center.

### Do I get a real certificate?
You get a digital certificate showing module completion.`
    },
    {
      title: "How to Edit Wiki Articles",
      slug: "editing-wiki",
      category: "technical",
      tags: ["wiki", "editing", "markdown"],
      content: `# How to Edit Wiki Articles

## Anyone Can Edit!

FossilFinder Wiki is community-driven. All users can create and edit articles.

## Creating a New Article

1. Click the **"New Article"** button
2. Enter a title
3. Choose a category
4. Add relevant tags
5. Write your content using Markdown
6. Click **"Publish"**

## Editing Existing Articles

1. Open any article
2. Click the **"Edit"** button
3. Make your changes
4. Click **"Save Changes"**

## Markdown Basics

### Headers
\`\`\`
# Large Header
## Medium Header
### Small Header
\`\`\`

### Text Formatting
- **Bold**: \`**text**\`
- *Italic*: \`*text*\`
- Lists: Start with \`-\` or \`1.\`

### Links
\`[Link Text](url)\`

### Code
\`\`\`
Use backticks for code
\`\`\`

## Best Practices

### Write Clear Titles
Use descriptive, searchable titles

### Organize Content
Use headers to break up sections

### Add Tags
Help others find your article

### Be Accurate
Verify information before publishing

### Be Respectful
Maintain a professional, educational tone

### Cite Sources
Reference your information when applicable

## Categories

Choose the appropriate category:
- **Getting Started**: Basic guides and tutorials
- **Features**: How to use specific features
- **Archaeology**: Scientific and educational content
- **Technical**: Platform and technical information
- **FAQ**: Common questions and answers

## Version History

Each edit increments the version number and records:
- Who made the edit
- When it was made
- What version it is

## Need Help?

If you're unsure about editing, contact an administrator or check this guide again!`
    }];


    for (const article of initialArticles) {
      try {
        await base44.entities.WikiArticle.create(article);
      } catch (error) {
        console.error(`Failed to create article ${article.title}:`, error);
      }
    }
  };

  const loadArticles = async () => {
    try {
      const data = await base44.entities.WikiArticle.list("-updated_date");
      setArticles(data);
    } catch (error) {
      console.error("Failed to load wiki articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewArticle = async (article) => {
    setSelectedArticle(article);
    // Increment view count
    try {
      await base44.entities.WikiArticle.update(article.id, {
        views: (article.views || 0) + 1
      });
      loadArticles();
    } catch (error) {
      console.error("Failed to update view count:", error);
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setIsEditing(true);
  };

  const handleSaveArticle = async () => {
    setIsEditing(false);
    setEditingArticle(null);
    await loadArticles();
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setEditingArticle(null);
  };

  const handleCloseViewer = () => {
    setSelectedArticle(null);
  };

  const categories = [
  { value: "all", label: "All Categories", count: articles.length },
  { value: "getting-started", label: "Getting Started", count: articles.filter((a) => a.category === "getting-started").length },
  { value: "features", label: "Features", count: articles.filter((a) => a.category === "features").length },
  { value: "archaeology", label: "Archaeology", count: articles.filter((a) => a.category === "archaeology").length },
  { value: "technical", label: "Technical", count: articles.filter((a) => a.category === "technical").length },
  { value: "faq", label: "FAQ", count: articles.filter((a) => a.category === "faq").length }];


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8">

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">
                  FossilFinder Wiki
                </h1>
                <p className="text-lg text-slate-600">Community knowledge base, only admins can create and update articles. 

                </p>
              </div>
            </div>
            <Button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800">

              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search articles, tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10" />

              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) =>
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={selectedCategory === cat.value ? "bg-indigo-600" : ""}>

                    {cat.label}
                    <Badge variant="secondary" className="ml-2">{cat.count}</Badge>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ?
          Array(6).fill(0).map((_, i) =>
          <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ) :
          filteredArticles.length === 0 ?
          <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">
                No articles found
              </h3>
              <p className="text-slate-500 mb-4">
                {searchTerm ? "Try adjusting your search terms." : "Be the first to create an article!"}
              </p>
              <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </div> :

          filteredArticles.map((article, index) =>
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>

                <Card className="bg-white border-2 border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-200 h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                        {article.category?.replace(/-/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Eye className="w-3 h-3" />
                        {article.views || 0}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-800">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-3 flex-1">
                      {article.content.substring(0, 150)}...
                    </p>
                    
                    {article.tags && article.tags.length > 0 &&
                <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag, idx) =>
                  <Badge key={idx} variant="secondary" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                  )}
                      </div>
                }

                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <Clock className="w-3 h-3" />
                      <span>v{article.version || 1}</span>
                      {article.last_edited_by &&
                  <>
                          <User className="w-3 h-3 ml-2" />
                          <span className="truncate">{article.last_edited_by.split('@')[0]}</span>
                        </>
                  }
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                    onClick={() => handleViewArticle(article)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    size="sm">

                        <Eye className="w-4 h-4 mr-2" />
                        Read
                      </Button>
                      <Button
                    onClick={() => handleEditArticle(article)}
                    variant="outline"
                    size="sm"
                    className="border-indigo-200 hover:bg-indigo-50">

                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
          )
          }
        </div>
      </div>

      {/* Article Viewer Modal */}
      <AnimatePresence>
        {selectedArticle &&
        <WikiArticleViewer
          article={selectedArticle}
          onClose={handleCloseViewer}
          onEdit={() => {
            handleCloseViewer();
            handleEditArticle(selectedArticle);
          }} />

        }
      </AnimatePresence>

      {/* Article Editor Modal */}
      <AnimatePresence>
        {isEditing &&
        <WikiArticleEditor
          article={editingArticle}
          onSave={handleSaveArticle}
          onClose={handleCloseEditor} />

        }
      </AnimatePresence>
    </div>);

}