'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  Users,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Square,
  Lock,
  Globe,
  Plus,
  ThumbsUp,
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import {
  BrowserSpeechRecognition,
  getSpeechRecognitionConstructor,
} from '@/lib/voice/browserSpeech';

export default function Home() {
  // Current user demo context (switchable between Student 1: Aarav (Mangaluru), Student 2: Riya (Pune), Faculty: Dr. Rao)
  const [currentUser, setCurrentUser] = useState({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Aarav Sharma',
    role: 'student',
    college: 'NIT Karnataka, Mangaluru',
  });

  const [activeTab, setActiveTab] = useState<'ask' | 'feed' | 'projects' | 'leaderboard' | 'pulse'>('ask');
  const [questionText, setQuestionText] = useState('Why does integration by parts work, and how do I know which term to pick as u?');
  const [style, setStyle] = useState<'standard' | 'simpler' | 'analogy' | 'worked_example'>('standard');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<any>(null);
  const [savedQuestionId, setSavedQuestionId] = useState<string | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<string>('open');
  const [isAnonymousPublished, setIsAnonymousPublished] = useState(false);
  const [pointsInfo, setPointsInfo] = useState<any>(null);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardScope, setLeaderboardScope] = useState<'college' | 'national'>('national');
  const [pulseData, setPulseData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const solveInProgressRef = useRef(false);
  const conversationRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // Helper headers for user context
  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-id': currentUser.id,
  };

  // Fetch points & badges
  const loadPoints = async () => {
    try {
      const res = await fetch('/api/me/points', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setPointsInfo(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch feed
  const loadFeed = async () => {
    try {
      const res = await fetch('/api/feed', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setFeedItems(data.feed || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch projects
  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setProjectsList(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch leaderboard
  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?scope=${leaderboardScope}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch faculty pulse
  const loadPulse = async () => {
    try {
      const res = await fetch('/api/pulse?days=7', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setPulseData(data);
      } else {
        const err = await res.json();
        setPulseData({ error: err.error });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPoints();
    if (activeTab === 'feed') loadFeed();
    if (activeTab === 'projects') loadProjects();
    if (activeTab === 'leaderboard') loadLeaderboard();
    if (activeTab === 'pulse') loadPulse();
  }, [currentUser, activeTab, leaderboardScope]);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.abort();
    }

    utteranceRef.current = null;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Voice speech synthesis
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setVoiceMessage('Spoken playback is not supported in this browser. You can read the response above.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.lang = 'en-IN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsSpeaking(false);
        setVoiceMessage('Speech playback stopped or could not be completed.');
      }
    };
    utteranceRef.current = utterance;
    setVoiceMessage(null);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  // Voice input via browser Web Speech API
  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        recognitionRef.current?.abort();
        recognitionRef.current = null;
        setIsListening(false);
      }
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    const Recognition = getSpeechRecognitionConstructor(window);
    if (!Recognition) {
      setVoiceMessage('Voice input is unavailable in this browser. Please type your doubt in the box.');
      return;
    }

    let receivedTranscript = false;
    let recognitionError: string | null = null;
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setVoiceMessage(null);
      setIsListening(true);
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      setIsListening(false);
      if (!receivedTranscript && !recognitionError) {
        setVoiceMessage('No speech was recognized. Please try again or type your doubt.');
      }
    };
    recognition.onerror = (event) => {
      recognitionError = event.error;
      setIsListening(false);
      const errorMessages: Record<string, string> = {
        'not-allowed': 'Microphone access was denied. Allow microphone access or type your doubt.',
        'service-not-allowed': 'Speech recognition is blocked by the browser. Please type your doubt.',
        'no-speech': 'No speech was detected. Please try again or type your doubt.',
        network: 'The browser speech service is unavailable. Please try again or type your doubt.',
        aborted: 'Voice input was interrupted. You can try again or type your doubt.',
      };
      setVoiceMessage(errorMessages[event.error] || 'Voice input failed. Please try again or type your doubt.');
    };
    recognition.onresult = (event) => {
      if (receivedTranscript) return;
      const result = event.results[event.resultIndex];
      const transcript = result?.[0]?.transcript?.trim();
      if (!transcript) {
        setVoiceMessage('No speech was recognized. Please try again or type your doubt.');
        return;
      }
      receivedTranscript = true;
      setQuestionText(transcript);
      setVoiceMessage(null);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceMessage('Could not start voice input. Check microphone access or type your doubt.');
    }
  };

  // 1 & 2. Submit doubt to AI Tutor
  const handleSolve = async (chosenStyle = style) => {
    if (solveInProgressRef.current || !questionText.trim()) return;
    solveInProgressRef.current = true;
    setIsSolving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          style: chosenStyle === 'standard' ? undefined : chosenStyle,
          conversation: conversationRef.current,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate solution.');
      }

      const data = await res.json();
      setSolution(data);
      conversationRef.current = [
        ...conversationRef.current,
        { role: 'user' as const, content: questionText.trim() },
        {
          role: 'assistant' as const,
          content: [
            data.response,
            ...(Array.isArray(data.steps)
              ? data.steps.map((step: any) => `${step.title}: ${step.explanation}`)
              : []),
          ].join('\n').slice(0, 2000),
        },
      ].slice(-6);

      if (!['question', 'learning_request', 'clarification'].includes(data.intent)) {
        setSavedQuestionId(null);
        setIsAnonymousPublished(false);
        setResolutionStatus('open');
        setStatusMessage(null);
        return;
      }

      // Save question as private in DB (+5 points)
      const saveRes = await fetch('/api/questions', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          text: questionText,
          spoken_answer: data.spoken_answer,
          steps: data.steps,
          refresher: data.refresher,
          subject: data.subject,
          concept: data.concept,
          root_cause: data.root_cause,
        }),
      });

      if (saveRes.ok) {
        const saved = await saveRes.json();
        setSavedQuestionId(saved.id);
        setResolutionStatus('open');
        setIsAnonymousPublished(false);
        loadPoints();
        setStatusMessage('Doubt solved & saved privately (+5 points)!');
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      solveInProgressRef.current = false;
      setIsSolving(false);
    }
  };

  // 4. Still stuck - request alternative explanation
  const handleStillStuck = async (altStyle: 'simpler' | 'analogy' | 'worked_example') => {
    setStyle(altStyle);
    if (savedQuestionId) {
      await fetch(`/api/questions/${savedQuestionId}/resolution`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: 'still_stuck' }),
      });
      setResolutionStatus('still_stuck');
    }
    handleSolve(altStyle);
  };

  // 5. Mark as resolved
  const handleMarkResolved = async () => {
    if (!savedQuestionId) return;
    await fetch(`/api/questions/${savedQuestionId}/resolution`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'resolved' }),
    });
    setResolutionStatus('resolved');
    setStatusMessage('Doubt marked as resolved!');
  };

  // 6. Publish doubt anonymously to campus feed (+5 points)
  const handlePublishAnonymous = async () => {
    if (!savedQuestionId) return;
    try {
      const res = await fetch(`/api/questions/${savedQuestionId}/visibility`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ visibility: 'anonymous' }),
      });
      if (res.ok) {
        setIsAnonymousPublished(true);
        loadPoints();
        setStatusMessage('Doubt published anonymously to the campus feed (+5 points)!');
      }
    } catch (e: any) {
      setStatusMessage(e.message);
    }
  };

  // Peer answer submission
  const handleAnswerSubmit = async (questionId: string, answerText: string) => {
    if (!answerText.trim()) return;
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ question_id: questionId, text: answerText }),
      });
      if (res.ok) {
        loadFeed();
        loadPoints();
        setStatusMessage('Answer posted successfully (+10 points)!');
      }
    } catch (e: any) {
      setStatusMessage(e.message);
    }
  };

  // Upvote answer
  const handleVote = async (targetId: string, targetType: 'question' | 'answer') => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ target_type: targetType, target_id: targetId }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Vote recorded (+2 points awarded to author)!');
        loadFeed();
      } else {
        setStatusMessage(`Vote note: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(e.message);
    }
  };

  // Faculty verification
  const handleVerifyAnswer = async (answerId: string) => {
    try {
      const res = await fetch(`/api/answers/${answerId}/verify`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Answer verified with faculty seal (+25 points awarded to author)!');
        loadFeed();
      } else {
        setStatusMessage(`Verification rejected: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Banner & Header */}
      <header className="flex flex-col md:flex-row items-center justify-between border-b pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              TUTO
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Voice-First Tutor
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 italic">
            "Just Tuto it. Ask out loud, without fear."
          </p>
        </div>

        {/* User Persona Switcher & Gamification Pill */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Switch Persona:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const id = e.target.value;
                if (id === '00000000-0000-0000-0000-000000000001') {
                  setCurrentUser({
                    id,
                    name: 'Aarav Sharma',
                    role: 'student',
                    college: 'NIT Karnataka, Mangaluru',
                  });
                } else if (id === '00000000-0000-0000-0000-000000000002') {
                  setCurrentUser({
                    id,
                    name: 'Riya Patel',
                    role: 'student',
                    college: 'COEP Tech University, Pune',
                  });
                } else {
                  setCurrentUser({
                    id,
                    name: 'Dr. Anand Rao',
                    role: 'faculty',
                    college: 'IIT Bombay',
                  });
                }
              }}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
            >
              <option value="00000000-0000-0000-0000-000000000001">Aarav (Student, Mangaluru)</option>
              <option value="00000000-0000-0000-0000-000000000002">Riya (Student, Pune)</option>
              <option value="00000000-0000-0000-0000-000000000003">Dr. Rao (Faculty, IIT Bombay)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-lg shadow-sm">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">
              {pointsInfo?.points ?? 0} pts
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              ({pointsInfo?.points_today ?? 0}/100 today)
            </span>
          </div>
        </div>
      </header>

      {/* Status banner */}
      {statusMessage && (
        <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs font-bold text-emerald-600">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="flex space-x-2 border-b mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('ask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'ask'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Voice Doubt Tutor
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'feed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          Campus Feed (Anonymous)
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'projects'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Cross-College Hub
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'leaderboard'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Leaderboard & Badges
        </button>
        <button
          onClick={() => setActiveTab('pulse')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            activeTab === 'pulse'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Faculty Pulse
        </button>
      </nav>

      {/* TAB 1: VOICE DOUBT TUTOR */}
      {activeTab === 'ask' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-600" />
              Ask Academic Doubt
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              All doubts start strictly <strong>private</strong>. Ask aloud or type without fear of judgment.
            </p>

            <div className="relative">
              <textarea
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setVoiceMessage(null);
                }}
                placeholder="Ask your academic doubt (e.g., calculus, data structures, circuits, or microeconomics)..."
                rows={3}
                className="w-full p-4 pr-24 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 text-sm"
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  disabled={isSolving}
                  className={`p-2 rounded-lg border transition ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={isListening ? 'Stop voice input' : 'Speak your doubt'}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSolve(style)}
                  disabled={isSolving || !questionText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition"
                >
                  {isSolving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Solve
                </button>
              </div>
            </div>
            {voiceMessage && (
              <p role="status" className="mt-2 text-xs text-amber-700">{voiceMessage}</p>
            )}
            {isListening && (
              <p role="status" className="mt-2 text-xs text-emerald-700">Listening… speak your doubt now.</p>
            )}

            {/* Quick Demo Pre-fills */}
            <div className="flex gap-2 mt-3 flex-wrap items-center">
              <span className="text-[11px] font-semibold text-slate-400">Demo doubts:</span>
              <button
                onClick={() => setQuestionText('Why does integration by parts work, and how do I know which term to pick as u?')}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md"
              >
                Calculus: Integration by Parts
              </button>
              <button
                onClick={() => setQuestionText('How does deadlock detection work in operating systems using resource allocation graphs?')}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md"
              >
                OS: Deadlock Detection
              </button>
              <button
                onClick={() => setQuestionText('Why does marginal cost equal marginal revenue at profit maximization in economics?')}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-md"
              >
                Economics: Profit Maximization
              </button>
            </div>
          </div>

          {/* Solution Display */}
          {solution && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              {['greeting', 'acknowledgement', 'unrelated'].includes(solution.intent) ? (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  {solution.topic && (
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                      {solution.topic}
                    </p>
                  )}
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {solution.response}
                  </p>
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(solution.response)}
                    aria-label={isSpeaking ? 'Stop response playback' : 'Play response aloud'}
                    className="mt-3 p-1 rounded bg-emerald-200/50 hover:bg-emerald-200 text-emerald-800"
                    title={isSpeaking ? 'Stop playback' : 'Listen aloud'}
                  >
                    {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <>
              {/* Spoken Answer & Audio */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Spoken Summary
                    </span>
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(solution.spoken_answer)}
                      aria-label={isSpeaking ? 'Stop spoken summary' : 'Play spoken summary'}
                      className="p-1 rounded bg-emerald-200/50 hover:bg-emerald-200 text-emerald-800"
                      title={isSpeaking ? 'Stop playback' : 'Listen aloud'}
                    >
                      {isSpeaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    {isSpeaking && <span role="status" className="text-[10px] text-emerald-700">Speaking…</span>}
                  </div>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">
                    {solution.spoken_answer}
                  </p>
                </div>
              </div>

              {/* Core Innovation: Root Cause & Refresher Card */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Likely Prerequisite Gap (Root Cause)
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {solution.root_cause}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Concept: <strong className="text-slate-700">{solution.concept}</strong> ({solution.subject})
                  </p>
                </div>

                <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl">
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    Foundational Refresher
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1">
                    {solution.refresher}
                  </p>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Step-by-Step Explanation
                </h3>
                <div className="space-y-3">
                  {solution.steps?.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                          {step.step || idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed ml-7 font-mono whitespace-pre-wrap">
                        {step.explanation}
                      </p>
                      {step.equation_or_code && (
                        <div className="mt-2 ml-7 p-2.5 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto">
                          {step.equation_or_code}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              {solution.disclaimer && (
                <p className="text-[11px] text-slate-400 italic">
                  * {solution.disclaimer}
                </p>
              )}

              {/* Post-Explanation Actions: Still Stuck? & Anonymous Publish */}
              <div className="pt-4 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500">Still Stuck? Try:</span>
                  <button
                    disabled={isSolving}
                    onClick={() => handleStillStuck('simpler')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium border"
                  >
                    Simpler Terms
                  </button>
                  <button
                    disabled={isSolving}
                    onClick={() => handleStillStuck('analogy')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium border"
                  >
                    Everyday Analogy
                  </button>
                  <button
                    disabled={isSolving}
                    onClick={() => handleStillStuck('worked_example')}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium border"
                  >
                    Worked Example
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMarkResolved}
                    disabled={isSolving}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold border flex items-center gap-1.5 transition ${
                      resolutionStatus === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    {resolutionStatus === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                  </button>

                  <button
                    onClick={handlePublishAnonymous}
                    disabled={isAnonymousPublished || isSolving}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      isAnonymousPublished
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {isAnonymousPublished ? 'Published to Campus Feed' : 'Publish Anonymously (+5 pts)'}
                  </button>
                </div>
              </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAMPUS FEED (ANONYMOUS) */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Campus Doubt Feed</h2>
              <p className="text-xs text-slate-500">
                Anonymously shared academic doubts from students across colleges. Help peers and earn +10 points.
              </p>
            </div>
            <button
              onClick={loadFeed}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border px-3 py-1.5 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Feed
            </button>
          </div>

          <div className="space-y-4">
            {feedItems.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border text-center text-slate-500">
                <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No public doubts yet.</p>
                <p className="text-xs mt-1">Publish a doubt anonymously from the "Voice Doubt Tutor" tab to see it appear here!</p>
              </div>
            ) : (
              feedItems.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      {item.subject || 'General'} • {item.concept}
                    </span>
                    <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      College: {item.college} (Author identity hidden)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    "{item.text}"
                  </h3>

                  {item.root_cause && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      <strong>Likely Prerequisite Gap:</strong> {item.root_cause}
                    </p>
                  )}

                  {/* Answers Section */}
                  <div className="border-t pt-3 space-y-3">
                    <span className="text-xs font-bold text-slate-600">
                      Peer Answers ({item.answers?.length || 0})
                    </span>

                    {item.answers?.map((ans: any) => (
                      <div key={ans.id} className="p-3 bg-slate-50 rounded-lg border text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            {ans.author?.display_name || 'Student'} ({ans.author?.college})
                            {ans.is_staff_verified && (
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Faculty Verified
                              </span>
                            )}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVote(ans.id, 'answer')}
                              className="text-slate-600 hover:text-emerald-600 flex items-center gap-1 font-semibold"
                              title="Upvote (+2 pts to author)"
                            >
                              <ThumbsUp className="w-3 h-3" /> Upvote
                            </button>

                            {/* Faculty verify button */}
                            {currentUser.role === 'faculty' && !ans.is_staff_verified && (
                              <button
                                onClick={() => handleVerifyAnswer(ans.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                              >
                                Verify as Faculty (+25 pts)
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700">{ans.text}</p>
                      </div>
                    ))}

                    {/* Submit Answer Box */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a clear answer to help this peer..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAnswerSubmit(item.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="flex-1 text-xs p-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousSibling as HTMLInputElement);
                          handleAnswerSubmit(item.id, input.value);
                          input.value = '';
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                      >
                        Answer (+10 pts)
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CROSS-COLLEGE HUB */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cross-College Project Collaboration Hub</h2>
              <p className="text-xs text-slate-500">
                Team up with passionate students from other universities across India.
              </p>
            </div>
            <button
              onClick={async () => {
                const title = prompt('Project Title:');
                if (!title) return;
                const desc = prompt('Project Description:');
                if (!desc) return;
                const tags = prompt('Tags (comma separated):', 'AI, Next.js, Robotics');
                const res = await fetch('/api/projects', {
                  method: 'POST',
                  headers: authHeaders,
                  body: JSON.stringify({
                    title,
                    description: desc,
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                    roles_needed: ['Frontend Dev', 'ML Engineer'],
                  }),
                });
                if (res.ok) {
                  loadProjects();
                  loadPoints();
                  setStatusMessage('Project posted (+15 points)!');
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Post Project (+15 pts)
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {projectsList.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {p.owner?.display_name} • {p.owner?.college}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {p.contributors_count || 0} contributors
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-600 mb-3">{p.description}</p>

                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {p.tags?.map((t: string) => (
                      <span key={t} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-100">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Roles: <span className="font-semibold text-slate-700">{p.roles_needed?.join(', ') || 'Any'}</span>
                  </div>

                  <button
                    onClick={async () => {
                      const message = prompt('Why would you like to contribute?', 'Hi! I am excited to help build this from Pune.');
                      if (message === null) return;
                      const res = await fetch(`/api/projects/${p.id}/request`, {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({ message }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setStatusMessage('Join request sent to project owner!');
                      } else {
                        setStatusMessage(data.error);
                      }
                    }}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    Request to Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LEADERBOARD & BADGES */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Campus & National Leaderboard</h2>
              <p className="text-xs text-slate-500">
                Earn points by asking doubts, publishing anonymously, answering peers, and verifying knowledge.
              </p>
            </div>

            <div className="flex items-center bg-white border rounded-lg p-1 text-xs">
              <button
                onClick={() => setLeaderboardScope('national')}
                className={`px-3 py-1 rounded font-bold transition ${
                  leaderboardScope === 'national' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                National
              </button>
              <button
                onClick={() => setLeaderboardScope('college')}
                className={`px-3 py-1 rounded font-bold transition ${
                  leaderboardScope === 'college' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                }`}
              >
                My College
              </button>
            </div>
          </div>

          {/* User's Badges */}
          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
              Your Earned Badges
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {pointsInfo?.badges?.map((b: any) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    b.unlocked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${b.unlocked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{b.name}</h4>
                    <p className="text-[10px] text-slate-500">{b.description}</p>
                    <span className="text-[9px] font-bold mt-0.5 inline-block text-emerald-700">
                      {b.unlocked ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">College</th>
                  <th className="p-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {leaderboardData.map((u) => (
                  <tr key={u.rank} className={u.is_current_user ? 'bg-emerald-50/60 font-bold' : ''}>
                    <td className="p-3 font-mono font-bold text-slate-900">#{u.rank}</td>
                    <td className="p-3 flex items-center gap-2">
                      {u.display_name}
                      {u.is_current_user && (
                        <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 rounded">You</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">{u.college}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{u.points} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FACULTY PULSE */}
      {activeTab === 'pulse' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Faculty Pulse — Aggregate Concept Signals
            </h2>
            <p className="text-xs text-slate-500">
              Zero student identities or private text exposed. Aggregated signals across courses and colleges.
            </p>
          </div>

          {pulseData?.error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{pulseData.error} (Please switch persona to <strong>Dr. Anand Rao (Faculty)</strong> in the header to view this report).</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Doubts Analyzed</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{pulseData?.total_doubts ?? 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Last {pulseData?.period_days ?? 7} days</p>
                </div>
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Colleges Represented</span>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{pulseData?.colleges_represented ?? 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cross-campus participation</p>
                </div>
                <div className="p-4 bg-white border rounded-xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Silent Doubt Rate</span>
                  <p className="text-2xl font-black text-amber-600 mt-1">{pulseData?.silent_doubt_rate ?? 0}%</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Doubts kept private or still stuck</p>
                </div>
              </div>

              {/* Concept Confusion Clusters */}
              <div className="bg-white p-5 rounded-xl border shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                  Top Concept Confusion Clusters (Minimum cluster threshold: {pulseData?.min_cluster_applied ?? 3})
                </h3>
                <div className="space-y-3">
                  {pulseData?.concepts?.map((c: any) => (
                    <div key={c.concept}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-800">{c.concept}</span>
                        <span className="text-slate-500 font-mono">{c.count} doubts</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, (c.count / (pulseData.total_doubts || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
