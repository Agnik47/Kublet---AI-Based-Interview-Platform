"use client";

import { useEffect, useCallback, useState } from "react";

// Stream Video
import {
  StreamTheme,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  CallingState,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

// Stream Chat
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
  Window,
  useCreateChatClient,
  MessageComposer,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";

import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import AIQuestionsPanel from "./AIQuestionsPanel";

const CallUI = ({
  callId,
  isInterviewer,
  booking,
  onLeave,
  apiKey,
  token,
  currentUser,
}) => {
  const { useCallCallingState } = useCallStateHooks();

  const call = useCall();
  const callingState = useCallCallingState();

  //auto leave the call when it ends
  const handleLeave = useCallback(async () => {
    //? define a callback function to handle leaving the call, this will be passed to the CallControls component and called when the user clicks the leave button
    try {
      if (call) {
        const isRecording = call.state?.recording; //? check if the call is being recorded, if it is, stop the recording before leaving the call
        if (isRecording) {
          await call.stopRecording().catch(() => {}); //? stop the recording, catch any errors to prevent unhandled promise rejections, since the recording might have already stopped or failed to stop for some reason
        }
        await call.leave().catch(() => {}); //? leave the call,
      }
    } finally {
      onLeave(); //? call the onLeave callback to handle any additional cleanup or navigation after leaving the call, this will be called regardless of whether the call.leave() was successful or if it threw an error, ensuring that the user is navigated away from the call interface even if there were issues with leaving the call or stopping the recording
    }
  }, [call, onLeave]);

  // ── Chat client — same token works for both Video + Chat SDKs ──
  const chatClient = useCreateChatClient({
    apiKey,
    tokenOrProvider: token,
    userData: {
      id: currentUser.id,
      name: currentUser.name,
      image: currentUser.imageUrl,
    },
  });

  const [activeTab, setActiveTab] = useState("chat");
  const [chatChannel, setChatChannel] = useState(null);
  useEffect(() => {
    if (!chatClient) return;

    const channel = chatClient.channel("messaging", callId, {
      name: "Interview Chat",
      members: [
        booking.interviewer.clerkUserId,
        booking.interviewee.clerkUserId,
      ],
    });

    channel
      .watch()
      .then(() => setChatChannel(channel))
      .catch(console.error);

    return () => {
      channel.stopWatching().catch(() => {});
    };
  }, [chatClient, callId, booking]);

  if (callingState === CallingState.LEFT) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] rounded-2xl flex flex-col items-center justify-center gap-3">
        <p className="text-stone-400 text-sm">Leaving call…</p>
      </div>
    );
  }
  return (
    <div className="min-h-[92vh] bg-[#0a0a0b] rounded-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-white/10 text-stone-500 text-xs"
          >
            {booking.interviewer.name}
            <span className="text-stone-700 mx-1.5">×</span>
            {booking.interviewee.name}
          </Badge>
          {isInterviewer && (
            <Badge
              variant="outline"
              className="border-amber-400/20 bg-amber-400/5 text-amber-400 text-xs"
            >
              Interviewer
            </Badge>
          )}
        </div>
      </div>

      {/* Body: video + side panel */}
      <div className="flex flex-1 min-h-0 bg-[#0a0a0b] overflow-hidden">
        {/* ── LEFT: Video ── */}
        <div className="flex flex-col flex-1 min-w-0">
          <StreamTheme>
            <SpeakerLayout participantBarPosition="bottom" />
            <CallControls onLeave={handleLeave} />
          </StreamTheme>
        </div>

        {/* ── RIGHT: Chat / AI panel ── */}
        <div className="w-85 shrink-0 flex flex-col border-l border-white/8 bg-[#0a0a0b]">
          {/* Tab switcher */}
          <div className="flex border-b border-white/8 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              <MessageSquare size={13} />
              Chat
            </button>

            {/* AI Questions tab — interviewer only */}
            {isInterviewer && (
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                  activeTab === "ai"
                    ? "text-amber-400 border-b-2 border-amber-400"
                    : "text-stone-500 hover:text-stone-300"
                }`}
              >
                <Sparkles size={13} />
                AI Questions  
              </button>
            )}
          </div>

          {/* Panel content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeTab === "chat" ? (
              chatClient && chatChannel ? (
                <Chat client={chatClient} theme="str-chat__theme-dark">
                  <Channel channel={chatChannel}>
                    <Window>
                      <MessageList />
                      <MessageComposer />
                    </Window>
                  </Channel>
                </Chat>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={18} className="text-stone-600 animate-spin" />
                </div>
              )
            ) : (
              <div className="p-4 h-full overflow-y-scroll max-h-screen">
                <AIQuestionsPanel categories={booking.categories} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallUI;
