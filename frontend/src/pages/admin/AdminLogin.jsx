
import { useEffect, useRef, useState } from 'react';

import { useFormik } from 'formik';

import * as Yup from 'yup';

import { useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';

import { login } from '../../redux/authSlice';

import { LockKeyhole, Eye, EyeOff } from 'lucide-react';

import ReCAPTCHA from 'react-google-recaptcha';

import watchImage from '../../assets/admin-watch.avif';



const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const validationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .required('Email address is required')
    .matches(EMAIL_REGEX, 'Please enter a valid email address'),

  password: Yup.string()
    .required('Password is required'),

  // ================= PRIVACY CONSENT =================
  privacyConsent: Yup.boolean()
    .oneOf([true], 'You must agree to the Privacy Policy')
    .required('You must agree to the Privacy Policy'),
});



export default function AdminLogin() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [authError, setAuthError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [imageHovered, setImageHovered] = useState(false);

  const [captchaToken, setCaptchaToken] = useState(null);



  // ================= RECAPTCHA REF =================

  const recaptchaRef = useRef(null);



  const resetCaptcha = () => {

    setCaptchaToken(null);

    recaptchaRef.current?.reset();

  };



  // ==================================================

  // GOOGLE LOGIN CALLBACK

  // ==================================================

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const token = params.get('token');

    const userParam = params.get('user');

    if (!token || !userParam) {

      return;

    }

    try {

      const user = JSON.parse(

        decodeURIComponent(userParam)

      );

      // Make sure this is actually an admin

      if (user?.role !== 'admin') {

        setAuthError('Invalid admin Google account.');

        return;

      }

      dispatch(

        login({

          token,

          user,

        })

      );

      // Remove token/user from browser URL

      window.history.replaceState(

        {},

        document.title,

        window.location.pathname

      );

      navigate('/admin/dashboard');

    } catch (error) {

      console.error(

        'ADMIN GOOGLE LOGIN ERROR:',

        error

      );

      setAuthError(

        'Google login failed. Please try again.'

      );

    }

  }, [dispatch, navigate]);



  // ==================================================

  // GOOGLE LOGIN BUTTON

  // ==================================================

  const handleGoogleLogin = () => {

    // Privacy consent check

    if (!formik.values.privacyConsent) {

      formik.setFieldTouched(

        'privacyConsent',

        true

      );

      setAuthError(

        'You must agree to the Privacy Policy'

      );

      return;

    }

    setAuthError('');

    window.location.href =

      `${import.meta.env.VITE_API_URL}/apiadmin/google/admin`;

  }



  // ==================================================

  // NORMAL ADMIN LOGIN

  // ==================================================

  const formik = useFormik({

    initialValues: {

      email: '',

      password: '',

      privacyConsent: false,

    },

    validationSchema,

    onSubmit: async (

      values,

      { setSubmitting }

    ) => {

      setAuthError('');

      // RECAPTCHA CHECK

      if (!captchaToken) {

        setAuthError(

          'Please complete the reCAPTCHA.'

        );

        setSubmitting(false);

        return;

      }

      try {

        const res = await fetch(

          `${import.meta.env.VITE_API_URL}/apiadmin/admin/login`,

          {

            method: 'POST',

            headers: {

              'Content-Type': 'application/json',

            },

            body: JSON.stringify({

              email: values.email,

              password: values.password,

              captchaToken,

            }),

          }

        );



        const data = await res.json();



        if (!res.ok) {

          setAuthError(

            data.message ||

            'Invalid email or password'

          );

          resetCaptcha();

          return;

        }



        if (data.user?.role !== 'admin') {

          setAuthError(

            'Invalid email or password'

          );

          resetCaptcha();

          return;

        }



        dispatch(

          login({

            token: data.token,

            user: data.user,

          })

        );



        navigate('/admin/dashboard');



      } catch (error) {
        console.error(
          'ADMIN LOGIN ERROR:',
          error
        );
        setAuthError(
          error.message || 'Unable to connect to server. Please try again.'
        );
        resetCaptcha();
      } finally {

        setSubmitting(false);

      }

    },

  });



  return (

    <main className="relative flex w-full min-h-screen items-center justify-center overflow-hidden bg-[#F9F9F9] p-4 sm:p-5 lg:p-10">

      {/* Ambient background */}

      <div className="pointer-events-none absolute -right-[10%] -top-[10%] z-0 h-[120%] w-[60%] opacity-[0.03]">

        <div className="h-full w-full rotate-12 bg-black" />

      </div>



      {/* Login container */}

      <section className="relative z-10 flex w-full max-w-full flex-col items-center bg-[#F9F9F9] sm:max-w-[380px] lg:max-w-[420px]">



        {/* Header */}

        <header className="mb-8 flex flex-col items-center text-center">

          <div className="mb-4 inline-block">

            <LockKeyhole

              size={48}

              strokeWidth={1}

              className="mx-auto text-black"

            />

          </div>



          <h1

            className="mb-2 text-[20px] leading-[32px] tracking-[-0.02em] text-black sm:text-[22px] lg:text-[24px]"

            style={{

              fontFamily: "'Libre Caslon Text', serif",

              fontWeight: 400,

            }}

          >

            ADMIN

          </h1>



          <p

            className="text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#5D5E63]"

            style={{

              fontFamily: 'Inter, sans-serif'

            }}

          >

            Restricted Access

          </p>

        </header>



        {/* Login form container */}

        <div className="w-full border border-[rgba(93,94,99,0.10)] bg-white p-6 shadow-sm sm:p-8">

          <form

            onSubmit={formik.handleSubmit}

            className="flex flex-col gap-6 sm:gap-8"

            noValidate

          >



            {/* Email Field */}

            <div className="relative flex flex-col">

              <label

                htmlFor="email"

                className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"

                style={{

                  fontFamily: 'Inter, sans-serif'

                }}

              >

                Email Address

              </label>



              <input

                id="email"

                name="email"

                type="email"

                autoComplete="username"

                placeholder="admin@example.com"

                value={formik.values.email}

                onChange={(e) => {

                  formik.setFieldValue(

                    'email',

                    e.target.value.trim()

                  );

                }}

                onBlur={formik.handleBlur}

                className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"

                style={{

                  fontFamily: 'Inter, sans-serif'

                }}

              />



              {formik.touched.email &&

                formik.errors.email && (

                  <p

                    className="mt-1 text-[10px] text-red-600"

                    style={{

                      fontFamily: 'Inter, sans-serif'

                    }}

                  >

                    {formik.errors.email}

                  </p>

                )}

            </div>



            {/* Password Field */}

            <div className="relative flex flex-col">

              <label

                htmlFor="password"

                className="mb-1 text-[10px] font-medium uppercase tracking-[0.05em] text-[#5D5E63]"

                style={{

                  fontFamily: 'Inter, sans-serif'

                }}

              >

                Password

              </label>



              <div className="relative flex items-center">

                <input

                  id="password"

                  name="password"

                  type={

                    showPassword

                      ? 'text'

                      : 'password'

                  }

                  autoComplete="current-password"

                  placeholder="••••••••"

                  value={formik.values.password}

                  onChange={formik.handleChange}

                  onBlur={formik.handleBlur}

                  className="w-full border-0 border-b border-[rgba(93,94,99,0.30)] bg-transparent py-3 pr-10 text-[16px] font-normal text-[#1A1C1C] outline-none transition-colors duration-200 placeholder:text-[#C4C7C7] focus:border-black"

                  style={{

                    fontFamily: 'Inter, sans-serif'

                  }}

                />



                <button

                  type="button"

                  onClick={() =>

                    setShowPassword((s) => !s)

                  }

                  className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#5D5E63] transition-colors hover:text-black"

                  tabIndex={-1}

                  aria-label={

                    showPassword

                      ? 'Hide password'

                      : 'Show password'

                  }

                >

                  {showPassword

                    ? <EyeOff size={18} />

                    : <Eye size={18} />

                  }

                </button>

              </div>



              {formik.touched.password &&

                formik.errors.password && (

                  <p

                    className="mt-1 break-words text-[10px] text-red-600"

                    style={{

                      fontFamily: 'Inter, sans-serif'

                    }}

                  >

                    {formik.errors.password}

                  </p>

                )}

            </div>



            {/* PRIVACY CONSENT */}

            <div>

              <label className="flex cursor-pointer items-start gap-2">

                <input

                  type="checkbox"

                  name="privacyConsent"

                  checked={

                    formik.values.privacyConsent

                  }

                  onChange={formik.handleChange}

                  onBlur={formik.handleBlur}

                  className="mt-0.5 shrink-0 accent-black"

                />



                <span

                  className="text-[11px] leading-5 text-[#5D5E63]"

                  style={{

                    fontFamily: 'Inter, sans-serif'

                  }}

                >

                  I agree to the{' '}

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



              {formik.touched.privacyConsent &&

                formik.errors.privacyConsent && (

                  <p

                    className="ml-6 mt-1 text-[10px] text-red-600"

                    style={{

                      fontFamily: 'Inter, sans-serif'

                    }}

                  >

                    {formik.errors.privacyConsent}

                  </p>

                )}

            </div>



            {/* Auth Error */}

            {authError && (

              <p

                className="-mt-2 break-words text-[10px] text-red-600 sm:-mt-4"

                style={{

                  fontFamily: 'Inter, sans-serif'

                }}

              >

                {authError}

              </p>

            )}



            {/* GOOGLE RECAPTCHA */}

            <div className="mt-2">

              <ReCAPTCHA

                ref={recaptchaRef}

                sitekey={

                  import.meta.env

                    .VITE_RECAPTCHA_SITE_KEY

                }

                onChange={(token) =>

                  setCaptchaToken(token)

                }

                onExpired={() =>

                  setCaptchaToken(null)

                }

                onErrored={() =>

                  setCaptchaToken(null)

                }

              />

            </div>



            {/* Sign In Button */}

            <button

              type="submit"

              disabled={formik.isSubmitting}

              className="w-full bg-black px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-[#5F5E5E] active:scale-[0.98] disabled:opacity-80"

              style={{

                fontFamily: 'Inter, sans-serif'

              }}

            >

              {formik.isSubmitting

                ? 'Signing In…'

                : 'Sign In'}

            </button>



            {/* ================= GOOGLE LOGIN ================= */}

            <div className="flex items-center gap-3">

              <div className="h-px flex-1 bg-[#E5E5E5]" />

              <span

                className="text-[10px] uppercase tracking-[0.1em] text-[#858383]"

                style={{

                  fontFamily: 'Inter, sans-serif'

                }}

              >

                Or

              </span>

              <div className="h-px flex-1 bg-[#E5E5E5]" />

            </div>



            <button

              type="button"

              onClick={handleGoogleLogin}

              className="flex w-full items-center justify-center gap-3 border border-[#DADCE0] bg-white px-6 py-3.5 text-[13px] font-medium tracking-normal text-[#3C4043] transition-all duration-200 hover:bg-[#F8F9FA] hover:shadow-sm active:scale-[0.98]"

              style={{

                fontFamily: 'Inter, sans-serif'

              }}

            >

              {/* Google G Logo */}

              <svg

                width="20"

                height="20"

                viewBox="0 0 24 24"

                aria-hidden="true"

              >

                <path

                  fill="#4285F4"

                  d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42z"

                />

                <path

                  fill="#34A853"

                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.75z"

                />

                <path

                  fill="#FBBC05"

                  d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.36l3.25-2.53z"

                />

                <path

                  fill="#EA4335"

                  d="M12 6.14c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.21 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.39l3.25 2.53 3.25 2.53C7.31 7.86 9.46 6.14 12 6.14z"

                />

              </svg>

              <span>Continue with Google</span>

            </button>



            {/* Forgot Password Link */}

            <a

              href="/admin/reset-request"

              className="self-center text-center text-[10px] font-medium text-[#5D5E63] underline decoration-1 underline-offset-4 hover:text-black"

              style={{

                fontFamily: 'Inter, sans-serif'

              }}

            >

              Request credential reset

            </a>

          </form>

        </div>



        {/* Footer */}

        <footer className="mt-8 text-center">

          <p

            className="mx-auto max-w-[280px] text-[10px] leading-relaxed text-[#858383]"

            style={{

              fontFamily: 'Inter, sans-serif'

            }}

          >

            This area is restricted to authorized administrators.

            All access attempts are logged and monitored.

          </p>

        </footer>

      </section>



      {/* Left Decorative Watch Image */}

      <div

        className="absolute bottom-20 left-20 z-[1] hidden w-64 opacity-20 lg:block"

        onMouseEnter={() =>

          setImageHovered(true)

        }

        onMouseLeave={() =>

          setImageHovered(false)

        }

      >

        <div

          className="aspect-[3/4] w-full bg-cover bg-center bg-no-repeat transition-[filter] duration-700 ease-out"

          style={{

            backgroundImage:

              `url(${watchImage})`,

            filter: imageHovered

              ? 'grayscale(0%)'

              : 'grayscale(100%)',

          }}

        />

      </div>

    </main>

  );

}
