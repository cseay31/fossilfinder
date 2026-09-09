import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Trophy, Settings, Bell, Heart, Users, MapPin, Tag, AlertTriangle, Github } from "lucide-react";
import BadgeDisplay, { BADGES } from "../components/gamification/BadgeSystem";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import MobileSelect from "../components/mobile/MobileSelect";
import { useConfirmDialog } from "../components/ui/confirmation-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ProfilePage({ isDarkMode }) {
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [locationInput, setLocationInput] = useState('');
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [discoveries, setDiscoveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [selectedClassifications, setSelectedClassifications] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [user, userDiscoveries] = await Promise.all([
        base44.auth.me(),
        base44.entities.Discovery.list()
      ]);
      
      setCurrentUser(user);
      setDiscoveries(userDiscoveries.filter(d => d.created_by === user.email));
      setEditForm({
        display_name: user.display_name || '',
        bio: user.bio || ''
      });
      setSelectedClassifications(user.followed_classifications || []);
      setSelectedLocations(user.followed_locations || []);
      setNotificationPrefs(user.notification_preferences || {
        new_discoveries: true,
        featured_picks: true,
        followed_content: true
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await base44.auth.updateMe(editForm);
      setCurrentUser({ ...currentUser, ...editForm });
      setIsEditing(false);
      
      // Track profile update
      base44.analytics.track({
        eventName: "profile_updated",
        properties: { has_bio: Boolean(editForm.bio) }
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleSavePreferences = async () => {
    try {
      await base44.auth.updateMe({
        followed_classifications: selectedClassifications,
        followed_locations: selectedLocations,
        notification_preferences: notificationPrefs
      });
      toast.success("Preferences saved successfully!");
      
      // Track interest preferences update
      base44.analytics.track({
        eventName: "interests_updated",
        properties: {
          classification_count: selectedClassifications.length,
          location_count: selectedLocations.length
        }
      });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast.error("Failed to save preferences");
    }
  };

  const toggleClassification = (classification) => {
    setSelectedClassifications(prev =>
      prev.includes(classification)
        ? prev.filter(c => c !== classification)
        : [...prev, classification]
    );
  };

  const addLocation = () => {
    setShowLocationDialog(true);
  };
  
  const handleAddLocation = () => {
    if (locationInput && !selectedLocations.includes(locationInput)) {
      setSelectedLocations([...selectedLocations, locationInput]);
      setLocationInput('');
      setShowLocationDialog(false);
    }
  };

  const removeLocation = (location) => {
    setSelectedLocations(selectedLocations.filter(l => l !== location));
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'}`}>
        <p className={isDarkMode ? 'text-white' : 'text-stone-800'}>Loading profile...</p>
      </div>
    );
  }

  const commonClassifications = [
    'Trilobite', 'Ammonite', 'Dinosaur Fossil', 'Shark Tooth', 
    'Plant Fossil', 'Brachiopod', 'Coral', 'Gastropod'
  ];

  return (
    <div className={`min-h-screen p-6 pb-safe-bottom ${isDarkMode ? 'bg-transparent' : 'bg-gradient-to-br from-amber-50 to-stone-100'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentUser?.profile_image} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-stone-600 text-white text-3xl">
                  {currentUser?.display_name?.[0] || currentUser?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                    {currentUser?.display_name || currentUser?.full_name || 'Explorer'}
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                    {currentUser?.email}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-400' : 'text-amber-600'}`}>
                      {currentUser?.points || 0}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Points</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                      {discoveries.length}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Discoveries</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                      {currentUser?.follower_count || 0}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Followers</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
                      {currentUser?.badges?.length || 0}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>Badges</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className={`grid w-full grid-cols-3 md:grid-cols-5 gap-2 h-auto p-2 ${isDarkMode ? 'bg-slate-900/60' : 'bg-white'}`}>
            <TabsTrigger value="badges" className="flex-col h-auto py-3 gap-1">
              <Trophy className="w-5 h-5" />
              <span className="text-xs">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-col h-auto py-3 gap-1">
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex-col h-auto py-3 gap-1">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Interests</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-col h-auto py-3 gap-1">
              <Bell className="w-5 h-5" />
              <span className="text-xs">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex-col h-auto py-3 gap-1">
              <Settings className="w-5 h-5" />
              <span className="text-xs">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-stone-800'}>Your Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {currentUser?.badges && currentUser.badges.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {currentUser.badges.map(badgeId => (
                      <BadgeDisplay key={badgeId} badge={badgeId} size="md" />
                    ))}
                  </div>
                ) : (
                  <p className={isDarkMode ? 'text-slate-400' : 'text-stone-500'}>
                    No badges yet. Keep exploring to earn your first badge!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-stone-800'}>Edit Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>Display Name</Label>
                  <Input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                    className={isDarkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <div>
                  <Label className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>Bio</Label>
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className={isDarkMode ? 'bg-white/5 border-white/10 text-white' : ''}
                  />
                </div>
                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-amber-600 to-stone-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-stone-800'}>Follow Your Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className={`flex items-center gap-2 mb-3 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    <Tag className="w-4 h-4" />
                    Follow Classifications
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {commonClassifications.map(classification => (
                      <Badge
                        key={classification}
                        variant={selectedClassifications.includes(classification) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleClassification(classification)}
                      >
                        {classification}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className={`flex items-center gap-2 mb-3 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                    <MapPin className="w-4 h-4" />
                    Follow Locations
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedLocations.map(location => (
                      <Badge
                        key={location}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => removeLocation(location)}
                      >
                        {location} ×
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={addLocation} className="min-h-[44px]">
                   + Add Location
                  </Button>
                </div>

                <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-amber-600 to-stone-700">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-stone-800'}>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>New Discoveries</Label>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      Get notified about new discoveries
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.new_discoveries}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, new_discoveries: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>Featured Picks</Label>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      Get notified about featured discoveries
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.featured_picks}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, featured_picks: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className={isDarkMode ? 'text-slate-300' : 'text-stone-700'}>Followed Content</Label>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-stone-500'}`}>
                      Get notified about content matching your interests
                    </p>
                  </div>
                  <Switch
                    checked={notificationPrefs.followed_content}
                    onCheckedChange={(checked) => 
                      setNotificationPrefs({ ...notificationPrefs, followed_content: checked })
                    }
                  />
                </div>

                <Button onClick={handleSavePreferences} className="bg-gradient-to-r from-amber-600 to-stone-700">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className={`${isDarkMode ? 'bg-slate-900/60 border-white/10' : 'bg-white'} backdrop-blur-xl`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-white' : 'text-stone-800'}>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>About FossilFinder</h3>
                  <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-amber-50 border-amber-100'}`}>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-300' : 'text-stone-700'}`}>
                      FossilFinder is free forever and open source. Browse the code, suggest features, or contribute on GitHub.
                    </p>
                    <a
                      href="https://github.com/cseay31/fossilfinder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                          : 'bg-stone-800 hover:bg-stone-900 text-white'
                      }`}
                    >
                      <Github className="w-4 h-4" />
                      <span>View on GitHub</span>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>Danger Zone</h3>
                  <Alert className="border-red-200 bg-red-50 mb-4">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Deleting your account is permanent and cannot be undone. All your discoveries, comments, and data will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      const confirmed = await confirm({
                        title: 'Delete Account?',
                        description: 'Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
                        confirmText: 'Yes, Delete My Account',
                        cancelText: 'Cancel',
                        variant: 'destructive'
                      });
                      
                      if (confirmed) {
                        const finalConfirm = await confirm({
                          title: 'Final Confirmation',
                          description: 'This is your last chance. All discoveries, comments, and data will be permanently deleted. Are you absolutely certain?',
                          confirmText: 'Delete Everything',
                          cancelText: 'Keep My Account',
                          variant: 'destructive'
                        });
                        
                        if (finalConfirm) {
                          handleDeleteAccount();
                        }
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 min-h-[44px]"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ConfirmDialog />
      <LocationDialog 
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        handleAddLocation={handleAddLocation}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

async function handleDeleteAccount() {
  try {
    const user = await base44.auth.me();
    
    // Delete user's discoveries
    const discoveries = await base44.entities.Discovery.filter({ created_by: user.email });
    for (const discovery of discoveries) {
      await base44.entities.Discovery.delete(discovery.id);
    }
    
    // Delete user's comments
    const comments = await base44.entities.DiscoveryComment.filter({ created_by: user.email });
    for (const comment of comments) {
      await base44.entities.DiscoveryComment.delete(comment.id);
    }
    
    // Delete user's forum posts
    const posts = await base44.entities.ForumPost.filter({ created_by: user.email });
    for (const post of posts) {
      await base44.entities.ForumPost.delete(post.id);
    }
    
    // Delete user's forum replies
    const replies = await base44.entities.ForumReply.filter({ created_by: user.email });
    for (const reply of replies) {
      await base44.entities.ForumReply.delete(reply.id);
    }
    
    // Delete user record
    await base44.entities.User.delete(user.id);
    
    // Logout
    toast.success('Your account has been permanently deleted.');
    base44.auth.logout();
  } catch (error) {
    console.error("Failed to delete account:", error);
    toast.error('Failed to delete account. Please try again or contact support.');
  }
}

// Location Input Dialog Component (inside Profile page)
const LocationDialog = ({ isOpen, onClose, locationInput, setLocationInput, handleAddLocation, isDarkMode }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className={isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white'}>
      <DialogHeader>
        <DialogTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>Add Location</DialogTitle>
        <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
          Enter a location you'd like to follow
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="e.g., Utah, Morrison Formation"
          className={isDarkMode ? 'bg-slate-800/50 border-white/10 text-white' : ''}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} className={isDarkMode ? 'border-white/10' : ''}>
          Cancel
        </Button>
        <Button onClick={handleAddLocation} className="bg-gradient-to-r from-amber-600 to-stone-700">
          Add Location
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);