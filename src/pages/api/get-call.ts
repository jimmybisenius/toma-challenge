// pages/api/get-call.ts

import { NextApiRequest, NextApiResponse } from 'next';

import client from '@/retell-client'
import db from '@/db'
import { CallResponse } from 'retell-sdk/resources/call.mjs';

export type GetCallResults = {
  oilChangePrice: string | undefined,
  soonestServiceAppt: string | undefined,
  holdTimeSeconds: number | undefined,
  recordingUrl: string | undefined,
  sentToVoicemail: boolean | undefined,
  transcript: string | undefined,
  callStatus: string | undefined
}

// TODO: fix transcript typing
function calculateHoldTime(transcript: any[]): number {
  let totalHoldTime = 0;
  let holdStartTime: number | null = null;
  let errorOccurred = false;

  for (const entry of transcript) {
    // Detect hold start
    if (
      entry.role === "user" &&
      entry.content.toLowerCase().includes("please hold")
    ) {
      holdStartTime = entry.words?.[0]?.start || null;
    }

    // Detect hold end
    else if (entry.role === "agent" && holdStartTime !== null) {
      const holdEndTime = entry.words?.[entry.words.length - 1]?.end || 0;
      totalHoldTime += holdEndTime - holdStartTime;
      holdStartTime = null; // Reset hold time
    }
  }

  // If the call ends while on hold, treat it as an error
  if (holdStartTime !== null) {
    errorOccurred = true;
  }

  // Return 0 if an error occurred, otherwise return the total hold time
  return errorOccurred ? 0 : totalHoldTime;
}

// TODO: Add sent to voicemail
async function updatePhoneCall(callId: string, statusResponse: CallResponse): Promise<GetCallResults> {

  const callAnalysis: any = { ...statusResponse.call_analysis }

  const results: GetCallResults = {
    oilChangePrice: callAnalysis.custom_analysis_data?.oil_change_price,
    soonestServiceAppt: callAnalysis?.custom_analysis_data?.soonest_service_availability,
    holdTimeSeconds: statusResponse.transcript_with_tool_calls ? calculateHoldTime(statusResponse.transcript_with_tool_calls) : undefined,
    recordingUrl: statusResponse.recording_url,
    sentToVoicemail: callAnalysis?.in_voicemail,
    transcript: statusResponse.transcript,
    callStatus: statusResponse.call_status
  }

  await db.query(`
    UPDATE
      phone_calls
    SET
      oil_change_price = ?,
      soonest_service_appt = ?,
      hold_time_seconds = ?,
      recording_url = ?,
      sent_to_voicemail = ?,
      transcript = ?,
      updated_at = now()
    WHERE
      call_id = ?;
    `
    , [
      // Oil change price
      results.oilChangePrice,
      // Soonest service appt
      results.soonestServiceAppt,
      // Time spent on hold, in seconds
      results.holdTimeSeconds,
      // Call recording Url
      results.recordingUrl,
      // Sent to voicemail?
      results.sentToVoicemail,
      // Transcript
      results.transcript
      // (DO NOT PARAMS BELOW) Call ID
      , callId]);

    return results
}

// Runs on /api/get-call
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { callId } = req.body;

    // Input validation
    if (!callId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Step 1: Initiate the call using Retell API
    const statusResponse = await client.call.retrieve(callId);

    // Store updated status in DB
    const results = await updatePhoneCall(callId, statusResponse)
    // TODO: (BONUS) Run this via web-hook on post call data analysis complete to auto-update db

    // Respond with the call ID
    return res.status(200).json(results);
    
  } catch (error) {
    console.error('Error creating phone call:', error);
    return res.status(500).json({ error: 'An error occurred while creating the phone call.' });
  }
}
