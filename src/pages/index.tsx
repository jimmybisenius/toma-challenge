// pages/index.tsx

import { useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

const Home = () => {
  // State to manage loading status during async operations
  const [loading, setLoading] = useState<boolean>(false);

  // State to store form data inputs
  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    phone: '',
  });

  // Handler form input changes 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // For phone number, allow only digits, spaces, hyphens, parentheses, and plus sign
      const phoneValue = value.replace(/[^0-9\s\-()+]/g, '');
      setFormData({ ...formData, [name]: phoneValue });
    } else if (name === 'year') {
      // For car year, restrict input to numbers only
      const yearValue = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: yearValue });
    } else {
      // For other fields, accept the input as is
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { phone } = formData;

    // Replace with your Retell-managed callback number and email
    const callbackNumber = '+19842134169';
    const callbackEmail = 'jim@freddydog.com';

    // Verify that the Retell API Key is available in environment variables
    if (!process.env.NEXT_PUBLIC_RETELL_API_KEY) {
      alert(
        'Retell API Key not found, please add and try again.'
      );
      return;
    }

    try {
      // Set loading state to true to indicate async operation is in progress
      setLoading(true);

      // Step 1: Initiate the call using Retell API
      const createCallResponse = await axios.post(
        '/v2/create-phone-call',
        {
          from_number: callbackNumber,
          to_number: phone,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract the call ID from the response
      const callId = createCallResponse.data.call_id;

      // Step 2: Poll for call status and retrieve post-call data
      let callStatus = 'registered';
      let postCallData: any = null;

      while (callStatus !== 'ended') {
        // Fetch the current status of the call
        const statusResponse = await axios.get(`/v2/calls/${callId}`, {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API_KEY}`,
          },
        });

        // Update the call status
        callStatus = statusResponse.data.call_status;

        if (callStatus === 'ended') {
          // Retrieve post-call data once the call has ended
          postCallData = statusResponse.data.post_call_data;
          break;
        }

        // Wait for 2 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Set loading state to false as the operation is complete
      setLoading(false);

      if (postCallData) {
        // Extract nearest service availability and oil change price from post-call data
        const nearestService =
          postCallData.soonest_service_availability || 'N/A';
        const oilChangePrice = postCallData.oil_change_price || 'N/A';

        // Display the results to the user
        alert(`Nearest oil change is ${nearestService} for ${oilChangePrice}`);
      }

      // Log the audio playback URL for debugging or future reference
      const audioPlaybackUrl = `https://your-domain.com/playback/${callId}`;
      console.log(`Audio Playback URL: ${audioPlaybackUrl}`);
    } catch (error) {
      // Handle any errors during the call process
      console.error('Error during call process:', error);
      alert('Failed to complete the call. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Page Head */}
      <Head>
        <title>Jim's Mystery Shopper | Toma</title>
      </Head>

      {/* Main Content */}
      <div className="flex flex-col gap-8 items-center justify-start min-h-screen bg-gray-100 p-4 text-gray-500 py-4 md:py-16">
        {/* Logo */}
        <img src="/logo.svg" className="h-8 w-auto" />

        {/* Form */}
        <form
          className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          {/* Disable form fields when loading */}
          <fieldset disabled={loading}>
            {/* Form Title */}
            <h2 className="text-black text-2xl font-bold mb-4 text-center tracking-tight">
              Jim's Mystery Shopper
            </h2>

            {/* Car Year Input */}
            <div className="mb-4">
              <label
                htmlFor="year"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Car Year
              </label>
              <input
                type="number"
                name="year"
                id="year"
                min={1900}
                max={new Date().getFullYear() + 1}
                required
                value={formData.year}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            {/* Car Make Input */}
            <div className="mb-4">
              <label
                htmlFor="make"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Car Make
              </label>
              <input
                type="text"
                name="make"
                id="make"
                required
                value={formData.make}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            {/* Car Model Input */}
            <div className="mb-4">
              <label
                htmlFor="model"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Car Model
              </label>
              <input
                type="text"
                name="model"
                id="model"
                required
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            {/* Car Trim Input */}
            <div className="mb-4">
              <label
                htmlFor="trim"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Car Trim
              </label>
              <input
                type="text"
                name="trim"
                id="trim"
                value={formData.trim}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
            </div>

            {/* Phone Number Input */}
            <div className="mb-6">
              <label
                htmlFor="phone"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                pattern="^\\+?[0-9\\s\\-()]{10,15}$"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
              />
              <p className="text-gray-600 text-xs mt-1">
                Enter a valid phone number.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring"
            >
              Submit
            </button>
          </fieldset>
        </form>
      </div>
    </>
  );
};

export default Home;