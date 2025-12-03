
import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  MessageSquare, 
  AlertTriangle, 
  Ban, 
  Shield,
  CheckCircle 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ModerationModal({ user, onClose, onComplete }) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const handleVerbalWarning = async () => {
    if (!reason.trim()) {
      setStatusType("error");
      setStatusMessage("Please provide a reason for the warning.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("");

    try {
      const currentAdmin = await base44.auth.me();

      // Create moderation record
      await base44.entities.UserModeration.create({
        user_email: user.email,
        action_type: "verbal_warning",
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        moderator_email: currentAdmin.email
      });

      // Update user warning count and notification fields
      await base44.entities.User.update(user.id, {
        warning_count: (user.warning_count || 0) + 1,
        last_warning_at: new Date().toISOString(),
        moderation_notification_read: false,
        last_moderation_action: `You have received a verbal warning from an administrator. Reason: ${reason.trim()}`
      });

      setStatusType("success");
      setStatusMessage("Verbal warning issued successfully.");
      setTimeout(() => onComplete(), 1500);
    } catch (error) {
      console.error("Failed to issue verbal warning:", error);
      setStatusType("error");
      setStatusMessage("Failed to issue warning. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormalWarning = async () => {
    if (!reason.trim()) {
      setStatusType("error");
      setStatusMessage("Please provide a reason for the formal warning.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("");

    try {
      const currentAdmin = await base44.auth.me();

      // Create moderation record
      await base44.entities.UserModeration.create({
        user_email: user.email,
        action_type: "formal_warning",
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        moderator_email: currentAdmin.email
      });

      // Update user warning count and notification fields
      await base44.entities.User.update(user.id, {
        warning_count: (user.warning_count || 0) + 1,
        last_warning_at: new Date().toISOString(),
        moderation_notification_read: false,
        last_moderation_action: `You have received a formal warning from an administrator. Reason: ${reason.trim()}. Further violations may result in account suspension.`
      });

      setStatusType("success");
      setStatusMessage("Formal warning issued successfully.");
      setTimeout(() => onComplete(), 1500);
    } catch (error) {
      console.error("Failed to issue formal warning:", error);
      setStatusType("error");
      setStatusMessage("Failed to issue warning. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBan = async () => {
    if (!reason.trim()) {
      setStatusType("error");
      setStatusMessage("Please provide a reason for the ban.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("");

    try {
      const currentAdmin = await base44.auth.me();

      // Create moderation record
      await base44.entities.UserModeration.create({
        user_email: user.email,
        action_type: "ban",
        reason: reason.trim(),
        notes: notes.trim() || undefined,
        moderator_email: currentAdmin.email
      });

      // Ban the user and update notification fields
      await base44.entities.User.update(user.id, {
        is_banned: true,
        ban_reason: reason.trim(),
        banned_at: new Date().toISOString(),
        banned_by: currentAdmin.email,
        moderation_notification_read: false,
        last_moderation_action: `Your account has been suspended. Reason: ${reason.trim()}`
      });

      setStatusType("success");
      setStatusMessage("User banned successfully.");
      setTimeout(() => onComplete(), 1500);
    } catch (error) {
      console.error("Failed to ban user:", error);
      setStatusType("error");
      setStatusMessage("Failed to ban user. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnban = async () => {
    setIsProcessing(true);
    setStatusMessage("");

    try {
      const currentAdmin = await base44.auth.me();

      // Create moderation record
      await base44.entities.UserModeration.create({
        user_email: user.email,
        action_type: "unban",
        reason: "User unbanned by administrator",
        notes: notes.trim() || undefined,
        moderator_email: currentAdmin.email
      });

      // Unban the user and update notification fields
      await base44.entities.User.update(user.id, {
        is_banned: false,
        ban_reason: null,
        banned_at: null,
        banned_by: null,
        moderation_notification_read: false,
        last_moderation_action: "Your account suspension has been lifted. Please ensure you follow our community guidelines going forward."
      });

      setStatusType("success");
      setStatusMessage("User unbanned successfully.");
      setTimeout(() => onComplete(), 1500);
    } catch (error) {
      console.error("Failed to unban user:", error);
      setStatusType("error");
      setStatusMessage("Failed to unban user. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              Moderate User
            </h2>
            <p className="text-sm text-slate-600 mt-1">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {statusMessage && (
            <Alert className={`mb-6 ${
              statusType === "success" 
                ? "border-green-200 bg-green-50" 
                : "border-red-200 bg-red-50"
            }`}>
              {statusType === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={
                statusType === "success" ? "text-green-800" : "text-red-800"
              }>
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* User Info Card */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Name</p>
                <p className="font-semibold text-slate-800">{user.full_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-slate-600">Email</p>
                <p className="font-semibold text-slate-800">{user.email}</p>
              </div>
              <div>
                <p className="text-slate-600">Current Warnings</p>
                <p className="font-semibold text-slate-800">{user.warning_count || 0}</p>
              </div>
              <div>
                <p className="text-slate-600">Status</p>
                <p className={`font-semibold ${user.is_banned ? 'text-red-600' : 'text-green-600'}`}>
                  {user.is_banned ? 'Banned' : 'Active'}
                </p>
              </div>
            </div>
          </div>

          {user.is_banned ? (
            // Unban UI
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <Ban className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>This user is currently banned.</strong>
                  <br />
                  Reason: {user.ban_reason} <br />
                  User will be notified that their ban has been lifted.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about the unban..."
                  rows={3}
                  className="mt-1"
                  disabled={isProcessing}
                />
              </div>

              <Button
                onClick={handleUnban}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? "Processing..." : "Unban User"}
              </Button>
            </div>
          ) : (
            // Warning/Ban UI
            <Tabs defaultValue="verbal" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="verbal" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Verbal
                </TabsTrigger>
                <TabsTrigger value="formal" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Formal
                </TabsTrigger>
                <TabsTrigger value="ban" className="flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  Ban
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason *</Label>
                  <Input
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for this action..."
                    className="mt-1"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context or details..."
                    rows={3}
                    className="mt-1"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <TabsContent value="verbal" className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <MessageSquare className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    A verbal warning is an informal notice that doesn't restrict the user's access. 
                    The warning count will increase by 1. <strong>User will be notified on their next login.</strong>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleVerbalWarning}
                  disabled={isProcessing}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {isProcessing ? "Processing..." : "Issue Verbal Warning"}
                </Button>
              </TabsContent>

              <TabsContent value="formal" className="space-y-4">
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    A formal warning is a serious notice logged in the system. 
                    The warning count will increase by 1. Consider this before banning. <strong>User will be notified on their next login.</strong>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleFormalWarning}
                  disabled={isProcessing}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isProcessing ? "Processing..." : "Issue Formal Warning"}
                </Button>
              </TabsContent>

              <TabsContent value="ban" className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <Ban className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Warning:</strong> Banning this user will immediately prevent them from accessing the platform. 
                    This action is reversible. <strong>User will see a ban notice on their next login.</strong>
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleBan}
                  disabled={isProcessing}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? "Processing..." : "Ban User"}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
