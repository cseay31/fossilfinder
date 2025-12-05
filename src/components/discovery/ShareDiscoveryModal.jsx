import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Globe, Lock, Users, Plus, Loader2, Check } from "lucide-react";

export default function ShareDiscoveryModal({ discovery, onClose, onUpdate }) {
  const [visibility, setVisibility] = useState(discovery.visibility || 'public');
  const [sharedWith, setSharedWith] = useState(discovery.shared_with || []);
  const [newEmail, setNewEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (email && !sharedWith.includes(email) && email.includes('@')) {
      setSharedWith([...sharedWith, email]);
      setNewEmail("");
    }
  };

  const removeEmail = (email) => {
    setSharedWith(sharedWith.filter(e => e !== email));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.entities.Discovery.update(discovery.id, {
        visibility,
        shared_with: visibility === 'shared' ? sharedWith : []
      });
      setSaved(true);
      if (onUpdate) {
        onUpdate({ ...discovery, visibility, shared_with: sharedWith });
      }
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error("Failed to update sharing:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-800">Share Discovery</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <RadioGroup value={visibility} onValueChange={setVisibility}>
            <div className="space-y-3">
              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${visibility === 'public' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}>
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Public</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">Anyone can view this discovery in the community</p>
                </Label>
              </div>

              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${visibility === 'shared' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}>
                <RadioGroupItem value="shared" id="shared" />
                <Label htmlFor="shared" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Shared</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">Only specific people you choose can view</p>
                </Label>
              </div>

              <div className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${visibility === 'private' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}>
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold">Private</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">Only you can see this discovery</p>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {visibility === 'shared' && (
            <div className="space-y-3">
              <Label>Share with</Label>
              <div className="flex gap-2">
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                  onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                />
                <Button onClick={addEmail} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {sharedWith.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {sharedWith.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button onClick={() => removeEmail(email)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleSave} 
            disabled={isSaving || saved}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
          >
            {saved ? (
              <><Check className="w-4 h-4 mr-2" /> Saved!</>
            ) : isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}