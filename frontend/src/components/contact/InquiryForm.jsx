import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from '../../hooks/useApi';

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nature: 'Product Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const { post } = useApi();
  const token = useSelector((state) => state.auth.token);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        subject: formData.nature,
        message: formData.message
      };

      if (!token) {
        data.name = `${formData.firstName} ${formData.lastName}`;
        data.email = formData.email;
      }

      const result = await post('/enquiry/userenquiry', data);

      console.log('Inquiry submitted successfully:', result);

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          nature: 'Product Inquiry',
          message: ''
        });
      }, 4000);
     

    } catch (error) {
      console.error('Inquiry submission failed:', error);
    }
  };

  return (
    <section className="w-full" aria-labelledby="inquiry-form-title">
      <h2
        id="inquiry-form-title"
        className="font-caslon text-2xl font-normal text-black mb-6"
      >
        Send an Inquiry
      </h2>

      {submitted && (
        <div className="mb-6 p-4 bg-neutral-100 text-neutral-800 text-sm font-inter text-center rounded-[2px]">
          Thank you. Your inquiry has been received and our concierge will
          connect with you shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">

        {/* First Name */}
        <div className="w-full">
          <label htmlFor="firstName" className="sr-only">
            First Name
          </label>

          <input
            type="text"
            id="firstName"
            name="firstName"
            required={!token}
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-4 font-inter text-base text-black placeholder-[#5D5E63]"
          />
        </div>

        {/* Last Name */}
        <div className="w-full">
          <label htmlFor="lastName" className="sr-only">
            Last Name
          </label>

          <input
            type="text"
            id="lastName"
            name="lastName"
            required={!token}
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-4 font-inter text-base text-black placeholder-[#5D5E63]"
          />
        </div>

        {/* Email */}
        <div className="w-full">
          <label htmlFor="email" className="sr-only">
            Email Address
          </label>

          <input
            type="email"
            id="email"
            name="email"
            required={!token}
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-4 font-inter text-base text-black placeholder-[#5D5E63]"
          />
        </div>

        {/* Nature */}
        <div className="w-full relative">
          <label htmlFor="nature" className="sr-only">
            Nature of Inquiry
          </label>

          <select
            id="nature"
            name="nature"
            value={formData.nature}
            onChange={handleChange}
            className="w-full border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-4 font-inter text-base text-[#5D5E63] appearance-none pr-8 cursor-pointer"
          >
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Order Assistance">Order Assistance</option>
            <option value="Concierge Service">Concierge Service</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>

        {/* Message */}
        <div className="w-full">
          <label htmlFor="message" className="sr-only">
            Your Message
          </label>

          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Your Message"
            rows="4"
            className="w-full border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-4 font-inter text-base text-[#5D5E63] placeholder-[#5D5E63] min-h-[120px] resize-y"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 self-start">
          <button
            type="submit"
            className="flex items-center justify-center bg-black text-white hover:opacity-90 px-[48px] py-[20px] font-inter text-[12px] font-semibold tracking-[0.1em] uppercase transition-opacity duration-300 cursor-pointer"
          >
            Submit Inquiry

            <span className="material-symbols-outlined text-base ml-2">
              arrow_forward
            </span>
          </button>
        </div>

      </form>
    </section>
  );
}