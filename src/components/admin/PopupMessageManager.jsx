import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit2, Save, X, Megaphone, Eye, EyeOff } from "lucide-react";

const TYPE_COLORS = {
  info: "bg-blue-100 text-blue-800",
  warning: "bg-amber-100 text-amber-800",
  success: "bg-emerald-100 text-emerald-800",
  announcement: "bg-purple-100 text-purple-800",
};

const defaultForm = {
  title: "",
  message: "",
  message_type: "info",
  is_active: false,
  show_once_per_session: true,
  button_text: "Got it!",
};

export default function PopupMessageManager({ isDarkMode }) {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // id or "new"
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    setLoading(true);
    const data = await base44.entities.PopupMessage.list("-created_date");
    setPopups(data);
    setLoading(false);
  };

  const startNew = () => {
    setForm(defaultForm);
    setEditing("new");
  };

  const startEdit = (popup) => {
    setForm({ ...popup });
    setEditing(popup.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(defaultForm);
  };

  const save = async () => {
    setSaving(true);
    if (editing === "new") {
      await base44.entities.PopupMessage.create(form);
    } else {
      await base44.entities.PopupMessage.update(editing, form);
    }
    await loadPopups();
    setSaving(false);
    cancelEdit();
  };

  const toggleActive = async (popup) => {
    await base44.entities.PopupMessage.update(popup.id, { is_active: !popup.is_active });
    await loadPopups();
  };

  const deletePopup = async (id) => {
    await base44.entities.PopupMessage.delete(id);
    await loadPopups();
  };

  const cardBg = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = isDarkMode ? "text-white" : "text-slate-800";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-500";
  const inputClass = isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>App Load Popups</h3>
          <p className={`text-sm ${textSecondary}`}>Messages shown to users when the app first loads.</p>
        </div>
        {editing !== "new" && (
          <Button onClick={startNew} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Popup
          </Button>
        )}
      </div>

      {/* Edit / Create Form */}
      {editing && (
        <Card className={`border-2 border-purple-400 ${cardBg}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-base ${textPrimary}`}>
              {editing === "new" ? "Create New Popup" : "Edit Popup"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className={textSecondary}>Title</Label>
              <Input
                className={`mt-1 ${inputClass}`}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Welcome back!"
              />
            </div>
            <div>
              <Label className={textSecondary}>Message</Label>
              <Textarea
                className={`mt-1 ${inputClass}`}
                rows={4}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message here..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={textSecondary}>Type</Label>
                <Select value={form.message_type} onValueChange={v => setForm({ ...form, message_type: v })}>
                  <SelectTrigger className={`mt-1 ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={textSecondary}>Button Text</Label>
                <Input
                  className={`mt-1 ${inputClass}`}
                  value={form.button_text}
                  onChange={e => setForm({ ...form, button_text: e.target.value })}
                  placeholder="Got it!"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={v => setForm({ ...form, is_active: v })}
                />
                <Label className={textSecondary}>Active (show to users)</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.show_once_per_session}
                  onCheckedChange={v => setForm({ ...form, show_once_per_session: v })}
                />
                <Label className={textSecondary}>Once per session</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving || !form.title || !form.message} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button onClick={cancelEdit} variant="ghost" className={textSecondary}>
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <p className={`text-sm ${textSecondary}`}>Loading...</p>
      ) : popups.length === 0 ? (
        <div className={`text-center py-10 rounded-xl border border-dashed ${isDarkMode ? "border-slate-600 text-slate-500" : "border-slate-300 text-slate-400"}`}>
          <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No popups yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {popups.map(popup => (
            <Card key={popup.id} className={`${cardBg} ${popup.is_active ? "ring-2 ring-emerald-400" : ""}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`font-semibold ${textPrimary}`}>{popup.title}</span>
                    <Badge className={TYPE_COLORS[popup.message_type]}>{popup.message_type}</Badge>
                    {popup.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                    )}
                  </div>
                  <p className={`text-sm ${textSecondary} line-clamp-2`}>{popup.message}</p>
                  <p className={`text-xs mt-1 ${textSecondary}`}>
                    Button: "{popup.button_text}" · {popup.show_once_per_session ? "Once per session" : "Every load"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(popup)}
                    title={popup.is_active ? "Deactivate" : "Activate"}
                    className={popup.is_active ? "text-emerald-600 hover:text-emerald-700" : textSecondary}
                  >
                    {popup.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(popup)} className={textSecondary}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deletePopup(popup.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}