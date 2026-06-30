import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { 
  PiChatCircleDotsBold, 
  PiXBold, 
  PiPaperPlaneRightBold, 
  PiMicrophoneBold, 
  PiSpeakerHighBold, 
  PiDownloadSimpleBold, 
  PiUserBold, 
  PiRobotBold,
  PiMicrophoneSlashBold,
  PiWaveformBold
} from "react-icons/pi";
import useAuth from "../../hooks/useAuth";
import useAxios from "../../hooks/useAxios";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { toast } from "react-toastify";
import { MODEL_NAME } from "../../constants";


const StudyBuddyChatbot = () => {
  const { user } = useAuth();
  const axiosPublic = useAxios();
  const axiosSecure = useAxiosSecure();
  const { pathname } = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("tutor"); // 'tutor' | 'examiner' | 'assistant'
  const [conversations, setConversations] = useState({
    tutor: [],
    examiner: [],
    assistant: []
  });
  const [inputText, setInputText] = useState("");
  
  const { data: chatbotData } = useQuery({
    queryKey: ['chatbot-settings'],
    queryFn: async () => {
      const res = await axiosPublic.get("/chatbot/settings");
      return res.data.settings;
    }
  });

  const isActive = chatbotData ? chatbotData.isActive : false;
  const welcomeMessage = chatbotData ? chatbotData.welcomeMessage : "Hello! I'm your MOCKEA IELTS Tutor & Support Assistant. How can I help you today?";
  
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
  const [lastActivityTime, setLastActivityTime] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check if current page is in exam mode
  const isExamMode = 
    pathname.startsWith("/test/") || 
    pathname.startsWith("/tests/") || 
    ["/dashboard/listening", "/dashboard/reading", "/dashboard/writing", "/dashboard/speaking"].includes(pathname);

  // Cancel any active TTS speech synthesis when entering exam mode
  useEffect(() => {
    if (isExamMode) {
      window.speechSynthesis.cancel();
    }
  }, [isExamMode]);

  // Set default welcome message when chatbot opens or mode changes (if history is empty)
  useEffect(() => {
    if (welcomeMessage) {
      setConversations((prev) => {
        if (prev[mode] && prev[mode].length > 0) return prev;

        let greetText = welcomeMessage;
        if (mode === "examiner") {
          greetText = "Welcome to the IELTS Examination Simulator. I am your strict IELTS Examiner. Let's begin the interview. Are you ready for your speaking cue card topic?";
        } else if (mode === "assistant") {
          greetText = "Hello! I am your MOCKEA Site Assistant. Ask me anything about our Practice Labs, Full Mock Test integrity, fullscreen locks, scoring, or pricing plans!";
        }

        return {
          ...prev,
          [mode]: [
            {
              role: "assistant",
              content: greetText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      });
    }
  }, [mode, welcomeMessage]);

  // Check for inactivity timeout (15 minutes) when widget opens
  useEffect(() => {
    if (isOpen) {
      if (lastActivityTime) {
        const elapsed = Date.now() - lastActivityTime;
        const fifteenMinutes = 15 * 60 * 1000;
        if (elapsed > fifteenMinutes) {
          setConversations({
            tutor: [],
            examiner: [],
            assistant: []
          });
          toast.info("Session reset due to inactivity.");
        }
      }
      setLastActivityTime(Date.now());
    }
  }, [isOpen]);

  const messages = conversations[mode] || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Web Speech synthesis (Text-to-Speech)
  const speakText = (text, index) => {
    if ("speechSynthesis" in window) {
      if (speakingMsgIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingMsgIndex(null);
        return;
      }
      window.speechSynthesis.cancel(); // Stop any currently playing speech

      const cleanText = text.replace(/[*#_`]/g, ""); // Remove markdown characters
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Try to load a natural English voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.lang.includes("en-GB") || v.lang.includes("en-US")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.rate = 0.95; // Pedigogical pacing

      utterance.onend = () => {
        setSpeakingMsgIndex(null);
      };

      utterance.onerror = () => {
        setSpeakingMsgIndex(null);
      };

      setSpeakingMsgIndex(index);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-Speech voice synthesis is not supported on this browser.");
    }
  };

  // Web Speech recognition (Speech-to-Text)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported on your browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToTextResult = event.results[0][0].transcript;
      setInputText((prev) => (prev ? prev + " " + speechToTextResult : speechToTextResult));
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Exporter to download dialogues review sheet
  const exportChatSession = () => {
    if (messages.length <= 1) {
      toast.warning("Cannot export an empty chat history.");
      return;
    }

    let markdown = `# MOCKEA IELTS Chatbot & Study Buddy Review Sheet\n`;
    markdown += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    markdown += `User Plan: ${user ? (user.plan || "free").toUpperCase() : "GUEST"}\n`;
    markdown += `Tutor Mode: ${mode.toUpperCase()}\n`;
    markdown += `========================================================================\n\n`;

    messages.forEach((msg) => {
      const roleName = msg.role === "user" ? (user?.displayName || "Student") : "AI Tutor";
      markdown += `[${msg.timestamp}] ${roleName}:\n${msg.content}\n\n`;
    });

    markdown += `========================================================================\n`;
    markdown += `Study Tip: Review grammar feedback or try speaking exercises again to boost your score!`;

    const blob = new Blob([markdown], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mockea_study_session_${mode}_${new Date().toISOString().split("T")[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Study session exported successfully!");
  };

  // Send message to backend controller
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Stop current speech playback if active
    if (speakingMsgIndex !== null) {
      window.speechSynthesis.cancel();
      setSpeakingMsgIndex(null);
    }

    const studentMessage = {
      role: "user",
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversations((prev) => ({
      ...prev,
      [mode]: [...(prev[mode] || []), studentMessage]
    }));
    setLastActivityTime(Date.now());
    setInputText("");
    setIsLoading(true);

    try {
      const activeMessages = [...messages, studentMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Route through secure endpoint if user is logged in, else public guest endpoint
      const axiosClient = user ? axiosSecure : axiosPublic;
      const res = await axiosClient.post("/chatbot/chat", {
        messages: activeMessages,
        mode
      });

      if (res.data?.success) {
        setConversations((prev) => ({
          ...prev,
          [mode]: [
            ...(prev[mode] || []),
            {
              role: "assistant",
              content: res.data.response,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }));
        setLastActivityTime(Date.now());
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to communicate with your AI Tutor. Please try again.";
      setConversations((prev) => ({
        ...prev,
        [mode]: [
          ...(prev[mode] || []),
          {
            role: "assistant",
            content: `⚠️ Error: ${errorMsg}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
      setLastActivityTime(Date.now());
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive || isExamMode) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-circle btn-lg shadow-2xl hover:scale-110 transition-transform flex items-center justify-center bg-linear-to-tr from-primary to-secondary border-none text-white h-14 w-14"
          title="Open AI IELTS Tutor"
        >
          <PiChatCircleDotsBold className="text-3xl" />
        </button>
      )}

      {/* Main Glassmorphic Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] bg-white/85 dark:bg-slate-900/85 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="bg-linear-to-r from-primary to-secondary p-4 text-white flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎓</span>
                <div>
                  <h3 className="font-bold text-base leading-none">MOCKEA AI Study Buddy</h3>
                  <span className="text-[10px] text-white/70">Powered by {MODEL_NAME}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={exportChatSession}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Export dialogue transcripts"
                >
                  <PiDownloadSimpleBold className="text-xl" />
                </button>
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    setSpeakingMsgIndex(null);
                    setIsOpen(false);
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
                  title="Close panel"
                >
                  <PiXBold className="text-xl" />
                </button>
              </div>
            </div>

            {/* Persona Tabs Selection */}
            <div className="grid grid-cols-3 gap-1 bg-black/15 p-1 rounded-xl text-xs">
              <button
                onClick={() => setMode("tutor")}
                className={`py-1 rounded-lg text-center font-medium transition-all ${
                  mode === "tutor" ? "bg-white text-primary shadow-sm" : "hover:bg-white/10 text-white"
                }`}
              >
                IELTS Tutor
              </button>
              <button
                onClick={() => setMode("examiner")}
                className={`py-1 rounded-lg text-center font-medium transition-all ${
                  mode === "examiner" ? "bg-white text-primary shadow-sm" : "hover:bg-white/10 text-white"
                }`}
              >
                Examiner
              </button>
              <button
                onClick={() => setMode("assistant")}
                className={`py-1 rounded-lg text-center font-medium transition-all ${
                  mode === "assistant" ? "bg-white text-primary shadow-sm" : "hover:bg-white/10 text-white"
                }`}
              >
                Site Guide
              </button>
            </div>
          </div>

          {/* Conversation messages feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar icons */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    : "bg-primary/10 text-primary"
                }`}>
                  {msg.role === "user" ? <PiUserBold /> : <PiRobotBold />}
                </div>

                {/* Dialog Bubble */}
                <div className="max-w-[75%] flex flex-col space-y-1">
                  <div className={`rounded-2xl p-3 text-sm shadow-xs ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-line"
                  }`}>
                    {msg.content}
                    
                    {/* TTS Button on AI Message bubbles */}
                    {msg.role === "assistant" && !msg.content.startsWith("⚠️ Error:") && (
                      <div className="flex justify-end mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/50">
                        <button
                          onClick={() => speakText(msg.content, index)}
                          className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${
                            speakingMsgIndex === index
                              ? "text-green-500 hover:text-green-600 font-bold"
                              : "text-slate-400 hover:text-primary dark:text-slate-500"
                          }`}
                          title={speakingMsgIndex === index ? "Stop audio" : "Hear audio"}
                        >
                          <PiSpeakerHighBold className="text-sm" />
                          <span>{speakingMsgIndex === index ? "Speaking..." : "Listen"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] text-slate-400 dark:text-slate-500 px-1 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <PiRobotBold />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-3 shadow-xs">
                  <span className="loading loading-dots loading-sm text-primary"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Speech to text indicator */}
          {isListening && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 border-t border-green-500/20 px-4 py-2 text-xs flex items-center justify-between shrink-0 font-medium">
              <div className="flex items-center space-x-1.5 animate-pulse">
                <PiWaveformBold className="text-base" />
                <span>Listening... speak English to transcribe.</span>
              </div>
              <button 
                onClick={toggleSpeechRecognition}
                className="text-[10px] uppercase font-bold underline text-green-700 dark:text-green-300 hover:no-underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Chat entry panel */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`btn btn-circle btn-sm ${
                isListening 
                  ? "bg-green-500 hover:bg-green-600 border-none text-white animate-pulse" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none"
              }`}
              title={isListening ? "Stop transcribing" : "Speak (Speech-to-Text)"}
            >
              {isListening ? <PiMicrophoneSlashBold className="text-base" /> : <PiMicrophoneBold className="text-base" />}
            </button>
            
            <input
              type="text"
              placeholder={isListening ? "Go ahead, speak..." : "Type a message..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading || isListening}
              className="input input-bordered input-sm flex-1 focus:input-primary rounded-xl"
            />
            
            <button
              type="submit"
              disabled={isLoading || !inputText.trim() || isListening}
              className="btn btn-primary btn-circle btn-sm text-white bg-linear-to-tr from-primary to-secondary border-none"
            >
              <PiPaperPlaneRightBold className="text-sm" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudyBuddyChatbot;
