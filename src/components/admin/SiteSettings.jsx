import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Megaphone, Settings as SettingsIcon, Ban, Save, AlertTriangle, UserCheck, 
  MessageCircle, Heart, Share2, Shield, Map, BookOpen, ScanLine, Trophy,
  MessageSquare, Upload, MapPin, Bot, Wrench, ToggleLeft, Loader2, RefreshCw, Trash2,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiteSettings() {
  const [settings, setSettings] = useState(null);
  const [settingsId, setSettingsId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await base44.entities.AppSettings.list();
      
      if (data.length > 0) {
        // Use first settings record
        setSettings(data[0]);
        setSettingsId(data[0].id);
      } else {
        // Create default settings
        const defaults = {
          announcement_text: '',
          announcement_active: false,
          announcement_type: 'info',
          discoveries_enabled: true,
          expert_matching_enabled: true,
          forum_enabled: true,
          forum_posting_enabled: true,
          fosfeed_enabled: true,
          fosfeed_posting_enabled: true,
          fosfeed_follow_enabled: true,
          fosfeed_reporting_enabled: true,
          community_showcase_enabled: true,
          multi_scan_enabled: true,
          discovery_map_enabled: true,
          education_enabled: true,
          comments_enabled: true,
          likes_enabled: true,
          sharing_enabled: true,
          ai_moderation_enabled: true,
          maintenance_mode: false,
          maintenance_message: '',
          max_uploads_per_day: 10,
          require_location: true
        };
        
        const created = await base44.entities.AppSettings.create(defaults);
        setSettings(created);
        setSettingsId(created.id);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settingsId || !settings) return;
    
    setIsSaving(true);
    setMessage('');

    try {
      // Clean payload - remove system fields
      const payload = { ...settings };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by;

      await base44.entities.AppSettings.update(settingsId, payload);
      
      setMessage('✅ Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage(`❌ Failed to save: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    
    setIsSaving(true);
    try {
      // Delete all existing settings
      const allSettings = await base44.entities.AppSettings.list();
      for (const s of allSettings) {
        await base44.entities.AppSettings.delete(s.id);
      }
      
      // Reload (will create defaults)
      await loadSettings();
      setMessage('✅ Settings reset to defaults');
    } catch (error) {
      console.error("Failed to reset:", error);
      setMessage('❌ Failed to reset settings');
    } finally {
      setIsSaving(false);
    }
  };

  const SettingToggle = ({ icon: Icon, iconColor, title, description, settingKey, danger = false }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg ${danger ? 'bg-red-900/20 border border-red-500/30' : 'bg-slate-900/50 border border-slate-700/50'}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
        <div>
          <Label className="text-base font-medium text-white">{title}</Label>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[settingKey] === true}
        onCheckedChange={(checked) => setSettings({ ...settings, [settingKey]: checked })}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert className="border-red-500/50 bg-red-900/20">
        <AlertDescription className="text-red-400">Failed to load settings</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.includes('❌') ? 'border-red-500/50 bg-red-900/20' : 'border-green-500/50 bg-green-900/20'}>
          <AlertDescription className={message.includes('❌') ? 'text-red-400' : 'text-green-400'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Mode */}
      <Card className="bg-slate-900/50 border-slate-700/50 border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Wrench className="w-6 h-6 text-red-500" />
            Maintenance Mode
            {settings.maintenance_mode && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">ACTIVE</Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400">Put the entire site in maintenance mode - only admins can access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            icon={Wrench}
            iconColor="text-red-500"
            title="Enable Maintenance Mode"
            description="Block all non-admin users from accessing the site"
            settingKey="maintenance_mode"
            danger={true}
          />
          {settings.maintenance_mode && (
            <div className="space-y-2">
              <Label className="text-white">Maintenance Message</Label>
              <Textarea
                placeholder="We're currently performing maintenance. Please check back soon!"
                value={settings.maintenance_message || ''}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                rows={2}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcement Banner */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-blue-400" />
            Site Announcement
          </CardTitle>
          <CardDescription className="text-slate-400">Display a banner message to all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <Megaphone className="w-5 h-5 mt-0.5 text-blue-400" />
              <div>
                <Label className="text-base font-medium text-white">Enable Announcement Banner</Label>
                <p className="text-sm text-slate-400">Show announcement to all users site-wide</p>
              </div>
            </div>
            <Switch
              checked={settings.announcement_active === true}
              onCheckedChange={(checked) => setSettings({ ...settings, announcement_active: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Announcement Type</Label>
              <Select
                value={settings.announcement_type}
                onValueChange={(value) => setSettings({ ...settings, announcement_type: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">ℹ️ Information</SelectItem>
                  <SelectItem value="warning">⚠️ Warning</SelectItem>
                  <SelectItem value="success">✅ Success</SelectItem>
                  <SelectItem value="error">🚨 Error/Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Announcement Text</Label>
            <Textarea
              placeholder="Enter your announcement message..."
              value={settings.announcement_text || ''}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              rows={2}
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Page Controls */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <ToggleLeft className="w-6 h-6 text-purple-400" />
            Page Controls
          </CardTitle>
          <CardDescription className="text-slate-400">Enable or disable specific pages and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingToggle icon={Upload} iconColor="text-amber-400" title="Discovery Uploads" description="Allow users to upload new archaeological photos" settingKey="discoveries_enabled" />
          <SettingToggle icon={ScanLine} iconColor="text-cyan-400" title="Multi-Scan Feature" description="Allow users to use the multi-rock scanning tool" settingKey="multi_scan_enabled" />
          <SettingToggle icon={TrendingUp} iconColor="text-cyan-400" title="FosFeed Platform" description="Enable the TikTok-style FosFeed social feed" settingKey="fosfeed_enabled" />
          <SettingToggle icon={MessageSquare} iconColor="text-indigo-400" title="Forum Access" description="Allow users to view the forum" settingKey="forum_enabled" />
          <SettingToggle icon={Map} iconColor="text-emerald-400" title="Discovery Map" description="Show the global discovery map page" settingKey="discovery_map_enabled" />
          <SettingToggle icon={BookOpen} iconColor="text-indigo-400" title="Education Hub" description="Enable the education and learning page" settingKey="education_enabled" />
          <SettingToggle icon={UserCheck} iconColor="text-purple-400" title="Expert Matching" description="Allow users to find and connect with experts" settingKey="expert_matching_enabled" />
        </CardContent>
      </Card>

      {/* Community Features */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            Community Features
          </CardTitle>
          <CardDescription className="text-slate-400">Control social and community features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingToggle icon={Trophy} iconColor="text-amber-400" title="Community Showcase" description="Enable the community showcase page" settingKey="community_showcase_enabled" />
          <SettingToggle icon={MessageCircle} iconColor="text-blue-400" title="Comments" description="Allow users to comment on discoveries" settingKey="comments_enabled" />
          <SettingToggle icon={Heart} iconColor="text-red-400" title="Likes" description="Allow users to like discoveries and comments" settingKey="likes_enabled" />
          <SettingToggle icon={Share2} iconColor="text-green-400" title="Sharing" description="Allow users to share discoveries" settingKey="sharing_enabled" />
          <Separator className="my-4 bg-slate-700" />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Forum Settings
            </h4>
            <SettingToggle icon={MessageSquare} iconColor="text-indigo-400" title="Forum Posting" description="Allow users to create new forum posts" settingKey="forum_posting_enabled" />
          </div>
          <Separator className="my-4 bg-slate-700" />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              FosFeed Settings
            </h4>
            <SettingToggle icon={Upload} iconColor="text-amber-400" title="FosFeed Posting" description="Allow users to post new discoveries to FosFeed" settingKey="fosfeed_posting_enabled" />
            <SettingToggle icon={UserCheck} iconColor="text-purple-400" title="Follow System" description="Allow users to follow/unfollow each other" settingKey="fosfeed_follow_enabled" />
            <SettingToggle icon={Shield} iconColor="text-red-400" title="Content Reporting" description="Enable report button with AI moderation" settingKey="fosfeed_reporting_enabled" />
          </div>
        </CardContent>
      </Card>

      {/* Upload Settings */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Upload className="w-6 h-6 text-amber-400" />
            Upload Settings
          </CardTitle>
          <CardDescription className="text-slate-400">Configure upload requirements and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle icon={MapPin} iconColor="text-emerald-400" title="Require GPS Location" description="Users must provide GPS coordinates when uploading" settingKey="require_location" />
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 mt-0.5 text-amber-400" />
              <div>
                <Label className="text-base font-medium text-white">Max Uploads Per Day</Label>
                <p className="text-sm text-slate-400">Limit how many discoveries a user can upload daily</p>
              </div>
            </div>
            <Input
              type="number"
              min="1"
              max="100"
              value={settings.max_uploads_per_day || 10}
              onChange={(e) => setSettings({ ...settings, max_uploads_per_day: parseInt(e.target.value) || 10 })}
              className="w-20 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Moderation */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            Moderation
          </CardTitle>
          <CardDescription className="text-slate-400">Content moderation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingToggle icon={Bot} iconColor="text-purple-400" title="AI Comment Moderation" description="Automatically check comments for inappropriate content" settingKey="ai_moderation_enabled" />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardContent className="pt-6 space-y-3">
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-lg py-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
          
          <Button
            onClick={resetSettings}
            disabled={isSaving}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}