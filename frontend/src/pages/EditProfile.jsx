import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

import { updateUser } from '../redux/authSlice';

const NAME_REGEX = /^[A-Za-z]+$/;

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .matches(NAME_REGEX, 'Only letters are allowed')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be at most 50 characters'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .matches(NAME_REGEX, 'Only letters are allowed')
    .min(2, 'Must be at least 2 characters')
    .max(50, 'Must be at most 50 characters'),
  email: Yup.string()
    .transform((value) => (value ? value.trim().toLowerCase() : value))
    .required('Email address is required')
    .email('Please enter a valid email address'),
});

const inputClasses =
  'peer w-full border-0 border-b border-[rgba(116,120,120,0.4)] bg-transparent pt-4 pb-2 text-[16px] font-normal text-black outline-none transition-colors duration-300 placeholder-transparent focus:border-black';

const labelClasses =
  'absolute left-0 top-4 text-[16px] text-[#9A9C9C] transition-all duration-300 peer-focus:top-[-8px] peer-focus:text-[12px] peer-focus:uppercase peer-focus:tracking-[0.05em] peer-focus:text-[#5D5E63] peer-[:not(:placeholder-shown)]:top-[-8px] peer-[:not(:placeholder-shown)]:text-[12px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.05em] peer-[:not(:placeholder-shown)]:text-[#5D5E63]';

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1 text-[12px] text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
      {children}
    </p>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const user = useSelector((state) => state.auth?.user) || {};

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    // enableReinitialize so the form fills with the current user once the
    // redux state is available (it's already in memory on this route, but
    // this keeps the form correct if that ever changes).
    enableReinitialize: true,
    initialValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setFormError('');
      setSuccessMessage('');
      try {
        const res = await fetch('http://localhost:3000/apiuser/user/updateprofile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim().toLowerCase(),
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === false)) {
          if (res.status === 409) {
            setFieldError('email', 'An account with this email already exists');
          } else {
            setFormError((data && data.message) || 'Something went wrong. Please try again.');
          }
          return;
        }

        // Sync the new details into redux + localStorage so the rest of the
        // app (My Account header, navbar, etc.) reflects the change right away.
        dispatch(updateUser(data.user));
        setSuccessMessage('Profile updated successfully.');
        setTimeout(() => navigate('/myaccount'), 1200);
      } catch {
        setFormError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="w-full flex justify-center bg-[#F9F9F9] px-5 py-16">
      <div className="w-full max-w-[448px]">
        <h1
          className="mb-2 text-black"
          style={{ fontFamily: "'Libre Caslon Text', serif", fontSize: '32px', fontWeight: 400, lineHeight: '40px' }}
        >
          Edit Profile
        </h1>
        <p className="mb-10" style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#5D5E63' }}>
          Update your name and email address.
        </p>

        {successMessage ? (
          <p className="text-sm text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
            {successMessage}
          </p>
        ) : (
          <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  autoComplete="given-name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClasses}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <label htmlFor="firstName" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                  First Name
                </label>
                {formik.touched.firstName && <FieldError>{formik.errors.firstName}</FieldError>}
              </div>

              <div className="relative">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={inputClasses}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <label htmlFor="lastName" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                  Last Name
                </label>
                {formik.touched.lastName && <FieldError>{formik.errors.lastName}</FieldError>}
              </div>
            </div>

            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputClasses}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <label htmlFor="email" className={labelClasses} style={{ fontFamily: 'Inter, sans-serif' }}>
                Email Address
              </label>
              {formik.touched.email && <FieldError>{formik.errors.email}</FieldError>}
            </div>

            {formError && <FieldError>{formError}</FieldError>}

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-black text-white transition-colors duration-300 hover:bg-[#333333] active:scale-[0.98] disabled:opacity-70"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '20px',
              }}
            >
              {formik.isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>

            <Link
              to="/myaccount"
              className="text-center"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 600, color: '#5D5E63' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5D5E63')}
            >
              Cancel and return to My Account
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
