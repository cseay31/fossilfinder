import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ReportModal({ isOpen, onClose, onSubmit, isDarkMode }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(reason);
    setIsSubmitting(false);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isDarkMode ? 'bg-slate-900 border-white/10 text-white' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Report Content
          </DialogTitle>
          <DialogDescription className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
            Help us keep the community safe. Please describe why this content is inappropriate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="reason" className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
              Reason for reporting
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue (e.g., spam, inappropriate content, harassment)..."
              rows={4}
              className={`mt-2 ${isDarkMode ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500' : ''}`}
            />
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            ⚠️ This content will be analyzed by AI and reviewed by our moderation team.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}