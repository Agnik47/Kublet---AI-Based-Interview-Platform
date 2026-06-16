"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Activity,
  Play
} from "lucide-react";
import BolnaWebCalling from "@/bolna-webcall-library";

export default function InterviewRoomPage() {
  const router = useRouter();
  
  // State variables
  const [sessionConfig, setSessionConfig] = useState(null);
  const [callState, setCallState] = useState("ready"); // ready | connecting | active | completed
  const [agentConnected, setAgentConnected] = useState(false);
  const [micStatus, setMicStatus] = useState("idle"); // idle | checking | granted | denied
  const [activeStage, setActiveStage] = useState("intro"); // intro | projects | technical | behavioral | ended
  const [error, setError] = useState(null);

  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // disconnected | connecting | connected
  const [socketOpen, setSocketOpen] = useState(false);
  const [socketClosed, setSocketClosed] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [audioOutputActive, setAudioOutputActive] = useState(false);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  
  const bolnaClientRef = useRef(null);

  // Initialize and load session config
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem("bolnaSessionConfig");
      if (!storedConfig) {
        setError("No active interview blueprint session found. Please generate a blueprint first.");
        return;
      }
      setSessionConfig(JSON.parse(storedConfig));
    } catch (err) {
      console.error("Failed to load session configuration:", err);
      setError("Failed to load interview session details. Please try again.");
    }

    // Teardown call on unmount
    return () => {
      if (bolnaClientRef.current) {
        try {
          bolnaClientRef.current.endWebCall();
        } catch (e) {
          console.error("Error ending call on cleanup:", e);
        }
      }
    };
  }, []);

  // Update active interview stage periodically or dynamically (simulated or inferred by timeline)
  useEffect(() => {
    if (callState !== "active") return;

    // Simulate active stages based on elapsed time or default to progressive stage updates
    // In a real application, Bolna would send events, but for Features 1-6 we display the stages clearly.
    const stages = ["intro", "projects", "technical", "behavioral"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < stages.length) {
        setActiveStage(stages[currentIndex]);
      } else {
        clearInterval(interval);
      }
    }, 45000); // Progress stages every 45 seconds to guide the interviewee

    return () => clearInterval(interval);
  }, [callState]);

  // Main Call Activation Handler
  const handleStartCall = () => {
    if (!sessionConfig || callState === "connecting" || callState === "active") return;

    setError(null);
    setCallState("connecting");
    setConnectionStatus("connecting");
    setMicStatus("checking");
    setSocketOpen(false);
    setSocketClosed(false);
    setMicActive(false);
    setAudioOutputActive(false);
    setLastMessageTimestamp(null);

    try {
      // Configure Bolna client
      const config = {
        agentId: sessionConfig.agentId,
        accessToken: "dummy-token", // Exchanged/hidden on proxy server
        websocketHost: sessionConfig.websocketHost, // Points to local proxy
        contextData: sessionConfig.contextData,
        
        onCallStateChange: (isActive) => {
          if (isActive) {
            setCallState("active");
          } else {
            setCallState("completed");
            setConnectionStatus("disconnected");
            setSocketOpen(false);
            setSocketClosed(true);
            setMicActive(false);
            setAudioOutputActive(false);
            setAgentConnected(false);
          }
        },
        
        onFirstAudioPacket: () => {
          setAgentConnected(true);
        },
        
        onMediaPermissionGranted: () => {
          setMicStatus("granted");
        },

        onConnected: () => {
          setConnectionStatus("connected");
        },

        onSocketOpen: () => {
          setSocketOpen(true);
          setSocketClosed(false);
        },

        onSocketClose: () => {
          setSocketOpen(false);
          setSocketClosed(true);
        },

        onMicActive: (isActive) => {
          setMicActive(isActive);
        },

        onAudioOutputActive: (isActive) => {
          setAudioOutputActive(isActive);
        },

        onMessageReceived: (timestamp) => {
          setLastMessageTimestamp(timestamp);
        },
        
        onError: (errorType, errorObj) => {
          console.error("Bolna Client Error:", errorType, errorObj);
          
          if (errorType === "websocket_error") {
            setError(
              "Unable to connect to Bolna Voice Service. Please verify that the proxy is running."
            );
            setCallState("ready");
            setConnectionStatus("disconnected");
            setSocketOpen(false);
            setSocketClosed(true);
            setAgentConnected(false);
          } else if (errorType === "audio_decoding_error") {
            console.warn("Transient audio decoding error:", errorObj);
            // Log warning but do not crash the call session or reset state.
          } else if (errorType === "microphone_access_error" || errorObj?.message?.includes("Permission")) {
            setMicStatus("denied");
            setError("Microphone permission was denied. Please allow microphone access to proceed.");
            setCallState("ready");
            setConnectionStatus("disconnected");
            setMicActive(false);
          } else {
            setError(`An unexpected error occurred: ${errorType}`);
            setCallState("ready");
            setConnectionStatus("disconnected");
          }
        }
      };

      // Initialize the web call client
      const client = new BolnaWebCalling(config);
      bolnaClientRef.current = client;
      
      client.initiateWebCall();
    } catch (err) {
      console.error("Failed to initialize Bolna client:", err);
      setError("Unable to launch the AI voice client. Please make sure the proxy server is running.");
      setCallState("ready");
    }
  };

  // Main Call Ending Handler
  const handleEndCall = () => {
    if (bolnaClientRef.current) {
      try {
        bolnaClientRef.current.endWebCall();
      } catch (e) {
        console.error("Error during manual hangup:", e);
      }
    }
    setCallState("completed");
    setConnectionStatus("disconnected");
    setSocketOpen(false);
    setSocketClosed(true);
    setMicActive(false);
    setAudioOutputActive(false);
    setAgentConnected(false);
    setActiveStage("ended");
    router.push("/kublet-ai");
  };

  const handleBackToDashboard = () => {
    router.push("/kublet-ai");
  };

  return (
    <main className="w-full min-h-screen bg-black text-stone-100 flex flex-col justify-between py-12 px-4 md:px-8">
      {/* Title Tag / Page Meta details for SEO */}
      <title>Kublet AI - Real-time Voice Mock Interview</title>
      
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        <button
          onClick={handleBackToDashboard}
          id="btn-back-dashboard"
          className="flex items-center gap-2 text-sm text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Exit Interview Room</span>
        </button>
        <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-stone-900 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping motion-reduce:animate-none" />
          <span className="text-stone-300">Live AI Room</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-8">
        
        {/* Left Side: Call Controller Panel */}
        <section className="md:col-span-2 space-y-6">
          <Card className="bg-[#0f0f11] border border-white/10 p-6 relative overflow-hidden">
            {callState === "active" && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse motion-reduce:animate-none" />
            )}
            
            <CardHeader className="p-0 pb-6">
              <h1 className="text-2xl md:text-3xl font-serif font-semibold text-stone-100 flex items-center gap-3">
                Kublet AI Interview
              </h1>
              <CardDescription className="text-sm text-stone-400 mt-1">
                A conversational Voice AI agent trained to conduct custom developer mock interviews.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 space-y-8 flex flex-col items-center justify-center py-8">
              {/* Pulse Animation Indicator */}
              <div className="relative flex items-center justify-center">
                {/* Outward waves */}
                {callState === "active" && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full border border-emerald-400/20 bg-emerald-400/5 animate-ping duration-1000 motion-reduce:animate-none" />
                    <div className="absolute w-48 h-48 rounded-full border border-emerald-400/10 bg-emerald-400/2 animate-ping duration-2000 motion-reduce:animate-none" />
                  </>
                )}
                
                <div
                  className={`w-28 h-28 rounded-full flex items-center justify-center border transition-all duration-500 ${
                    callState === "active"
                      ? "bg-emerald-500/10 border-emerald-400 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
                      : callState === "connecting"
                      ? "bg-amber-500/10 border-amber-400 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse motion-reduce:animate-none"
                      : "bg-white/2 border-white/10 text-stone-400"
                  }`}
                >
                  {callState === "active" ? (
                    <Activity size={36} className="animate-pulse motion-reduce:animate-none" />
                  ) : callState === "connecting" ? (
                    <Loader2 size={36} className="animate-spin motion-reduce:animate-none" />
                  ) : (
                    <PhoneCall size={36} />
                  )}
                </div>
              </div>

              {/* Status Display Grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md border-t border-white/5 pt-6 text-sm">
                <div className="flex flex-col gap-1 text-center p-3 rounded-lg bg-stone-900/40 border border-white/5">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">Connection</span>
                  <span className={`font-semibold ${
                    connectionStatus === "connected" ? "text-emerald-400" : connectionStatus === "connecting" ? "text-amber-400" : "text-stone-400"
                  }`}>
                    {connectionStatus === "connected"
                      ? "Connected"
                      : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Disconnected"}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 text-center p-3 rounded-lg bg-stone-900/40 border border-white/5">
                  <span className="text-xs text-stone-500 uppercase tracking-wider font-mono">Microphone</span>
                  <span className={`font-semibold ${
                    micStatus === "granted" ? "text-emerald-400" : micStatus === "denied" ? "text-red-400" : "text-stone-400"
                  }`}>
                    {micStatus === "granted"
                      ? "Active"
                      : micStatus === "checking"
                      ? "Authorizing..."
                      : micStatus === "denied"
                      ? "Permission Denied"
                      : "Muted / Inactive"}
                  </span>
                </div>
              </div>

              {/* Call Controls */}
              <div className="w-full max-w-md pt-4">
                {callState === "ready" || callState === "completed" ? (
                  <Button
                    onClick={handleStartCall}
                    disabled={!sessionConfig}
                    id="btn-start-call"
                    variant="gold"
                    className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-black border-none cursor-pointer"
                  >
                    <Play size={16} />
                    Start Conversation
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndCall}
                    id="btn-end-call"
                    variant="destructive"
                    className="w-full py-6 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer bg-red-600 hover:bg-red-700 border-none"
                  >
                    <PhoneOff size={16} />
                    End Interview
                  </Button>
                )}
              </div>

              {/* Secure Error Alert */}
              {error && (
                <div className="w-full max-w-md flex items-start gap-2.5 p-4 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs text-left">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Connection Failed</p>
                    <p className="leading-relaxed opacity-90">{error}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Health Panel */}
          <Card className="bg-[#0f0f11] border border-white/10 p-6">
            <CardHeader className="p-0 pb-4 border-b border-white/5">
              <CardTitle className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <Activity size={18} className="text-amber-400" />
                Connection Health Panel
              </CardTitle>
              <CardDescription className="text-xs text-stone-400 mt-1">
                Real-time diagnostic metrics for the voice interview session.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
                {/* Socket Open */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/40 border border-white/5">
                  <span className="text-stone-400 text-xs">Socket Open</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${socketOpen ? "bg-emerald-500 animate-pulse motion-reduce:animate-none" : "bg-stone-600"}`} />
                    <span className={socketOpen ? "text-emerald-400 font-semibold" : "text-stone-500"}>
                      {socketOpen ? "True" : "False"}
                    </span>
                  </div>
                </div>

                {/* Socket Closed */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/40 border border-white/5">
                  <span className="text-stone-400 text-xs">Socket Closed</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${socketClosed ? "bg-red-500" : "bg-stone-600"}`} />
                    <span className={socketClosed ? "text-red-400 font-semibold" : "text-stone-500"}>
                      {socketClosed ? "True" : "False"}
                    </span>
                  </div>
                </div>

                {/* Mic Active */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/40 border border-white/5">
                  <span className="text-stone-400 text-xs">Mic Active</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${micActive ? "bg-emerald-500 animate-pulse motion-reduce:animate-none" : "bg-stone-600"}`} />
                    <span className={micActive ? "text-emerald-400 font-semibold" : "text-stone-500"}>
                      {micActive ? "True" : "False"}
                    </span>
                  </div>
                </div>

                {/* Audio Output Active */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/40 border border-white/5">
                  <span className="text-stone-400 text-xs">Audio Output Active</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${audioOutputActive ? "bg-emerald-500 animate-pulse motion-reduce:animate-none" : "bg-stone-600"}`} />
                    <span className={audioOutputActive ? "text-emerald-400 font-semibold" : "text-stone-500"}>
                      {audioOutputActive ? "True" : "False"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Last Message Timestamp */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-900/40 border border-white/5 text-sm font-mono">
                <span className="text-stone-400 text-xs">Last Message Timestamp</span>
                <span className="text-amber-400 font-semibold">
                  {lastMessageTimestamp ? new Date(lastMessageTimestamp).toLocaleTimeString() : "--:--:--"}
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Side: Progress Timeline & Stages */}
        <section className="space-y-6">
          <Card className="bg-[#0f0f11] border border-white/10 p-6">
            <CardHeader className="p-0 pb-4 border-b border-white/5">
              <CardTitle className="text-lg font-semibold text-stone-100 flex items-center gap-2">
                <Mic size={18} className="text-amber-400" />
                Interview Timeline
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 pt-6">
              <div className="relative border-l-2 border-white/10 pl-6 space-y-8">
                
                {/* Timeline Items */}
                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    activeStage === "intro" && callState === "active"
                      ? "border-amber-400 bg-black text-amber-400"
                      : activeStage !== "intro" && callState === "active"
                      ? "border-emerald-500 bg-emerald-500 text-black"
                      : "border-white/20 bg-stone-900 text-stone-500"
                  }`}>
                    {activeStage !== "intro" && callState === "active" ? (
                      <CheckCircle2 size={12} className="text-black fill-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <div>
                    <h4 className={`text-sm font-semibold ${
                      activeStage === "intro" && callState === "active" ? "text-amber-400" : "text-stone-300"
                    }`}>
                      1. Introductory / Fit
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Warmup questions, background summary, and experience check.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    activeStage === "projects" && callState === "active"
                      ? "border-amber-400 bg-black text-amber-400"
                      : activeStage === "technical" || activeStage === "behavioral"
                      ? "border-emerald-500 bg-emerald-500 text-black"
                      : "border-white/20 bg-stone-900 text-stone-500"
                  }`}>
                    {activeStage === "technical" || activeStage === "behavioral" ? (
                      <CheckCircle2 size={12} className="text-black fill-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <div>
                    <h4 className={`text-sm font-semibold ${
                      activeStage === "projects" && callState === "active" ? "text-amber-400" : "text-stone-300"
                    }`}>
                      2. Project Deep-Dive
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Probing architecture decisions, technical constraints, and trade-offs.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    activeStage === "technical" && callState === "active"
                      ? "border-amber-400 bg-black text-amber-400"
                      : activeStage === "behavioral"
                      ? "border-emerald-500 bg-emerald-500 text-black"
                      : "border-white/20 bg-stone-900 text-stone-500"
                  }`}>
                    {activeStage === "behavioral" ? (
                      <CheckCircle2 size={12} className="text-black fill-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  <div>
                    <h4 className={`text-sm font-semibold ${
                      activeStage === "technical" && callState === "active" ? "text-amber-400" : "text-stone-300"
                    }`}>
                      3. Technical Competencies
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Assessing depth on technical domains, edge cases, and scaling details.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    activeStage === "behavioral" && callState === "active"
                      ? "border-amber-400 bg-black text-amber-400"
                      : "border-white/20 bg-stone-900 text-stone-500"
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  </span>
                  <div>
                    <h4 className={`text-sm font-semibold ${
                      activeStage === "behavioral" && callState === "active" ? "text-amber-400" : "text-stone-300"
                    }`}>
                      4. Behavioral & Fit
                    </h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Evaluating teamwork, failure outcomes, conflict management, and ownership.
                    </p>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </section>

      </div>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center border-t border-white/5 pt-6 text-xs text-stone-500">
        <p>© 2026 Kublet. AI Interview Session. Powered by Bolna Voice Engine.</p>
      </footer>
    </main>
  );
}
