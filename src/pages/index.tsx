// pages/index.tsx

import { useState } from 'react';

const Home = () => {
  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    phone: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    // Restrict Car Year to valid numbers
    if (name === 'year') {
      const numericValue = value.replace(/\D/, '');
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Car Details</h2>

        {/* Car Year */}
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

        {/* Car Make */}
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

        {/* Car Model */}
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

        {/* Car Trim */}
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

        {/* Phone Number */}
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
            pattern="^[+]?[\d\s\-()]{10,15}$"
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
      </form>
    </div>
  );
};

export default Home;