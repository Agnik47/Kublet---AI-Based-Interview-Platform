"use client";
import { StreamVideoClient } from "@stream-io/video-client";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CallUI from "./CallUI";

const CallRoom = ({
  callId,
  token,
  apiKey,
  currentUser,
  booking,
  isInterviewer,
}) => {
  const router = useRouter();
  const [videoClient, setVideoClient] = useState(null);
  const [call, setCall] = useState(null);

  const clientRef = useRef(null); //? what is this for? to store the video client instance, so that we can access it in the useEffect and handleLeave functions without having to add it to the dependency array, which would cause unnecessary re-renders
  const joinedRef = useRef(false); //? what is this for? to track if the user has joined the call or not, to prevent multiple joins

  // ? useEffect to handle the side effects of joining the call and cleaning up when the component unmounts
  useEffect(() => {
    // Guard against React StrictMode double-invoke in development
    if (joinedRef.current) return; // if the user has already joined the call, do nothing
    joinedRef.current = true; // set the joined ref to true to prevent multiple joins

    const client = new StreamVideoClient({
      //?*create a new video client instance with the api key and token
      apiKey,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        image: currentUser.imageUrl,
      },
      token,
    });

    const callInstance = client.call("default", callId);

    callInstance
      .join({ create: false })
      .then(() => {
        clientRef.current = client; // store the client instance in the ref , what is this for? to access the client instance in the cleanup function of the useEffect, to disconnect the user when the component unmounts
        setVideoClient(client); // set the video client state to trigger the UI to render the call interface
        setCall(callInstance); // set the call state to trigger the UI to render the call interface
      })
      .catch(console.error);

    return () => {
      callInstance.leave().catch(() => {}); // leave the call when the component unmounts, catch any errors to prevent unhandled promise rejections
      client.disconnectUser().catch(() => {});
      clientRef.current = null;
      joinedRef.current = false; // reset so hot reload works
    };
  }, [
    apiKey,
    callId,
    currentUser.id,
    currentUser.imageUrl,
    currentUser.name,
    token,
  ]);

  const handleLeave = useCallback(() => {
    // useCallback to memoize the function and prevent unnecessary re-renders
    router.push(isInterviewer ? "/dashboard" : "/appointments");
  }, [isInterviewer, router]);

  if (!videoClient || !call) {
    return (
      <div className="felx justify-center items-center">
        <Loader2 size={28} className="text-amber-400 animate-spin" />
        <p className="text-stone-500 text-sm font-light">
          Conecting To the call.....
        </p>
      </div>
    );
  }
  return (
    <StreamVideo client={videoClient}>
      <StreamCall call={call}>
        <CallUI
          callId={callId}
          isInterviewer={isInterviewer}
          booking={booking}
          onLeave={handleLeave}
          apiKey={apiKey}
          token={token}
          currentUser={currentUser}
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default CallRoom;
