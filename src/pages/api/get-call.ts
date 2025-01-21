// pages/api/get-call.ts

import { NextApiRequest, NextApiResponse } from 'next';
import client from '@/retell-client'


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

    // TODO: Store updated status in DB
    // TODO: (BONUS) Run this via web-hook on post call data analysis complete to auto-update db

    // Respond with the call ID
    return res.status(200).json(statusResponse);
    
  } catch (error) {
    console.error('Error creating phone call:', error);
    return res.status(500).json({ error: 'An error occurred while creating the phone call.' });
  }
}
