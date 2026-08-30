"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, RefreshCw, Check, X, AlertCircle } from "lucide-react";
import { useTranslation } from "@/features/i18n/hooks/useTranslation";

type VoiceState = "IDLE" | "RECORDING" | "STOPPED" | "PROCESSING" | "ERROR" | "PERMISSION_DENIED";

interface VoiceRecorderProps {
  onTranscriptConfirm: (transcript: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onTranscriptConfirm, onCancel }: VoiceRecorderProps) => {
  const { t } = useTranslation();
  
  const [currentState, setCurrentState] = useState<VoiceState>("IDLE");
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = () => {
    // Check mock permission (browser API simulation)
    // We'll simulate successful permission and recording state
    setCurrentState("RECORDING");
    setTimer(0);
    setTranscript("");
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentState("STOPPED");
    // Mocking an STT result
    setTranscript("This is a mock transcript of your spoken input. You can edit this text before submitting.");
  };

  const confirmTranscript = () => {
    setCurrentState("PROCESSING");
    // Simulate slight processing delay before passing to parent
    setTimeout(() => {
      onTranscriptConfirm(transcript);
    }, 500);
  };

  const retryRecording = () => {
    setTranscript("");
    setCurrentState("IDLE");
  };

  return (
    <div className="w-full bg-white border border-primary/30 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
      
      {currentState === "IDLE" && (
        <div className="flex flex-col items-center justify-center py-6 gap-4">
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all focus:ring-4 focus:ring-primary/20 outline-none"
            title={t("voice.idle" as any)}
          >
            <Mic className="w-8 h-8" />
          </button>
          <span className="text-sm font-medium text-secondary-muted">{t("voice.idle" as any)}</span>
        </div>
      )}

      {currentState === "RECORDING" && (
        <div className="flex flex-col items-center justify-center py-4 gap-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-red-100 rounded-full animate-ping opacity-75" />
            <button
              onClick={stopRecording}
              className="relative w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all focus:ring-4 focus:ring-red-200 outline-none"
              title={t("voice.stop" as any)}
            >
              <Square className="w-6 h-6 fill-current" />
            </button>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-bold text-red-600 animate-pulse">{t("voice.recording" as any)}</span>
            <span className="text-xl font-mono text-secondary">{formatTime(timer)}</span>
          </div>
        </div>
      )}

      {currentState === "STOPPED" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" /> {t("voice.edit" as any)}
            </h4>
            <span className="text-xs font-mono text-secondary-muted bg-slate-100 px-2 rounded-md">{formatTime(timer)}</span>
          </div>
          
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full h-24 p-3 text-sm text-secondary bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder="Transcript will appear here..."
          />
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={retryRecording}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2Icon /> {t("voice.discard" as any)}
              </button>
            </div>
            
            <button
              onClick={confirmTranscript}
              disabled={!transcript.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" /> {t("voice.confirm" as any)}
            </button>
          </div>
        </div>
      )}

      {currentState === "PROCESSING" && (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-secondary-muted">Processing voice input...</span>
        </div>
      )}

      {currentState === "ERROR" && (
        <div className="flex flex-col items-center justify-center py-6 gap-3 text-red-600">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm font-medium">{errorMsg || t("voice.error" as any)}</span>
          <button
            onClick={retryRecording}
            className="mt-2 px-4 py-1.5 text-sm font-medium bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {currentState === "PERMISSION_DENIED" && (
        <div className="flex flex-col items-center justify-center py-6 gap-3 text-orange-600">
          <AlertCircle className="w-8 h-8" />
          <span className="text-sm font-medium">{t("voice.permission" as any)}</span>
          <button
            onClick={onCancel}
            className="mt-2 px-4 py-1.5 text-sm font-medium bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

const Trash2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);
