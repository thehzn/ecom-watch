// import React, { useState } from 'react';
// import { useApi } from '../../hooks/useApi';
// import { ArrowRight, Check } from 'lucide-react';

// export default function InquiryForm() {
//   const { post } = useApi();

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     subject: 'General Inquiry',
//     message: '',
//     privacyConsent: false,
//   });

//   const [submitted, setSubmitted] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState('');

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // ================= PRIVACY CONSENT =================
//     if (!formData.privacyConsent) {
//       setSubmitError(
//         'You must agree to the Privacy Policy before submitting.'
//       );
//       return;
//     }

//     setSubmitError('');
//     setSubmitting(true);

//     try {
//       const data = {
//         firstName: formData.firstName.trim(),
//         lastName: formData.lastName.trim(),
//         email: formData.email.trim(),
//         subject: formData.subject,
//         message: formData.message.trim(),
//       };

//       const result = await post('/enquiry/userenquiry', data);

//       console.log('Inquiry submitted successfully:', result);

//       setSubmitted(true);

//       setFormData({
//         firstName: '',
//         lastName: '',
//         email: '',
//         subject: 'General Inquiry',
//         message: '',
//         privacyConsent: false,
//       });

//       setTimeout(() => {
//         setSubmitted(false);
//       }, 4000);
//     } catch (err) {
//       console.error('Inquiry submission failed:', err);

//       setSubmitError(
//         err?.message ||
//           'Something went wrong while sending your inquiry. Please try again.'
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <section className="w-full" aria-labelledby="inquiry-form-title">
//       {/* Heading */}
//       <div className="mb-8">
//         <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">
//           Concierge
//         </p>

//         <h2
//           id="inquiry-form-title"
//           className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
//         >
//           Send an Inquiry
//         </h2>
//       </div>

//       {/* Success Message */}
//       {submitted && (
//         <div
//           className="mb-7 flex items-center gap-3 border border-white/15 bg-[#0E1015] rounded-2xl px-5 py-4"
//           role="status"
//         >
//           <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0">
//             <Check size={16} strokeWidth={2.5} />
//           </div>
//           <div>
//             <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white">
//               Inquiry Received
//             </p>
//             <p className="mt-1 text-sm text-gray-400">
//               Thank you. Our concierge will connect with you shortly.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Error Message */}
//       {submitError && (
//         <div
//           className="mb-7 border border-red-500/30 bg-red-500/10 rounded-2xl px-5 py-4 text-center"
//           role="alert"
//         >
//           <p className="text-sm text-red-400">{submitError}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
//         {/* First Name + Last Name */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
//           <div className="w-full">
//             <label
//               htmlFor="firstName"
//               className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
//             >
//               First Name
//             </label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               required
//               value={formData.firstName}
//               onChange={handleChange}
//               placeholder="First Name"
//               autoComplete="given-name"
//               className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
//             />
//           </div>

//           <div className="w-full">
//             <label
//               htmlFor="lastName"
//               className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
//             >
//               Last Name
//             </label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               required
//               value={formData.lastName}
//               onChange={handleChange}
//               placeholder="Last Name"
//               autoComplete="family-name"
//               className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
//             />
//           </div>
//         </div>

//         {/* Email Address */}
//         <div className="w-full">
//           <label
//             htmlFor="email"
//             className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
//           >
//             Email Address
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             required
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Email Address"
//             autoComplete="email"
//             className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
//           />
//         </div>

//         {/* Message */}
//         <div className="w-full">
//           <label
//             htmlFor="message"
//             className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5"
//           >
//             Your Enquiry Details
//           </label>
//           <textarea
//             id="message"
//             name="message"
//             required
//             value={formData.message}
//             onChange={handleChange}
//             placeholder="Tell us how we can assist you..."
//             rows={5}
//             className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl p-4 outline-none transition-colors placeholder:text-gray-600 resize-none min-h-[140px]"
//           />
//         </div>

//         {/* Privacy Consent */}
//         <div className="pt-1">
//           <label className="flex items-start gap-3 cursor-pointer">
//             <input
//               type="checkbox"
//               name="privacyConsent"
//               checked={formData.privacyConsent}
//               onChange={handleChange}
//               className="accent-white mt-1 shrink-0"
//             />
//             <span className="text-sm text-gray-400 leading-6">
//               I agree to the{' '}
//               <a
//                 href="/privacy-policy"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-white underline hover:opacity-70"
//               >
//                 Privacy Policy
//               </a>
//               .
//             </span>
//           </label>
//         </div>

//         {/* Submit Button */}
//         <div className="pt-2">
//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] px-9 py-4 rounded-full shadow-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//           >
//             <span>{submitting ? 'Sending...' : 'Submit Inquiry'}</span>
//             <ArrowRight size={15} />
//           </button>
//         </div>
//       </form>
//     </section>
//   );
// }
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useApi } from '../../hooks/useApi';
import { ArrowRight, Check } from 'lucide-react';

// ---- Validation rules ----
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[' -][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateName(value, fieldLabel) {
  const trimmed = value.trim();
  if (!trimmed) return `${fieldLabel} is required.`;
  if (trimmed.length < 2 || trimmed.length > 50) {
    return `${fieldLabel} must be between 2 and 50 characters.`;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return `${fieldLabel} can only contain letters, with single hyphens, apostrophes, or spaces between words.`;
  }
  return '';
}

function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Email address is required.';
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  return '';
}

export default function InquiryForm() {
  const { post } = useApi();
  const user = useSelector((state) => state.auth.user);
  const isEmailLocked = Boolean(user?.email);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    subject: 'General Inquiry',
    message: '',
    privacyConsent: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Keep the field in sync if the logged-in user's email changes
  // (e.g. updated elsewhere) or if they log in/out mid-session.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, email: user?.email || '' }));
  }, [user?.email]);

  const runFieldValidator = (name, value) => {
    switch (name) {
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'email':
        return isEmailLocked ? '' : validateEmail(value);
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // clear that field's error as the user retypes
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = runFieldValidator(name, value);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateAllFields = () => {
    const errors = {
      firstName: validateName(formData.firstName, 'First name'),
      lastName: validateName(formData.lastName, 'Last name'),
      email: isEmailLocked ? '' : validateEmail(formData.email),
    };
    setFieldErrors(errors);
    return Object.values(errors).every((msg) => msg === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ================= FIELD VALIDATION =================
    if (!validateAllFields()) {
      setSubmitError('Please fix the highlighted fields before submitting.');
      return;
    }

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
      setFieldErrors({});

      setFormData({
        firstName: '',
        lastName: '',
        email: user?.email || '',
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

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6" noValidate>
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
              onBlur={handleBlur}
              placeholder="First Name"
              autoComplete="given-name"
              aria-invalid={!!fieldErrors.firstName}
              className={`w-full bg-[#141720] border ${
                fieldErrors.firstName ? 'border-red-500/60' : 'border-white/15'
              } focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600`}
            />
            {fieldErrors.firstName && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.firstName}</p>
            )}
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
              onBlur={handleBlur}
              placeholder="Last Name"
              autoComplete="family-name"
              aria-invalid={!!fieldErrors.lastName}
              className={`w-full bg-[#141720] border ${
                fieldErrors.lastName ? 'border-red-500/60' : 'border-white/15'
              } focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600`}
            />
            {fieldErrors.lastName && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.lastName}</p>
            )}
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
            onChange={isEmailLocked ? undefined : handleChange}
            onBlur={isEmailLocked ? undefined : handleBlur}
            placeholder="Email Address"
            autoComplete="email"
            readOnly={isEmailLocked}
            aria-invalid={!!fieldErrors.email}
            aria-readonly={isEmailLocked}
            className={`w-full border text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600 ${
              isEmailLocked
                ? 'bg-[#141720]/60 border-white/10 text-gray-400 cursor-not-allowed'
                : `bg-[#141720] ${
                    fieldErrors.email ? 'border-red-500/60' : 'border-white/15'
                  } focus:border-white text-white`
            }`}
          />
          {isEmailLocked ? (
            <p className="mt-1.5 text-xs text-gray-500">
              Using the email on your account. Update it in your profile settings to change it.
            </p>
          ) : (
            fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
            )
          )}
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