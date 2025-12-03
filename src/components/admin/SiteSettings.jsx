
import React, { useState, useEffect } from 'react';
import { Settings } from "@/entities/Settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Megaphone, Settings as SettingsIcon, Ban, Save, AlertTriangle, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiteSettings() {
  const [settings, setSettings] = useState({
    announcement_text: '',
    announcement_active: false,
    announcement_type: 'info',
    discoveries_enabled: true,
    // NEW: Add expert_matching_enabled
    expert_matching_enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await Settings.filter({ setting_key: 'global' });
      if (data.length > 0) {
        setSettings(data[0]);
      } else {
        // Auto-create a default global settings record on first run
        const defaultPayload = {
          announcement_text: '',
          announcement_active: false,
          announcement_type: 'info',
          discoveries_enabled: true,
          expert_matching_enabled: true, // Initialize new setting
          setting_key: 'global'
        };
        const created = await Settings.create(defaultPayload);
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
      // Only send allowed fields and ensure correct types for persistence
      const payload = {
        announcement_text: settings.announcement_text || '',
        announcement_active: Boolean(settings.announcement_active), // Ensure boolean type
        announcement_type: settings.announcement_type || 'info',
        discoveries_enabled: settings.discoveries_enabled !== false, // Ensure boolean type, default to true if undefined/null
        expert_matching_enabled: settings.expert_matching_enabled !== false, // Ensure boolean type, default to true if undefined/null
        setting_key: 'global'
      };

      const existing = await Settings.filter({ setting_key: 'global' });
      if (existing.length > 0) {
        await Settings.update(existing[0].id, payload);
      } else {
        await Settings.create(payload);
      }

      setMessage('Settings saved successfully!');
      // Reload settings to reflect changes, including default values if any new settings were added
      await loadSettings();
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage(`Failed to save settings: ${error.message || error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const announcementTypeColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
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

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-blue-600" />
            Site Announcement Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Announcement</Label>
              <p className="text-sm text-slate-600">Show announcement banner to all users</p>
            </div>
            <Switch
              checked={Boolean(settings.announcement_active)} // Ensure checked prop is always boolean
              onCheckedChange={(checked) => setSettings({ ...settings, announcement_active: checked })}
            />
          </div>

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
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Announcement Text</Label>
            <Textarea
              placeholder="Enter your announcement message here..."
              value={settings.announcement_text}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              rows={3}
            />
          </div>

          {settings.announcement_active && settings.announcement_text && ( // Only show preview if active AND text exists
            <div className="space-y-2">
              <Label>Preview:</Label>
              <div className={`p-4 rounded-lg border-2 ${announcementTypeColors[settings.announcement_type]}`}>
                <p className="font-medium">{settings.announcement_text}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <Ban className="w-6 h-6 text-red-600" />
            Discovery Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Allow New Discoveries</Label>
              <p className="text-sm text-slate-600">
                When disabled, users won't be able to upload new archaeological photos for analysis
              </p>
            </div>
            <Switch
              checked={settings.discoveries_enabled !== false} // Ensure checked prop handles undefined/null as true
              onCheckedChange={(checked) => setSettings({ ...settings, discoveries_enabled: checked })}
            />
          </div>

          {settings.discoveries_enabled === false && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                New discovery uploads are currently disabled. Users will see a maintenance message on the upload page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* NEW: Web-based Expert Matching Control Card */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-purple-600" /> {/* Icon for expert matching */}
            Web-based Expert Matching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Expert Matching</Label>
              <p className="text-sm text-slate-600">
                When enabled, users can opt-in to be matched with experts for consultation on their archaeological discoveries.
              </p>
            </div>
            <Switch
              checked={settings.expert_matching_enabled !== false} // Ensure checked prop handles undefined/null as true
              onCheckedChange={(checked) => setSettings({ ...settings, expert_matching_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="pt-6">
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Save className="w-4 h-4 mr-2 animate-pulse" />
                Saving Settings...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
