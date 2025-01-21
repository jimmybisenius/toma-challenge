// pages/api/create-phone-call.ts

import { NextApiRequest, NextApiResponse } from 'next';
import client from '@/retell-client'
import phone from 'phone';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Please use POST.' });
  }

  try {
    const { phoneNumber, make, model, trim, year } = req.body;

    // Input validation
    if (!phoneNumber || !make || !model || !trim || !year) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const validatedPhone = phone(phoneNumber);
    if (!validatedPhone.isValid) {
      return res.status(400).json({ error: 'Invalid phone number.' });
    }

    // Step 1: Initiate the call using Retell API
    const createCallResponse = await client.call.createPhoneCall({
      from_number: '+19842134169', // Your pre-defined outbound number
      to_number: validatedPhone.phoneNumber,
      retell_llm_dynamic_variables: {
        car_year: year,
        car_make: make,
        car_model: model,
        car_trim: trim,
      },
    });

    // Extract the call ID from the response
    const callId = createCallResponse.call_id;

    // TODO: Create new call with details & callId in DB

    // Respond with the call ID
    return res.status(200).json({ call_id: callId });
    
  } catch (error) {
    console.error('Error creating phone call:', error);
    return res.status(500).json({ error: 'An error occurred while creating the phone call.' });
  }
}
