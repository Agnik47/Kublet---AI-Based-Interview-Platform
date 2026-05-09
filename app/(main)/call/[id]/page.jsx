import { getCallData } from "@/actions/call";
import React from "react";
import CallRoom from "../_components/CallRoom";

const CallPage = async ({ params }) => {
  const { id } = await params;
  const result = await getCallData(id);

  if (result.error === "Unauthorized") {
    redirect("/");
  }
  if (result.error === "Call not found") {
    notFound();
  }
  if (result.error === "Forbidden") {
    redirect("/");
  }

  const { token, isInterviewer, currentUser, booking } = result;
  return (
    <CallRoom
      callId={id}
      token={token}
      apiKey={process.env.NEXT_PUBLIC_STREAM_API_KEY}
      currentUser={currentUser}
      booking={booking}
      isInterviewer={isInterviewer}
    />
  );
};

export default CallPage;
