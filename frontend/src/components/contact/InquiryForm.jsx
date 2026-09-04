import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';

export default function InquiryForm() {
  const { post } = useApi();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    privacyConsent: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ================= PRIVACY CONSENT =================
    if (!formData.privacyConsent) {
      setSubmitError(
        'You must agree to the Privacy Policy before submitting.'
      );
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      const data = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      };

      const result = await post('/enquiry/userenquiry', data);

      console.log('Inquiry submitted successfully:', result);

      setSubmitted(true);

      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
        privacyConsent: false,
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    } catch (err) {
      console.error('Inquiry submission failed:', err);

      setSubmitError(
        err?.message ||
          'Something went wrong while sending your inquiry. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="w-full"
      aria-labelledby="inquiry-form-title"
    >
      {/* Heading */}
      <div className="mb-8">
        <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-[#555555] mb-2">
          Concierge
        </p>

        <h2
          id="inquiry-form-title"
          className="font-caslon text-3xl sm:text-4xl font-normal text-black tracking-tight"
        >
          Send an Inquiry
        </h2>
      </div>

      {/* Success Message */}
      {submitted && (
        <div
          className="mb-7 border border-black/10 bg-[#F7F7F5] px-5 py-4 text-center"
          role="status"
        >
          <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-black">
            Inquiry Received
          </p>

          <p className="mt-1 font-inter text-sm text-[#5D5E63]">
            Thank you. Our concierge will connect with you shortly.
          </p>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div
          className="mb-7 border border-[#E5B8B8] bg-[#FCEBEB] px-5 py-4 text-center"
          role="alert"
        >
          <p className="font-inter text-sm text-[#A32D2D]">
            {submitError}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-7"
      >
        {/* First Name + Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">

          {/* First Name */}
          <div className="w-full">
            <label
              htmlFor="firstName"
              className="block font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-[#222222] mb-2"
            >
              First Name
            </label>

            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              autoComplete="given-name"
              className="w-full border-0 border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-3 font-inter text-sm text-black placeholder-[#999999] transition-colors duration-300"
            />
          </div>

          {/* Last Name */}
          <div className="w-full">
            <label
              htmlFor="lastName"
              className="block font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-[#222222] mb-2"
            >
              Last Name
            </label>

            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              autoComplete="family-name"
              className="w-full border-0 border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-3 font-inter text-sm text-black placeholder-[#999999] transition-colors duration-300"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="w-full">
          <label
            htmlFor="email"
            className="block font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-[#222222] mb-2"
          >
            Email Address
          </label>

          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            autoComplete="email"
            className="w-full border-0 border-b border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent py-3 font-inter text-sm text-black placeholder-[#999999] transition-colors duration-300"
          />
        </div>

        {/* Your Enquiry Details */}
        <div className="w-full">
          <label
            htmlFor="message"
            className="block font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-[#222222] mb-2"
          >
            Your Enquiry Details
          </label>

          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us how we can assist you..."
            rows={5}
            className="w-full border border-[#C4C7C7] hover:border-black focus:border-black focus:outline-none bg-transparent px-4 py-4 font-inter text-sm text-black placeholder-[#999999] transition-colors duration-300 resize-y min-h-[140px]"
          />
        </div>

        {/* ================= PRIVACY CONSENT ================= */}

        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleChange}
              className="accent-black mt-1 shrink-0"
            />

            <span className="font-inter text-sm text-[#5D5E63] leading-6">
              I agree to the{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline hover:opacity-70"
              >
                Privacy Policy
              </a>
              .
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex items-center justify-center gap-3 bg-black text-white px-9 py-4 font-inter text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-300 hover:bg-[#222222] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {submitting ? 'Sending...' : 'Submit Inquiry'}
            </span>

            <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}