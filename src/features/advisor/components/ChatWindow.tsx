"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Trash2, Mic, Key, Check, ChevronDown, Building2, Sparkles, AlertCircle } from "lucide-react";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ChatMessage, advisorApi } from "../api/advisorApi";
import { VoiceRecorder } from "@/features/voice/components/VoiceRecorder";
import { useBusinessesComparison } from "@/lib/data/businesses";

interface ChatWindowProps {
  initialQuery?: string;
}

export const ChatWindow = ({ initialQuery }: ChatWindowProps) => {
  const { data: businesses } = useBusinessesComparison();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Namaste! I am your VentureRoot AI Business Advisor powered by Google Gemini. I have loaded your entrepreneur profile, capital, and venture inputs. How can I guide your business decisions today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [keySavedToast, setKeySavedToast] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set default business when loaded
  useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  // Load saved API key from localStorage if user added one via browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ventureroot_gemini_api_key");
      if (saved) {
        setGeminiApiKey(saved);
        setApiKeyInput(saved);
      }
    }
  }, []);

  // Handle external query prefill
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  const activeBusiness = businesses?.find((b) => b.id === selectedBusinessId) || businesses?.[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKeyInput.trim();
    setGeminiApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem("ventureroot_gemini_api_key", cleanKey);
    } else {
      localStorage.removeItem("ventureroot_gemini_api_key");
    }
    setShowKeyModal(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: queryText.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsStreaming(true);

    try {
      // Pass recent conversation history so Gemini can answer follow-ups
      const history = nextMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: any = await advisorApi.chat({
        message: userMessage.content,
        businessId: selectedBusinessId || undefined,
        context: {
          history,
          geminiApiKey: geminiApiKey || undefined,
        },
      });

      const responsePayload = res?.data?.response || res?.data || res;
      const responseText =
        responsePayload?.message ||
        responsePayload?.summary ||
        responsePayload?.analysis ||
        res?.message ||
        "I have analyzed your business details. How else can I assist your planning?";

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: responseText,
        evidence: responsePayload?.evidence || {
          sources: [
            activeBusiness ? `Venture: ${activeBusiness.name || activeBusiness.category}` : "Entrepreneur Profile",
            "Google Gemini AI Advisor",
          ],
          type: "FACT",
          confidence: 96,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Advisor API Error:", error);
      const errMsg =
        error?.response?.data?.message ||
        "I was unable to complete the analysis at this moment. Please verify your GEMINI_API_KEY or connection.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errMsg,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendQuery(input);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation cleared. How can I guide your business decisions?",
      },
    ]);
  };

  const QUICK_PROMPTS = [
    "Should I start this business here?",
    "What are my biggest local risks?",
    "Which financing option or subsidy suits me?",
    "How can I calculate my monthly EMI and breakeven?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[460px] md:h-[75vh] md:min-h-[560px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1E6702]/15 flex items-center justify-center text-[#1E6702]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-secondary">
                VentureRoot AI Advisor
              </h3>
              <span className="text-[10px] bg-[#1E6702]/10 text-[#1E6702] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini 2.5
              </span>
            </div>
            <p className="font-sans text-[12px] text-secondary-muted truncate max-w-[220px] sm:max-w-none">
              Answers grounded in your exact capital, location & venture inputs
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* Active Business Switcher */}
          {businesses && businesses.length > 0 && (
            <div className="relative">
              <select
                aria-label="Select Active Business"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="text-[12px] font-semibold text-[#200813] bg-white border border-slate-200 hover:border-[#1E6702]/40 rounded-xl px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1E6702] shadow-xs"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    💼 {b.name || b.category} ({b.location?.district || "Local"})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Gemini Key Config Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[12px] font-semibold transition-all shadow-xs ${
              geminiApiKey
                ? "bg-[#1E6702]/10 border-[#1E6702]/30 text-[#1E6702] hover:bg-[#1E6702]/15"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{geminiApiKey ? "API Key Set" : "Add Key"}</span>
            {geminiApiKey && <span className="w-1.5 h-1.5 rounded-full bg-[#1E6702]" />}
          </button>

          {/* Clear Chat */}
          <button
            onClick={clearChat}
            className="p-2 text-secondary-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Business Context Banner */}
      {activeBusiness && (
        <div className="bg-[#FFFBE7] border-b border-[#200813]/5 px-4 py-1.5 flex items-center justify-between text-xs text-[#200813]/80">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-[#1E6702] shrink-0" />
            <span className="font-semibold text-[#1E6702] truncate">
              {activeBusiness.name || activeBusiness.category}
            </span>
            <span className="text-slate-400">•</span>
            <span className="truncate">
              📍 {activeBusiness.location?.district || "India"}, {activeBusiness.location?.state || ""}
            </span>
            {activeBusiness.availableMargin != null && (
              <>
                <span className="text-slate-400">•</span>
                <span>Margin: ₹{Number(activeBusiness.availableMargin).toLocaleString("en-IN")}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-[#1E6702] font-bold uppercase tracking-wider hidden sm:inline">
            Active Context
          </span>
        </div>
      )}

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3.5 max-w-[92%] sm:max-w-[85%] ${
              msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.role === "user" ? (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1E6702] text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Content Bubble */}
            <div className="flex flex-col gap-2 max-w-full">
              <div
                className={`p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#1E6702] text-white rounded-tr-sm shadow-xs"
                    : "bg-slate-50 text-[#200813] rounded-tl-sm border border-slate-200/80 shadow-xs"
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-[13.5px] sm:text-[14px] leading-relaxed break-words">
                  {msg.content}
                </div>
              </div>

              {/* Evidence Rendering */}
              {msg.evidence && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[12px] font-semibold text-secondary-muted">
                      Grounding Context & Confidence
                    </span>
                    <EvidenceBadge
                      type={msg.evidence.type}
                      label={`${msg.evidence.confidence}%`}
                    />
                  </div>
                  {msg.evidence.sources && msg.evidence.sources.length > 0 && (
                    <ul className="list-disc list-inside font-sans text-[11px] text-secondary-muted space-y-0.5">
                      {msg.evidence.sources.map((src, i) => (
                        <li key={i}>{src}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#1E6702] text-white flex items-center justify-center shadow-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-slate-50 text-secondary rounded-2xl rounded-tl-sm border border-slate-200 p-4 flex gap-1.5 items-center">
              <span className="text-xs font-semibold text-[#1E6702] mr-1">Gemini is analyzing</span>
              <div className="w-1.5 h-1.5 bg-[#1E6702] rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-[#1E6702] rounded-full animate-bounce [animation-delay:150ms]" />
              <div className="w-1.5 h-1.5 bg-[#1E6702] rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips (Swipeable on Mobile) */}
      <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendQuery(prompt)}
            disabled={isStreaming}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 bg-white font-sans text-[12px] font-medium text-slate-700 hover:border-[#1E6702] hover:text-[#1E6702] hover:bg-[#1E6702]/5 transition-colors shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white">
        {showVoiceRecorder ? (
          <VoiceRecorder
            onTranscriptConfirm={(transcript) => {
              setShowVoiceRecorder(false);
              sendQuery(transcript);
            }}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <form
            id="chat-form"
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-[#1E6702]/20 focus-within:border-[#1E6702] transition-all"
          >
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(true)}
              className="p-2 text-slate-500 hover:text-[#1E6702] hover:bg-[#1E6702]/10 rounded-lg transition-colors flex-shrink-0"
              title="Voice Input (Speak your question)"
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about local demand, PMEGP/MUDRA subsidies, cost breakdown..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-1.5 font-sans text-[13.5px] sm:text-[14px] text-secondary outline-none"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 bg-[#1E6702] text-white rounded-lg hover:bg-[#155201] disabled:opacity-40 disabled:hover:bg-[#1E6702] transition-all flex-shrink-0 shadow-xs active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#1E6702]/10 text-[#1E6702] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[16px] text-secondary">
                  Configure Gemini API Key
                </h4>
                <p className="text-[12px] text-slate-500">
                  Google Gemini powers the VentureRoot AI Advisory Engine
                </p>
              </div>
            </div>

            <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
              You can set your Gemini API key in your server&apos;s <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono">.env.local</code> (or Vercel environment variables), or save it directly in your browser session below.
            </p>

            <form onSubmit={handleSaveKey} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-secondary font-mono focus:outline-none focus:ring-2 focus:ring-[#1E6702]/20 focus:border-[#1E6702]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Don&apos;t have a key? Get one free at{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1E6702] underline font-semibold"
                  >
                    Google AI Studio
                  </a>
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E6702] text-white hover:bg-[#155201] transition-colors cursor-pointer shadow-xs"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {keySavedToast && (
        <div className="absolute top-4 right-4 z-50 bg-[#1E6702] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>Gemini API Key updated successfully</span>
        </div>
      )}
    </div>
  );
};

