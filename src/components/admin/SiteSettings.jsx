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
  MessageSquare, Upload, MapPin, Bot, Wrench, ToggleLeft, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    announcement_text: '',
    announcement_active: false,
    announcement_type: 'info',
    discoveries_enabled: true,
    expert_matching_enabled: true,
    forum_enabled: true,
    forum_posting_enabled: true,
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
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await base44.entities.Settings.filter({ setting_key: 'global' });
      if (data.length > 0) {
        setSettings({ ...settings, ...data[0] });
      } else {
        const created = await base44.entities.Settings.create({
          ...settings,
          setting_key: 'global'
        });
        setSettings(created);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage(`Failed to load settings: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const payload = { ...settings, setting_key: 'global' };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by;

      const existing = await base44.entities.Settings.filter({ setting_key: 'global' });
      if (existing.length > 0) {
        await base44.entities.Settings.update(existing[0].id, payload);
      } else {
        await base44.entities.Settings.create(payload);
      }

      setMessage('Settings saved successfully!');
      await loadSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage(`Failed to save settings: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const SettingToggle = ({ icon: Icon, iconColor, title, description, settingKey, danger = false }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg ${danger ? 'bg-red-50 border border-red-200' : 'bg-slate-50'}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
        <div>
          <Label className="text-base font-medium">{title}</Label>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[settingKey] !== false}
        onCheckedChange={(checked) => setSettings({ ...settings, [settingKey]: checked })}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.includes('Failed') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.includes('Failed') ? 'text-red-800' : 'text-green-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Mode - Top Priority */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Wrench className="w-6 h-6 text-red-600" />
            Maintenance Mode
            {settings.maintenance_mode && (
              <Badge className="bg-red-100 text-red-800 border-red-200">ACTIVE</Badge>
            )}
          </CardTitle>
          <CardDescription>Put the entire site in maintenance mode - only admins can access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            icon={Wrench}
            iconColor="text-red-600"
            title="Enable Maintenance Mode"
            description="Block all non-admin users from accessing the site"
            settingKey="maintenance_mode"
            danger={true}
          />
          {settings.maintenance_mode && (
            <div className="space-y-2">
              <Label>Maintenance Message</Label>
              <Textarea
                placeholder="We're currently performing maintenance. Please check back soon!"
                value={settings.maintenance_message || ''}
                onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcement Banner */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-blue-600" />
            Site Announcement
          </CardTitle>
          <CardDescription>Display a banner message to all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
            <div className="flex items-start gap-3">
              <Megaphone className="w-5 h-5 mt-0.5 text-blue-600" />
              <div>
                <Label className="text-base font-medium">Enable Announcement Banner</Label>
                <p className="text-sm text-slate-600">Show announcement to all users site-wide</p>
              </div>
            </div>
            <Switch
              checked={Boolean(settings.announcement_active)}
              onCheckedChange={(checked) => setSettings({ ...settings, announcement_active: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Announcement Type</Label>
              <Select
                value={settings.announcement_type}
                onValueChange={(value) => setSettings({ ...settings, announcement_type: value })}
              >
                <SelectTrigger>
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
            <Label>Announcement Text</Label>
            <Textarea
              placeholder="Enter your announcement message..."
              value={settings.announcement_text || ''}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Page Controls */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <ToggleLeft className="w-6 h-6 text-purple-600" />
            Page Controls
          </CardTitle>
          <CardDescription>Enable or disable specific pages and features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingToggle
            icon={Upload}
            iconColor="text-amber-600"
            title="Discovery Uploads"
            description="Allow users to upload new archaeological photos"
            settingKey="discoveries_enabled"
          />
          <SettingToggle
            icon={ScanLine}
            iconColor="text-cyan-600"
            title="Multi-Scan Feature"
            description="Allow users to use the multi-rock scanning tool"
            settingKey="multi_scan_enabled"
          />
          <SettingToggle
            icon={Map}
            iconColor="text-emerald-600"
            title="Discovery Map"
            description="Show the global discovery map page"
            settingKey="discovery_map_enabled"
          />
          <SettingToggle
            icon={BookOpen}
            iconColor="text-indigo-600"
            title="Education Hub"
            description="Enable the education and learning page"
            settingKey="education_enabled"
          />
          <SettingToggle
            icon={UserCheck}
            iconColor="text-purple-600"
            title="Expert Matching"
            description="Allow users to find and connect with experts"
            settingKey="expert_matching_enabled"
          />
        </CardContent>
      </Card>

      {/* Community Features */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-600" />
            Community Features
          </CardTitle>
          <CardDescription>Control social and community features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingToggle
            icon={Trophy}
            iconColor="text-amber-600"
            title="Community Showcase"
            description="Enable the community showcase page"
            settingKey="community_showcase_enabled"
          />
          <SettingToggle
            icon={MessageSquare}
            iconColor="text-indigo-600"
            title="Forum Access"
            description="Allow users to view the forum"
            settingKey="forum_enabled"
          />
          <SettingToggle
            icon={MessageSquare}
            iconColor="text-indigo-600"
            title="Forum Posting"
            description="Allow users to create new forum posts"
            settingKey="forum_posting_enabled"
          />
          <Separator className="my-4" />
          <SettingToggle
            icon={MessageCircle}
            iconColor="text-blue-600"
            title="Comments"
            description="Allow users to comment on discoveries"
            settingKey="comments_enabled"
          />
          <SettingToggle
            icon={Heart}
            iconColor="text-red-500"
            title="Likes"
            description="Allow users to like discoveries and comments"
            settingKey="likes_enabled"
          />
          <SettingToggle
            icon={Share2}
            iconColor="text-green-600"
            title="Sharing"
            description="Allow users to share discoveries"
            settingKey="sharing_enabled"
          />
        </CardContent>
      </Card>

      {/* Upload Settings */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Upload className="w-6 h-6 text-amber-600" />
            Upload Settings
          </CardTitle>
          <CardDescription>Configure upload requirements and limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            icon={MapPin}
            iconColor="text-emerald-600"
            title="Require GPS Location"
            description="Users must provide GPS coordinates when uploading"
            settingKey="require_location"
          />
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 mt-0.5 text-amber-600" />
              <div>
                <Label className="text-base font-medium">Max Uploads Per Day</Label>
                <p className="text-sm text-slate-600">Limit how many discoveries a user can upload daily</p>
              </div>
            </div>
            <Input
              type="number"
              min="1"
              max="100"
              value={settings.max_uploads_per_day || 10}
              onChange={(e) => setSettings({ ...settings, max_uploads_per_day: parseInt(e.target.value) || 10 })}
              className="w-20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Moderation */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            Moderation
          </CardTitle>
          <CardDescription>Content moderation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingToggle
            icon={Bot}
            iconColor="text-purple-600"
            title="AI Comment Moderation"
            description="Automatically check comments for inappropriate content"
            settingKey="ai_moderation_enabled"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="pt-6">
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg py-6"
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
        </CardContent>
      </Card>
    </div>
  );
}