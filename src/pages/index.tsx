// pages/index.tsx

import { useState } from 'react';
import Head from 'next/head';
import {phone} from 'phone';
import axios from 'axios'

type CallResults = {
  recordingUrl: string | undefined,
  oilChangePrice: string | undefined,
  soonestServiceAvailability: string | undefined,
  holdTime: number | undefined
}

const Home = () => {
  // State to manage loading status during async operations
  const [loading, setLoading] = useState<boolean>(false);
  const [callResults, setCallResults] = useState<CallResults | undefined>(undefined)

  // State to store form data inputs
  const [formData, setFormData] = useState({
    year: '2024',
    make: 'Honda',
    model: 'Civic',
    trim: 'EX',
    phone: '984-269-8841',
  });

  // Handler for input changes in the form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

  if (name === 'year') {
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
    
    // Reset previous result state
    setCallResults(undefined)

    try {
      // Set loading state to true to indicate async operation is in progress
      setLoading(true);

      // Step 1: Initiate the call using Retell API
      /*
      const createCallResponse = await client.call.createPhoneCall({
        from_number: '+19842134169',
        to_number: phone(formData.phone).phoneNumber ?? '',
        retell_llm_dynamic_variables: {
          car_year: formData.year,
          car_make: formData.make,
          car_model: formData.model,
          car_trim: formData.trim
        }
      });
      */

      const { data: createCallResponse } = await axios.post('/api/create-phone-call', {
        phoneNumber: phone(formData.phone).phoneNumber ?? '',
        year: formData.year,
        make: formData.make,
        model: formData.model,
        trim: formData.trim
      })

      // Extract the call ID from the response
      const callId = createCallResponse.call_id;

      // Step 2: Poll for call status and retrieve post-call data
      let callStatus = 'registered';
      let postCallData: any = null;

      while (callStatus !== 'ended' || !postCallData) {
        // Fetch the current status of the call
        // const statusResponse = await client.call.retrieve(callId);
        const { data: statusResponse } = await axios.post('/api/get-call', {
          callId
        })

        // Update the call status
        callStatus = statusResponse.call_status;

        if (callStatus === 'ended' || !postCallData) {
          // Retrieve post-call data once the call has ended
          postCallData = statusResponse.call_analysis;

          if(postCallData) {
             // Log status
            console.log("Post call analysis complete")
            console.log(postCallData)

            const results: CallResults = {
              recordingUrl: statusResponse.recording_url,
              oilChangePrice: postCallData.custom_analysis_data.oil_change_price,
              soonestServiceAvailability: postCallData.custom_analysis_data.soonest_service_availability,
              holdTime: postCallData.custom_analysis_data.hold_time
            }
  
            // Update results
            setCallResults(results)
            // Set loading false, restore form
            setLoading(false)
            // Only exit loop when both conditions are met
            break;
          }
        }

        // Wait for 2 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000));
        console.log('Retrying...')
      }

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
          { !loading ? <fieldset disabled={loading}>
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
              disabled={loading}
              type="submit"
              className="w-full text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring bg-blue-500 hover:bg-blue-600"
            >
              Submit
            </button>
          </fieldset> : <div className='flex flex-col items-center p-6 gap-4'>
            <img src="/loading.gif" className='w-10 h-10'/>
            <p className='text-lg text-gray-600 tracking-tight font-medium'>Call in progress, please hold</p>
          </div>}
        </form>
        { /* Results */ }
        {
          /* If recordingUrl, assume call finished */
          callResults ?
          <div className='flex flex-col items-center justify-center gap-2'>
            <p className='font-bold tracking-tight text-2xl text-black'>Call finished 🏁</p>
            <div className='flex flex-col items-center justify-start gap-1'>
              {callResults.oilChangePrice ? <p><b>Oil change price:</b> {callResults.oilChangePrice}</p> : <p>Oil change price not available.</p>}
              {callResults.soonestServiceAvailability ? <p><b>Soonest appointment:</b> {callResults.soonestServiceAvailability}</p> : <p>Availability not available.</p>}
              {callResults.holdTime !== undefined ? <p>{callResults.holdTime === 0 ? 'No time spent on hold, hurray! 🎉' : <><b>Time spent on hold: </b>{callResults.holdTime} seconds</>}</p> : <p>Hold time not available.</p>}
            </div>
            {callResults.recordingUrl ? <a href={callResults.recordingUrl}>
              <button
                type="submit"
                className="w-full text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring bg-gray-500 hover:bg-gray-400 mt-4"
              >Download call recording</button>
            </a> : <p>Call recording not available.</p>}
          </div> : <></>
        }
      </div>
    </>
  );
};

export default Home;