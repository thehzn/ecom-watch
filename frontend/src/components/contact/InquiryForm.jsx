import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { ArrowRight, Check } from 'lucide-react';

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
    <section className="w-full" aria-labelledby="inquiry-form-title">
      {/* Heading */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">
          Concierge
        </p>

        <h2
          id="inquiry-form-title"
          className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
        >
          Send an Inquiry
        </h2>
      </div>

      {/* Success Message */}
      {submitted && (
        <div
          className="mb-7 flex items-center gap-3 border border-white/15 bg-[#0E1015] rounded-2xl px-5 py-4"
          role="status"
        >
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0">
            <Check size={16} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white">
              Inquiry Received
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Thank you. Our concierge will connect with you shortly.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div
          className="mb-7 border border-red-500/30 bg-red-500/10 rounded-2xl px-5 py-4 text-center"
          role="alert"
        >
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        {/* First Name + Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          <div className="w-full">
            <label
              htmlFor="firstName"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
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
              className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
            />
          </div>

          <div className="w-full">
            <label
              htmlFor="lastName"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
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
              className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="w-full">
          <label
            htmlFor="email"
            className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
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
            className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
          />
        </div>

        {/* Message */}
        <div className="w-full">
          <label
            htmlFor="message"
            className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
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
            className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl p-4 outline-none transition-colors placeholder:text-gray-600 resize-none min-h-[140px]"
          />
        </div>

        {/* Privacy Consent */}
        <div className="pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleChange}
              className="accent-white mt-1 shrink-0"
            />
            <span className="text-sm text-gray-400 leading-6">
              I agree to the{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline hover:opacity-70"
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-9 py-4 rounded-full shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>{submitting ? 'Sending...' : 'Submit Inquiry'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </section>
  );
}