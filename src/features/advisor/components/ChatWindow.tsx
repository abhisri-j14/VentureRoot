"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Trash2, Mic } from "lucide-react";
import { MockDisclaimer } from "@/components/ui/mock-disclaimer";
import { EvidenceBadge } from "@/components/evidence/EvidenceBadge";
import { ChatMessage, advisorApi } from "../api/advisorApi";
import { VoiceRecorder } from "@/features/voice/components/VoiceRecorder";

export const ChatWindow = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am your VentureRoot AI Advisor. How can I help you analyze your business feasibility today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      await advisorApi.chat({ message: userMessage.content });
      
      // TODO: BACKEND CONFIRMATION REQUIRED
      // We cannot consume the response yet because ChatResponse is unknown.
      // We must temporarily fall back to the mock response to keep UI working, but the actual POST request is firing!
      const mockResponse: ChatMessage = {
        role: "assistant",
        content: "Based on local market data, competition in the 5km radius appears moderate. The estimated demand supports your proposed capacity.",
        evidence: {
          sources: ["Local competitor data", "Market trend analysis"],
          type: "ESTIMATE",
          confidence: 74,
        },
      };
      setMessages((prev) => [...prev, mockResponse]);
      setIsStreaming(false);
    } catch (error: any) {
      console.warn("Backend request failed or offline. Proceeding with mock advisor response for UI testing.");
      const mockResponse: ChatMessage = {
        role: "assistant",
        content: "Based on local market data, competition in the 5km radius appears moderate. The estimated demand supports your proposed capacity.",
        evidence: {
          sources: ["Local competitor data", "Market trend analysis"],
          type: "ESTIMATE",
          confidence: 74,
        },
      };
      setMessages((prev) => [...prev, mockResponse]);
      setIsStreaming(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversation cleared. How can I assist you?",
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[420px] md:h-[75vh] md:min-h-[550px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1E6702]/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#1E6702]" />
          </div>
          <div>
            <h3 className="font-heading text-[16px] font-semibold text-secondary">AI Business Advisor</h3>
            <p className="font-sans text-[12px] text-secondary-muted">Context-aware assistant</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-secondary-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-4 max-w-[85%] ${
              msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0 mt-1">
              {msg.role === "user" ? (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-secondary-muted" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1E6702] text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content Bubble */}
            <div className="flex flex-col gap-2">
              <div
                className={`p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-slate-100 text-secondary rounded-tl-sm border border-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed">
                  {msg.content}
                </p>
              </div>
              
              {/* Evidence Rendering */}
              {msg.evidence && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[13px] font-semibold text-secondary-muted">Evidence & Confidence</span>
                    <EvidenceBadge
                      type={msg.evidence.type}
                      label={`${msg.evidence.confidence}%`}
                    />
                  </div>
                  {msg.evidence.sources && msg.evidence.sources.length > 0 && (
                    <ul className="list-disc list-inside font-sans text-[12px] text-secondary-muted space-y-1">
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
          <div className="flex gap-4 max-w-[85%] self-start">
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#1E6702] text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-slate-100 text-secondary rounded-2xl rounded-tl-sm border border-slate-200 p-4 flex gap-1 items-center">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {showVoiceRecorder ? (
          <VoiceRecorder
            onTranscriptConfirm={(transcript) => {
              setInput(transcript);
              setShowVoiceRecorder(false);
              // We simulate instant send for voice
              setTimeout(() => {
                document.getElementById("chat-form")?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }, 100);
            }}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        ) : (
          <form
            id="chat-form"
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
          >
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(true)}
              className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex-shrink-0"
              title="Voice Input"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about local feasibility, scheme eligibility, or finance..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-2 font-sans text-[14px] text-secondary outline-none"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2 bg-[#1E6702] text-white rounded-lg hover:bg-[#155201] disabled:opacity-50 disabled:hover:bg-[#1E6702] transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
        <div className="flex justify-center w-full mt-3">
          <MockDisclaimer text="Currently showing mock data • AI Advisory integration pending" />
        </div>
      </div>
    </div>
  );
};
