import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, RefreshCw } from 'lucide-react';

export default function BotChallenge({ onVerify, isDarkMode }) {
  const [challenge, setChallenge] = useState({ question: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  
  const generateChallenge = () => {
    const challenges = [
      { question: 'What is 7 + 5?', answer: '12' },
      { question: 'What is 9 - 3?', answer: '6' },
      { question: 'What is 4 × 3?', answer: '12' },
      { question: 'What is 15 ÷ 5?', answer: '3' },
      { question: 'How many legs does a dog have?', answer: '4' },
      { question: 'What color is the sky? (blue/red/green)', answer: 'blue' },
    ];
    
    setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
    setUserAnswer('');
  };
  
  useEffect(() => {
    generateChallenge();
  }, []);
  
  const handleVerify = () => {
    if (userAnswer.toLowerCase().trim() === challenge.answer.toLowerCase()) {
      onVerify(true);
    } else {
      setAttempts(attempts + 1);
      if (attempts >= 2) {
        onVerify(false); // Failed after 3 attempts
      } else {
        generateChallenge();
      }
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`max-w-md w-full ${isDarkMode ? 'bg-slate-900 border-cyan-500/30' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-amber-700'}`}>
            <Shield className="w-5 h-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-stone-600'}`}>
            Please complete this challenge to verify you're human:
          </p>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-amber-50'}`}>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-stone-800'}`}>
              {challenge.question}
            </p>
          </div>
          
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            placeholder="Your answer"
            className={isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : ''}
          />
          
          {attempts > 0 && (
            <p className="text-sm text-red-500">
              Incorrect answer. {3 - attempts} attempts remaining.
            </p>
          )}
          
          <div className="flex gap-2">
            <Button onClick={handleVerify} className="flex-1">
              Verify
            </Button>
            <Button variant="outline" onClick={generateChallenge}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}