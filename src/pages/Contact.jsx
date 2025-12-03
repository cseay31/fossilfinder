import React, { useState } from "react";
import { ContactMessage } from "@/entities/ContactMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      setStatusType("error");
      setStatusMessage("Please fill in all fields.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusType("error");
      setStatusMessage("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    setStatusMessage("");

    try {
      // Save to database - admins will see it in their dashboard
      await ContactMessage.create({
        name,
        email,
        subject,
        message,
        status: "new"
      });

      setStatusType("success");
      setStatusMessage("Your message has been sent successfully! An administrator will review it and get back to you soon.");
      
      // Clear form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setStatusType("error");
      setStatusMessage("Failed to send message. Please try again later.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-stone-800 mb-3">
              Contact Admin
            </h1>
            <p className="text-lg text-stone-600">
              Have a question, suggestion, or need help? Send us a message!
            </p>
          </div>

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

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl text-stone-800 flex items-center gap-3">
                <Mail className="w-6 h-6 text-blue-600" />
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-stone-700 font-medium">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-1 border-stone-200 focus:border-blue-400 focus:ring-blue-400"
                      disabled={isSending}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-stone-700 font-medium">
                      Your Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="mt-1 border-stone-200 focus:border-blue-400 focus:ring-blue-400"
                      disabled={isSending}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-stone-700 font-medium">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                    className="mt-1 border-stone-200 focus:border-blue-400 focus:ring-blue-400"
                    disabled={isSending}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-stone-700 font-medium">
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    className="mt-1 border-stone-200 focus:border-blue-400 focus:ring-blue-400"
                    rows={6}
                    disabled={isSending}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSending ? (
                    <>
                      <Send className="w-5 h-5 mr-2 animate-pulse" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600">
              We typically respond within 24-48 hours. For urgent matters, please mark it clearly in your subject line.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}