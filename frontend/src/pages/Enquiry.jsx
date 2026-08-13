
import React, { useState } from "react";

export default function Enquiry() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    alert("Your enquiry has been submitted.");

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] px-5 py-16">
      <div className="mx-auto max-w-[700px]">

        <h1 className="font-['Libre_Caslon_Text'] text-4xl text-black">
          Enquire for Bespoke
        </h1>

        <p className="mt-4 mb-10 text-[#5D5E63]">
          Tell us about your requirements and our team will get back to you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 bg-white p-8"
        >
          <div>
            <label className="block mb-2 text-sm text-black">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border-b border-[#C4C7C7] py-3 outline-none focus:border-black"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-black">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border-b border-[#C4C7C7] py-3 outline-none focus:border-black"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-black">
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border-b border-[#C4C7C7] py-3 outline-none focus:border-black"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-black">
              Your Enquiry
            </label>

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full border border-[#C4C7C7] p-3 outline-none focus:border-black"
              placeholder="Tell us what you are looking for..."
            />
          </div>

          <button
            type="submit"
            className="bg-black py-4 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-90"
          >
            Submit Enquiry
          </button>

        </form>
      </div>
    </div>
  );
}

