const fs = require('fs');
const path = require('path');

const targetDir = '/Users/shahan/Documents/ecom-watch';
const files = {};

// =========================================================================
// 1. MyAccount.jsx
// =========================================================================
files['frontend/src/pages/MyAccount.jsx'] = `import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  ShoppingBag, 
  Heart, 
  Shield, 
  Compass, 
  Sparkles, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  LogOut, 
  ChevronRight, 
  Award,
  Clock,
  UserCheck
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { setAddresses, removeAddressLocal } from "../redux/addressSlice";
import { logout } from "../redux/authSlice";

const QUICK_ACCESS_CARDS = [
  { 
    key: "orders", 
    title: "Timepiece Acquisitions", 
    subtitle: "Track ordered complications & private courier delivery",
    icon: ShoppingBag, 
    route: "/my-orders" 
  },
  { 
    key: "wishlist", 
    title: "Private Vault (Wishlist)", 
    subtitle: "Your reserved & curated haute horlogerie timepieces",
    icon: Heart, 
    route: "/wishlist" 
  },
  { 
    key: "security", 
    title: "Security & Keys", 
    subtitle: "Manage 256-bit encrypted credentials and passcodes",
    icon: Shield, 
    route: "/security" 
  },
  { 
    key: "concierge", 
    title: "Geneva Concierge", 
    subtitle: "Bespoke watchmaker appointments & salon viewings",
    icon: Compass, 
    route: "/contact" 
  },
];

const addressSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  address: Yup.string().trim().required("Residence address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  pincode: Yup.string()
    .trim()
    .matches(/^\\d{4,6}$/, "Enter a valid postal code")
    .required("Postal code is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\\d{10}$/, "Enter a valid 10-digit mobile number")
    .required("Phone number is required"),
});

function AddressFormModal({ initialValues, onClose, onSaved, post, put }) {
  const isEdit = Boolean(initialValues?._id);
  const [submitError, setSubmitError] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: initialValues?.firstName || "",
      lastName: initialValues?.lastName || "",
      address: initialValues?.address || "",
      city: initialValues?.city || "",
      state: initialValues?.state || "",
      pincode: initialValues?.pincode || "",
      phone: initialValues?.phone || "",
      isDefault: initialValues?.isDefault || false,
    },
    validationSchema: addressSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");
      try {
        const res = isEdit
          ? await put(\`/apiuser/user/editaddress/\${initialValues._id}\`, values)
          : await post("/apiuser/user/address", values);
        onSaved(res?.addresses || []);
      } catch (err) {
        setSubmitError(err.message || "Could not save address. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const inputClass =
    "w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-gray-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 sm:px-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0E1015] border border-white/20 rounded-3xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            <MapPin size={16} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isEdit ? "Edit Client Residence" : "Add Delivery Address"}
            </h3>
            <p className="text-xs text-gray-400">For secure, insured timepiece delivery</p>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Jean"
                className={inputClass}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-400 text-xs mt-1">{formik.errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Dufour"
                className={inputClass}
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-400 text-xs mt-1">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Street Address</label>
            <input
              type="text"
              name="address"
              placeholder="Rue du Rhône 42"
              className={inputClass}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-400 text-xs mt-1">{formik.errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">City</label>
              <input
                type="text"
                name="city"
                placeholder="Geneva"
                className={inputClass}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.city && formik.errors.city && (
                <p className="text-red-400 text-xs mt-1">{formik.errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">State / Canton</label>
              <input
                type="text"
                name="state"
                placeholder="Geneva"
                className={inputClass}
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state && (
                <p className="text-red-400 text-xs mt-1">{formik.errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Postal Code</label>
              <input
                type="text"
                name="pincode"
                placeholder="1204"
                className={inputClass}
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <p className="text-red-400 text-xs mt-1">{formik.errors.pincode}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">Mobile Number</label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                placeholder="9876543210"
                className={inputClass}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-400 text-xs mt-1">{formik.errors.phone}</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="isDefault"
              checked={formik.values.isDefault}
              onChange={formik.handleChange}
              className="w-4 h-4 rounded accent-white cursor-pointer"
            />
            <span>Set as primary delivery residence</span>
          </label>

          {submitError && <p className="text-red-400 text-xs">{submitError}</p>}

          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-lg disabled:opacity-50"
            >
              {formik.isSubmitting ? "Saving…" : "Save Residence"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { get, post, put, del, patch } = useApi();

  const user = useSelector((state) => state.auth?.user) || {};
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Valued Client';

  const addresses = useSelector((state) => state.address?.items) || [];
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [modalTarget, setModalTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError("");
    try {
      const res = await get("/apiuser/user/getaddress");
      dispatch(setAddresses(res?.addresses || []));
    } catch {
      setAddressesError("Unable to load addresses right now.");
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleSaved = (fullList) => {
    dispatch(setAddresses(fullList));
    setModalTarget(null);
  };

  const handleDelete = async (addressId) => {
    const prev = addresses;
    setBusyId(addressId);
    dispatch(removeAddressLocal(addressId));
    try {
      const res = await del(\`/apiuser/user/deleteaddress/\${addressId}\`);
      dispatch(setAddresses(res?.addresses || []));
    } catch {
      dispatch(setAddresses(prev));
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    setBusyId(addressId);
    try {
      const res = await patch(\`/apiuser/user/default/\${addressId}\`);
      dispatch(setAddresses(res?.addresses || []));
    } catch {
      fetchAddresses();
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">
      
      {/* Background Ambient Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 py-12 sm:py-20 relative z-10">
        
        {/* 1. CLIENT PROFILE HEADER CARD */}
        <div className="relative bg-[#0E1015] border border-white/15 rounded-3xl p-6 sm:p-12 shadow-2xl mb-12 overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
            <Award size={180} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              
              {/* Monogram Avatar with Platinum Ring */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#161922] border-2 border-white/30 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold tracking-wider shadow-xl shrink-0">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{initials || "CH"}</span>
                )}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center text-black shadow-md">
                  <UserCheck size={14} />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-2">
                  <Sparkles size={11} />
                  Privé Guild Client
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                  <span>{user.email || "client@chronos.com"}</span>
                  {user.mobileNumber && <span>• {user.countryCode || "+91"} {user.mobileNumber}</span>}
                </div>
              </div>

            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/edit-profile")}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider px-6 py-3.5 rounded-full transition-all shadow-md"
              >
                <Edit3 size={14} />
                <span>Edit Dossier</span>
              </button>
              <button
                onClick={() => navigate("/security")}
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full transition-colors"
              >
                <Shield size={14} />
                <span>Security</span>
              </button>
            </div>

          </div>

          {/* Membership Standards Sub-Strip */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">ACCOUNT TIER</p>
              <p className="text-sm font-semibold text-white mt-0.5">Geneva Collector</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">AUTHENTICATION</p>
              <p className="text-sm font-semibold text-white mt-0.5">256-Bit Encrypted</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">MANUFACTURE WARRANTY</p>
              <p className="text-sm font-semibold text-white mt-0.5">5-Year Global Care</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">CLIENT CONCIERGE</p>
              <p className="text-sm font-semibold text-white mt-0.5">Geneva Salon Direct</p>
            </div>
          </div>

        </div>

        {/* 2. QUICK ACCESS CARDS GRID */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Client Portal Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUICK_ACCESS_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  onClick={() => card.route && navigate(card.route)}
                  className="group text-left bg-[#0E1015] border border-white/10 hover:border-white/40 p-6 rounded-2xl transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors mb-4">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-gray-200 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-normal">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-white transition-colors">
                    <span>Access View</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. SAVED RESIDENCES / DELIVERY ADDRESSES */}
        <section className="mb-14">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Registered Delivery Residences
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Direct address destination for secure courier dispatch</p>
            </div>

            <button
              onClick={() => setModalTarget({})}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md"
            >
              <Plus size={14} />
              <span>Add Residence</span>
            </button>
          </div>

          {addressesLoading && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading addresses…
            </div>
          )}

          {!addressesLoading && addressesError && (
            <p className="py-10 text-center text-red-400 text-sm">{addressesError}</p>
          )}

          {!addressesLoading && !addressesError && addresses.length === 0 && (
            <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-10 text-center">
              <MapPin size={32} className="text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-300 font-medium">No registered delivery residences.</p>
              <p className="text-xs text-gray-500 mt-1">Add your address for seamless order checkouts.</p>
            </div>
          )}

          {!addressesLoading && !addressesError && addresses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={\`bg-[#0E1015] border rounded-2xl p-6 flex flex-col justify-between transition-all \${
                    addr.isDefault ? "border-white/50 bg-[#12151C]" : "border-white/10"
                  }\`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="text-sm font-bold text-white">
                        {addr.firstName} {addr.lastName}
                      </p>
                      {addr.isDefault && (
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-white text-black px-2.5 py-1 rounded-full">
                          Primary Residence
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Phone: {addr.phone}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setModalTarget(addr)}
                      className="text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      disabled={busyId === addr._id}
                      className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        disabled={busyId === addr._id}
                        className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors disabled:opacity-50 ml-auto"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. LOGOUT ACTION */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Secure session authorized • Geneva standard
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out of Account</span>
          </button>
        </div>

      </div>

      {modalTarget !== null && (
        <AddressFormModal
          initialValues={modalTarget}
          onClose={() => setModalTarget(null)}
          onSaved={handleSaved}
          post={post}
          put={put}
        />
      )}
    </div>
  );
}
`;

// =========================================================================
// 2. EditProfile.jsx
// =========================================================================
files['frontend/src/pages/EditProfile.jsx'] = `import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, ArrowRight, Sparkles } from 'lucide-react';
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

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);
  const user = useSelector((state) => state.auth?.user) || {};

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
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
        const res = await fetch(\`\${(import.meta.env.VITE_API_URL || 'http://localhost:3000')}/apiuser/user/updateprofile\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: \`Bearer \${token}\`,
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

        dispatch(updateUser(data.user));
        setSuccessMessage('Client dossier updated successfully.');
        setTimeout(() => navigate('/myaccount'), 1200);
      } catch {
        setFormError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

      {/* Header */}
      <header className="w-full border-b border-white/10 bg-[#08090C]/80 backdrop-blur-xl px-6 py-5 sm:px-12 flex items-center justify-between z-20">
        <Link to="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white">CHRONOS</span>
          <span className="text-[8px] tracking-[0.35em] text-gray-400 uppercase font-semibold">Haute Horlogerie</span>
        </Link>
        <Link
          to="/myaccount"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </Link>
      </header>

      {/* Main Form */}
      <main className="relative flex-1 flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[460px] bg-[#0E1015]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] uppercase tracking-[0.25em] text-gray-300 mb-4">
              <Sparkles size={11} />
              Client Dossier
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Edit Profile
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
              Update your personal credentials and communication email.
            </p>
          </div>

          {successMessage ? (
            <div className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center text-sm font-medium text-white">
              {successMessage}
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Jean"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{formik.errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Dufour"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{formik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Client Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="client@chronos.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none transition-colors"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{formik.errors.email}</p>
                )}
              </div>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
              >
                <span>{formik.isSubmitting ? 'Saving Changes…' : 'Save Changes'}</span>
                <ArrowRight size={15} />
              </button>

              <div className="text-center mt-2">
                <Link
                  to="/myaccount"
                  className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  Cancel and return
                </Link>
              </div>
            </form>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[10px] text-gray-500 tracking-widest uppercase">
        256-Bit Encrypted Atelier Access • Geneva Standard
      </footer>
    </div>
  );
}
`;

// =========================================================================
// 3. Security.jsx
// =========================================================================
files['frontend/src/pages/Security.jsx'] = `import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, Shield, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$/;

const validationSchema = Yup.object({
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      passwordRegex,
      'Must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number and 1 special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});

const LIVE_RULES = [
  { key: 'length', label: 'Minimum 8 characters', test: (v) => v.length >= 8 },
  { key: 'upper', label: '1 uppercase & 1 lowercase letter', test: (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  {
    key: 'numberOrSymbol',
    label: '1 number & 1 special symbol',
    test: (v) => /\\d/.test(v) && /[^A-Za-z0-9]/.test(v),
  },
];

export default function Security() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formik = useFormik({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiError('');
      try {
        const res = await fetch(\`\${(import.meta.env.VITE_API_URL || 'http://localhost:3000')}/apiuser/user/updateprofile\`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: \`Bearer \${token}\`,
          },
          body: JSON.stringify({ password: values.newPassword }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || (data && data.status === false)) {
          setApiError((data && data.message) || 'Could not update password. Please try again.');
          return;
        }

        resetForm();
        setSuccessMessage('Password updated successfully. Please log in with your new key.');
        setTimeout(() => navigate('/login'), 1500);
      } catch {
        setApiError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white flex flex-col justify-between font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_0%,_transparent_70%)] pointer-events-none" />

      <header className="w-full border-b border-white/10 bg-[#08090C]/80 backdrop-blur-xl px-6 py-5 sm:px-12 flex items-center justify-between z-20">
        <Link to="/" className="flex flex-col group">
          <span className="text-xl sm:text-2xl font-bold tracking-[0.25em] text-white">CHRONOS</span>
          <span className="text-[8px] tracking-[0.35em] text-gray-400 uppercase font-semibold">Haute Horlogerie</span>
        </Link>
        <Link
          to="/myaccount"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 py-12 z-10">
        <div className="w-full max-w-[460px] bg-[#0E1015]/90 border border-white/15 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto mb-4">
              <KeyRound size={22} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Security &amp; Keys
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Update your master password to protect your client portfolio.
            </p>
          </div>

          {successMessage ? (
            <div className="p-4 bg-white/10 border border-white/20 rounded-2xl text-center text-sm font-medium text-white">
              {successMessage}
            </div>
          ) : (
            <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  New Security Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3.5 text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">{formik.errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 pr-11 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3.5 text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{formik.errors.confirmPassword}</p>
                )}
              </div>

              <div className="bg-[#141720] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Security Standard:</span>
                {LIVE_RULES.map((rule) => {
                  const met = rule.test(formik.values.newPassword);
                  return (
                    <div key={rule.key} className="flex items-center gap-2.5">
                      <span
                        className={\`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all \${
                          met ? 'bg-white text-black' : 'border border-white/30 text-transparent'
                        }\`}
                      >
                        {met && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span className={\`text-xs \${met ? 'text-white font-medium' : 'text-gray-400'}\`}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {apiError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all disabled:opacity-60"
              >
                <span>{formik.isSubmitting ? 'Updating Key…' : 'Update Password'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

        </div>
      </main>

      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-[10px] text-gray-500 tracking-widest uppercase">
        256-Bit Encrypted Atelier Access • Geneva Standard
      </footer>
    </div>
  );
}
`;

// Sync files directly to user workspace
for (const [relPath, content] of Object.entries(files)) {
  const targetFile = path.join(targetDir, relPath);
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Synchronized:', relPath);
}

console.log('Client profile suite successfully redesigned & updated!');
