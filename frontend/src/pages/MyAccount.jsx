import React, { useEffect, useState } from "react";
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
  UserCheck,
  MessageSquare
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { setAddresses, removeAddressLocal } from "../redux/addressSlice";
import { logout } from "../redux/authSlice";

const QUICK_ACCESS_CARDS = [
  { 
    key: "orders", 
    title: "My Orders", 
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
    key: "enquiry", 
    title: "Enquiry", 
    subtitle: "Submit personal inquiries & bespoke service requests",
    icon: MessageSquare, 
    route: "/enquiry" 
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
    .matches(/^\d{4,6}$/, "Enter a valid postal code")
    .required("Postal code is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number")
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
          ? await put(`/apiuser/user/editaddress/${initialValues._id}`, values)
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
      const res = await del(`/apiuser/user/deleteaddress/${addressId}`);
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
      const res = await patch(`/apiuser/user/default/${addressId}`);
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
                  className={`bg-[#0E1015] border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    addr.isDefault ? "border-white/50 bg-[#12151C]" : "border-white/10"
                  }`}
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
