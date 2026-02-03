import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Search,
  Plus,
  Eye,
  Clock,
  User,
  ThumbsUp,
  MessageCircle,
  Pin,
  Lock,
  TrendingUp,
  Filter,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ForumPostEditor from "../components/forum/ForumPostEditor";

export default function ForumPage({ isDarkMode }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isCreating, setIsCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [appSettings, setAppSettings] = useState(null);

  useEffect(() => {
    loadPosts();
    loadCurrentUser();
    initializeForum();
    checkSettings();
  }, []);

  const checkSettings = async () => {
    try {
      const settings = await base44.entities.AppSettings.list();
      if (settings.length > 0) {
        setAppSettings(settings[0]);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  useEffect(() => {
    let filtered = [...posts];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort posts
    filtered.sort((a, b) => {
      // Pinned posts always first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;

      switch (sortBy) {
        case "popular":
          return (b.likes || 0) - (a.likes || 0);
        case "discussed":
          return (b.reply_count || 0) - (a.reply_count || 0);
        case "views":
          return (b.views || 0) - (a.views || 0);
        default: // recent
          return new Date(b.created_date) - new Date(a.created_date);
      }
    });

    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchTerm, sortBy]);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const initializeForum = async () => {
    const existing = await base44.entities.ForumPost.list();
    if (existing.length === 0) {
      await createInitialPosts();
    }
  };

  const createInitialPosts = async () => {
    const initialPosts = [
      {
        title: "Welcome to FossilFinder Community Forum!",
        content: `# Welcome to the FossilFinder Community!

We're thrilled to have you join our community of fossil enthusiasts, amateur archaeologists, and professionals!

## What This Forum Is For

This is a place to:
- **Share your discoveries** and get feedback from the community
- **Ask for help** identifying fossils and artifacts
- **Discuss techniques** for finding and preserving specimens
- **Learn from others** with different experience levels
- **Connect with fellow enthusiasts** who share your passion

## Community Guidelines

1. **Be Respectful** - Treat everyone with kindness and respect
2. **Stay On Topic** - Keep discussions relevant to archaeology and paleontology
3. **No Spam** - Don't post promotional content or repetitive messages
4. **Share Knowledge** - Help others learn from your experiences
5. **Report Issues** - Flag inappropriate content for moderators

## Getting Started

- Browse the categories to find topics that interest you
- Use the search to find specific discussions
- Don't be shy - introduce yourself and ask questions!

Happy fossil hunting! 🦴`,
        category: "announcements",
        tags: ["welcome", "guidelines", "community"],
        is_pinned: true,
        author_name: "FossilFinder Team"
      },
      {
        title: "How to Get the Best AI Analysis Results",
        content: `# Tips for Better AI Analysis

After helping hundreds of users, here are the best practices for getting accurate AI analysis:

## Photography Tips

### Lighting
- Use natural daylight when possible
- Avoid harsh shadows
- Multiple light sources help show texture

### Angles
- Take photos from multiple angles
- Include close-ups of interesting features
- Capture the overall shape AND details

### Scale Reference
- Include a coin, ruler, or common object for scale
- This helps the AI estimate size
- Essential for accurate identification

## Information to Include

The more context you provide, the better:
- **Location** - Where exactly did you find it?
- **Geological context** - What type of rock/soil?
- **Associated finds** - What else was nearby?

## Common Mistakes to Avoid

❌ Blurry photos
❌ Poor lighting
❌ No scale reference
❌ Single angle only
❌ Vague location info

## Share Your Tips!

What techniques have worked well for you? Reply below! 👇`,
        category: "techniques",
        tags: ["tips", "photography", "AI", "best-practices"],
        author_name: "Expert User"
      },
      {
        title: "Found something unusual - need help identifying!",
        content: `# Mystery Find from Creek Bed

I found this interesting specimen while hiking along a creek in Ohio. The AI gave me a 65% confidence on ammonite, but I'm not sure.

## Details

- **Location**: Central Ohio creek bed
- **Size**: About 4 inches across
- **Material**: Appears to be limestone matrix
- **Features**: Spiral pattern visible, some iridescence

## My Questions

1. Does this look like an ammonite to you?
2. What geological period might this be from?
3. Should I have it professionally examined?

Any help from experienced collectors would be appreciated!`,
        category: "identification-help",
        tags: ["ammonite", "ohio", "identification", "help"],
        author_name: "NewCollector"
      },
      {
        title: "Amazing trilobite find - 95% confidence!",
        content: `# My Best Find Yet!

Just wanted to share my excitement - found a beautifully preserved trilobite specimen!

## The Discovery

I've been searching a quarry in Pennsylvania for months with no luck. Yesterday, I split open a piece of shale and there it was - a nearly complete trilobite!

## AI Analysis Results

- **Classification**: Phacops rana (trilobite)
- **Confidence**: 95%
- **Time Period**: Devonian (approximately 385 million years ago)
- **Significance**: High

## What Made This Find Special

- Complete specimen with both eyes visible
- Excellent preservation of segments
- Still in original matrix

The AI's analysis matched what I found when researching - Phacops is indeed common in Pennsylvania Devonian rocks.

Has anyone else found trilobites in this area? Would love to compare notes!`,
        category: "discoveries",
        tags: ["trilobite", "pennsylvania", "devonian", "success-story"],
        author_name: "FossilHunter42"
      },
      {
        title: "Beginner's Guide to Field Safety",
        content: `# Stay Safe While Fossil Hunting

As we get more members, I wanted to share some important safety tips. I've been collecting for 20 years and have learned some lessons the hard way!

## Essential Safety Gear

- **Eye protection** - Flying rock chips are no joke
- **Gloves** - Protect from sharp edges
- **Sturdy boots** - Ankle support is crucial
- **Sun protection** - Hat, sunscreen, water
- **First aid kit** - Always be prepared

## Site Safety

### Before You Go
- Tell someone where you'll be
- Check weather forecasts
- Research the area
- Get necessary permits

### At the Site
- Watch for unstable ground
- Be aware of tides (beach collecting)
- Stay away from cliff faces
- Never enter mines/caves alone

## Wildlife Awareness

Depending on your location, watch for:
- Snakes
- Spiders
- Ticks
- Poison ivy/oak

## Emergency Preparedness

Always carry:
- Charged phone
- Whistle
- Flashlight
- Emergency contact info

Stay safe out there, everyone! 🦺`,
        category: "resources",
        tags: ["safety", "beginner", "guide", "field-work"],
        author_name: "VeteranCollector"
      },
      {
        title: "What's the difference between fossils and artifacts?",
        content: `# Fossils vs Artifacts - A Quick Guide

I see this question come up a lot, so here's a simple breakdown:

## Fossils 🦴

**Definition**: Preserved remains or traces of ancient organisms

**Examples**:
- Bones and teeth
- Shells
- Plant impressions
- Footprints (trace fossils)
- Petrified wood

**Age**: Typically over 10,000 years old

**Study**: Paleontology

## Artifacts 🏺

**Definition**: Objects made or modified by humans

**Examples**:
- Stone tools
- Pottery
- Jewelry
- Weapons
- Building materials

**Age**: Can be any age (human history)

**Study**: Archaeology

## Why It Matters

The distinction is important because:
1. Different laws may apply
2. Different experts study them
3. Different preservation methods needed
4. Different significance for science

## Gray Areas

Sometimes it's tricky! For example:
- A bone tool is both organic AND human-made
- Fossilized human remains cross both categories

FossilFinder's AI can analyze both types! 

Any questions? Ask below! 👇`,
        category: "general",
        tags: ["education", "fossils", "artifacts", "beginners"],
        author_name: "EducatorPro"
      }
    ];

    for (const post of initialPosts) {
      try {
        await base44.entities.ForumPost.create(post);
      } catch (error) {
        console.error(`Failed to create post ${post.title}:`, error);
      }
    }
    
    await loadPosts();
  };

  const loadPosts = async () => {
    try {
      const data = await base44.entities.ForumPost.list("-created_date");
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPost = async (post) => {
    navigate(createPageUrl(`ForumPost?id=${post.id}`));
  };

  const handleLikePost = async (post, e) => {
    e.stopPropagation();
    if (!currentUser) return;

    const likedBy = post.liked_by || [];
    const hasLiked = likedBy.includes(currentUser.email);

    try {
      if (hasLiked) {
        await base44.entities.ForumPost.update(post.id, {
          likes: Math.max(0, (post.likes || 0) - 1),
          liked_by: likedBy.filter(email => email !== currentUser.email)
        });
      } else {
        await base44.entities.ForumPost.update(post.id, {
          likes: (post.likes || 0) + 1,
          liked_by: [...likedBy, currentUser.email]
        });
      }
      loadPosts();
    } catch (error) {
      console.error("Failed to like post:", error);
    }
  };

  const handleSavePost = async () => {
    setIsCreating(false);
    await loadPosts();
  };

  const handleCloseEditor = () => {
    setIsCreating(false);
  };

  const categories = [
    { value: "all", label: "All Posts", icon: MessageSquare },
    { value: "general", label: "General", icon: MessageCircle },
    { value: "identification-help", label: "ID Help", icon: Search },
    { value: "discoveries", label: "Discoveries", icon: Flame },
    { value: "techniques", label: "Techniques", icon: TrendingUp },
    { value: "resources", label: "Resources", icon: Filter },
    { value: "announcements", label: "Announcements", icon: Pin }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      general: "bg-slate-100 text-slate-800 border-slate-200",
      "identification-help": "bg-blue-100 text-blue-800 border-blue-200",
      discoveries: "bg-green-100 text-green-800 border-green-200",
      techniques: "bg-purple-100 text-purple-800 border-purple-200",
      resources: "bg-amber-100 text-amber-800 border-amber-200",
      announcements: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[category] || colors.general;
  };

  // Check if forum is disabled
  if (appSettings && !appSettings.forum_enabled) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-8 flex items-center justify-center`}>
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80'} backdrop-blur-xl shadow-lg max-w-md text-center p-8`}>
          <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>Forum Unavailable</h2>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>The forum has been temporarily disabled by an administrator.</p>
        </Card>
      </div>
    );
  }

  const canPost = !appSettings || appSettings.forum_posting_enabled;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'} p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-gradient-to-r from-cyan-500 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} rounded-xl flex items-center justify-center`}>
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Community Forum
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Discuss, share discoveries, and learn from fellow enthusiasts
                </p>
              </div>
            </div>
            {canPost && (
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg mb-6`}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Search posts, tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("recent")}
                    className={sortBy === "recent" ? "bg-blue-600" : ""}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Recent
                  </Button>
                  <Button
                    variant={sortBy === "popular" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("popular")}
                    className={sortBy === "popular" ? "bg-blue-600" : ""}
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Popular
                  </Button>
                  <Button
                    variant={sortBy === "discussed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("discussed")}
                    className={sortBy === "discussed" ? "bg-blue-600" : ""}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Discussed
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={selectedCategory === cat.value ? "bg-blue-600" : ""}
                  >
                    <cat.icon className="w-4 h-4 mr-1" />
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className={`h-32 ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'} rounded-xl animate-pulse`} />
            ))
          ) : filteredPosts.length === 0 ? (
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white/80 border-0'} backdrop-blur-xl shadow-lg`}>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No posts found
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchTerm ? "Try adjusting your search terms." : "Be the first to start a discussion!"}
                </p>
                <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`bg-white border-2 hover:shadow-xl transition-all duration-200 cursor-pointer ${
                    post.is_pinned ? "border-amber-300 bg-amber-50/50" : "border-slate-100 hover:border-blue-200"
                  }`}
                  onClick={() => handleViewPost(post)}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      {/* Left side - votes/likes */}
                      <div className="flex flex-col items-center gap-1 min-w-[50px]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleLikePost(post, e)}
                          className={`h-8 w-8 p-0 ${
                            post.liked_by?.includes(currentUser?.email)
                              ? "text-blue-600 bg-blue-100"
                              : "text-slate-400 hover:text-blue-600"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-semibold text-slate-700">{post.likes || 0}</span>
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {post.is_pinned && (
                            <Pin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                          )}
                          {post.is_locked && (
                            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                          )}
                          <h3 className="text-lg font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
                            {post.title}
                          </h3>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {post.content.replace(/[#*`]/g, '').substring(0, 200)}...
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <Badge className={getCategoryColor(post.category)}>
                            {post.category?.replace(/-/g, ' ')}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{post.author_name || post.created_by?.split('@')[0] || 'Anonymous'}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(post.created_date), "MMM d, yyyy")}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views || 0} views</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.reply_count || 0} replies</span>
                          </div>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-blue-600">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Post Editor Modal */}
      <AnimatePresence>
        {isCreating && (
          <ForumPostEditor
            currentUser={currentUser}
            onSave={handleSavePost}
            onClose={handleCloseEditor}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}