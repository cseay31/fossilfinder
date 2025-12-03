
import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Shield, UserCheck, Calendar, Ban, AlertTriangle, MessageSquare } from 'lucide-react';
import { format } from "date-fns";
import { motion, AnimatePresence } from 'framer-motion';
import ModerationModal from '../admin/ModerationModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModerationModal, setShowModerationModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await base44.entities.User.list("-created_date");
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModerateUser = (user) => {
    setSelectedUser(user);
    setShowModerationModal(true);
  };

  const handleModerationComplete = () => {
    setShowModerationModal(false);
    setSelectedUser(null);
    loadUsers();
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              User Management
              <Badge variant="outline" className="ml-auto">
                {users.length} users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-lg p-4 transition-colors duration-200 ${
                      user.is_banned
                        ? 'bg-red-50 border-2 border-red-200'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.is_banned
                            ? 'bg-gradient-to-br from-red-500 to-red-600'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        }`}>
                          {user.is_banned ? (
                            <Ban className="w-6 h-6 text-white" />
                          ) : (
                            <UserCheck className="w-6 h-6 text-white" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-800">
                              {user.full_name || 'Name not provided'}
                            </h3>
                            {user.is_banned && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                <Ban className="w-3 h-3 mr-1" />
                                Banned
                              </Badge>
                            )}
                            {!user.is_banned && user.warning_count > 0 && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {user.warning_count} Warning{user.warning_count > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            Joined {format(new Date(user.created_date), "MMM d, yyyy")}
                          </div>
                          {user.is_banned && user.ban_reason && (
                            <div className="mt-2 text-sm text-red-700">
                              <strong>Ban Reason:</strong> {user.ban_reason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          className={user.role === 'admin'
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-green-100 text-green-800 border-green-200"
                          }
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User'}
                        </Badge>

                        <Button
                          size="sm"
                          variant={user.is_banned ? "default" : "outline"}
                          onClick={() => handleModerateUser(user)}
                          className={user.is_banned ? "bg-green-600 hover:bg-green-700" : "border-slate-300"}
                        >
                          {user.is_banned ? (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Unban
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Moderate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!isLoading && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No users found
                </h3>
                <p className="text-slate-500">
                  {searchTerm ? "Try adjusting your search terms." : "No users have registered yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Moderation Modal */}
      <AnimatePresence>
        {showModerationModal && selectedUser && (
          <ModerationModal
            user={selectedUser}
            onClose={() => setShowModerationModal(false)}
            onComplete={handleModerationComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}
