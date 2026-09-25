import React, { useEffect, useState, useCallback } from "react";
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
  MessageSquare, 
  Phone, 
  X,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useApi } from "../hooks/useApi";
import { setAddresses, removeAddressLocal } from "../redux/addressSlice";
import { logout, updateUser } from "../redux/authSlice";

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
    title: "Wishlist", 
    subtitle: "Your reserved & curated haute horlogerie timepieces",
    icon: Heart, 
    route: "/wishlist" 
  },
  { 
    key: "security", 
    title: "Security & Devices", 
    subtitle: "Manage 256-bit encrypted keys, passcodes & logged-in devices",
    icon: Shield, 
    route: "/security" 
  },
  { 
    key: "enquiry", 
    title: "Enquiry", 
    subtitle: "Submit personal inquiries & bespoke service requests",
    icon: MessageSquare, 
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
    .matches(/^\d{4,6}$/, "Enter a valid postal code")
    .required("Postal code is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Enter a valid 10-digit mobile number")
    .required("Phone number is required"),
});

function formatLastActive(dateString, isCurrent) {
  if (isCurrent) return 'Active now (This device)';
  if (!dateString) return 'Active recently';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return 'Active just now';
  if (diffMins < 60) return `Active ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `Active ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `Active ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function DeviceIcon({ type }) {
  if (type === 'Mobile') {
    return <Smartphone size={18} className="text-gray-300" />;
  }
  if (type === 'Tablet') {
    return <Tablet size={18} className="text-gray-300" />;
  }
  return <Laptop size={18} className="text-gray-300" />;
}

/* =========================================================
   ADDRESS FORM MODAL
   ========================================================= */
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
        let res;
        if (isEdit) {
          res = await put(`/apiuser/user/editaddress/${initialValues._id}`, values);
        } else {
          res = await post("/apiuser/user/address", values);
        }
        toast.success(isEdit ? "Address updated" : "Address added");
        onSaved(res?.addresses || []);
      } catch (err) {
        setSubmitError(err?.message || "Could not save address. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0E1015] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <MapPin size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isEdit ? "Edit Residence" : "Add Delivery Residence"}
            </h3>
            <p className="text-xs text-gray-400">Specify precise delivery coordinates</p>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 mb-4">
            {submitError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-400 text-[10px] mt-1">{formik.errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-400 text-[10px] mt-1">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Street Address / Residence
            </label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-400 text-[10px] mt-1">{formik.errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
              />
              {formik.touched.city && formik.errors.city && (
                <p className="text-red-400 text-[10px] mt-1">{formik.errors.city}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
              />
              {formik.touched.state && formik.errors.state && (
                <p className="text-red-400 text-[10px] mt-1">{formik.errors.state}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <p className="text-red-400 text-[10px] mt-1">{formik.errors.pincode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="10-digit mobile"
              className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-400 text-[10px] mt-1">{formik.errors.phone}</p>
            )}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              name="isDefault"
              checked={formik.values.isDefault}
              onChange={formik.handleChange}
              className="w-4 h-4 rounded bg-[#141720] border-white/20 text-white focus:ring-0"
            />
            <span className="text-xs text-gray-300 font-medium">Set as primary delivery residence</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10 mt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-lg disabled:opacity-50"
            >
              {formik.isSubmitting ? "Saving…" : isEdit ? "Update Residence" : "Save Residence"}
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

/* =========================================================
   MOBILE UPDATE MODAL
   ========================================================= */
function MobileUpdateModal({ currentMobile, onClose, onUpdated, post, put }) {
  const [step, setStep] = useState("input"); // 'input' | 'otp' | 'success'
  const [newMobileNumber, setNewMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    const cleaned = newMobileNumber.trim();
    if (!/^[0-9]{10}$/.test(cleaned)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (cleaned === currentMobile) {
      setError("This is already your current mobile number");
      return;
    }

    setLoading(true);
    try {
      await post("/apiuser/user/send-mobile-change-otp", {
        newMobileNumber: cleaned,
      });
      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (err) {
      setError(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndUpdate = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await post("/apiuser/user/verify-mobile-change-otp", {
        otp: otp.trim(),
      });
      const res = await put("/apiuser/user/update-mobile-number", {
        newMobileNumber: newMobileNumber.trim(),
      });
      toast.success("Mobile number updated successfully");
      onUpdated(res?.user, newMobileNumber.trim());
      setStep("success");
    } catch (err) {
      setError(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await post("/apiuser/user/send-mobile-change-otp", {
        newMobileNumber: newMobileNumber.trim(),
      });
      toast.success("New OTP sent to your email");
    } catch (err) {
      setError(err?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 sm:px-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#0E1015] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Phone size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {currentMobile ? "Change Mobile Number" : "Add Mobile Number"}
            </h3>
            <p className="text-xs text-gray-400">Requires 256-bit email OTP authentication</p>
          </div>
        </div>

        {step === "input" && (
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                New Mobile Number
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-[#141720] border border-white/15 text-white text-xs px-3.5 py-3 rounded-xl font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={newMobileNumber}
                  onChange={(e) => setNewMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 10 digits"
                  className="flex-1 bg-[#141720] border border-white/15 focus:border-white text-white text-xs rounded-xl px-3.5 py-3 outline-none"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-[10px] mt-1.5">{error}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/10 mt-2">
              <button
                type="submit"
                disabled={loading || newMobileNumber.length !== 10}
                className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Sending OTP…" : "Send OTP"}
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
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyAndUpdate} className="flex flex-col gap-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              We sent a 6-digit code to your registered email for security verification.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Enter Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3 outline-none tracking-[0.3em] text-center"
                autoFocus
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-[11px] text-gray-400 hover:text-white uppercase tracking-wider font-bold self-start disabled:opacity-50"
            >
              Resend OTP
            </button>

            <div className="flex flex-col sm:flex-row gap-3 mt-2 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify & Update"}
              </button>
              <button
                type="button"
                onClick={() => setStep("input")}
                className="flex-1 border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full transition-colors"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black">
              <Check size={26} />
            </div>
            <p className="text-sm text-gray-300">
              Your mobile number is now <span className="text-white font-semibold">{newMobileNumber}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LOGOUT CONFIRMATION MODAL
   ========================================================= */
function LogoutConfirmModal({ onClose, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 sm:px-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0E1015] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center"
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-4">
          <LogOut size={20} />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight mb-1.5">Sign Out?</h3>
        <p className="text-xs text-gray-400 mb-6">
          You'll need to sign in again to access your account, orders, and saved residences.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded-full transition-all shadow-lg"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider py-3.5 rounded-full transition-colors"
          >
            Cancel
          </button>
        </div>
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
  const displayedMobile = user.mobileNumber;

  const addresses = useSelector((state) => state.address?.items) || [];
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [modalTarget, setModalTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Mobile number update modal
  const [showMobileModal, setShowMobileModal] = useState(false);

  // Logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sessions state in MyAccount
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [terminatingSessionId, setTerminatingSessionId] = useState(null);
  const [terminatingOthers, setTerminatingOthers] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await get("/apiuser/user/profile");
      if (res?.userDetails) {
        dispatch(updateUser(res.userDetails));
      }
    } catch {
      // ignore
    }
  };

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

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await get("/apiuser/user/sessions", { allowForbidden: true, allowNotFound: true });
      setSessions(res?.sessions || []);
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin/profile", { replace: true });
      return;
    }
    fetchAddresses();
    fetchUserProfile();
    fetchSessions();
  }, [user?.role]);

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
      toast.success("Address deleted successfully");
    } catch {
      dispatch(setAddresses(prev));
      toast.error("Could not delete address. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    setBusyId(addressId);
    try {
      const res = await patch(`/apiuser/user/default/${addressId}`);
      dispatch(setAddresses(res?.addresses || []));
      toast.success("Default address updated");
    } catch {
      toast.error("Could not set default address. Please try again.");
      fetchAddresses();
    } finally {
      setBusyId(null);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    setTerminatingSessionId(sessionId);
    try {
      const res = await del(`/apiuser/user/sessions/${sessionId}`);
      if (res?.isCurrentDeleted) {
        dispatch(logout());
        toast.success("Current session ended");
        navigate("/login");
        return;
      }
      setSessions(res?.sessions || []);
      toast.success("Device signed out successfully");
    } catch {
      toast.error("Failed to sign out device");
    } finally {
      setTerminatingSessionId(null);
    }
  };

  const handleLogoutOthers = async () => {
    if (!window.confirm("Are you sure you want to sign out all other devices?")) return;
    setTerminatingOthers(true);
    try {
      const res = await del("/apiuser/user/sessions/others");
      setSessions(res?.sessions || []);
      toast.success("Signed out all other active sessions");
    } catch {
      toast.error("Failed to sign out other sessions");
    } finally {
      setTerminatingOthers(false);
    }
  };

  // Called only after the user confirms in LogoutConfirmModal
  const handleConfirmLogout = () => {
    dispatch(logout());
    toast.success("Signed out successfully");
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const handleMobileUpdated = (updatedUser, newMobile) => {
    if (updatedUser) {
      dispatch(updateUser(updatedUser));
    } else {
      dispatch(updateUser({ mobileNumber: newMobile }));
    }
  };

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const otherSessionsCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#0E1015",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            fontSize: "13px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#FFFFFF", secondary: "#0E1015" },
          },
          error: {
            iconTheme: { primary: "#F87171", secondary: "#0E1015" },
          },
        }}
      />

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
                <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight inline-flex items-center gap-2.5">
                  {displayName}
                  <button
                    type="button"
                    onClick={() => navigate("/edit-profile")}
                    className="text-gray-500 hover:text-white transition-colors"
                    aria-label="Edit name"
                  >
                    <Edit3 size={16} />
                  </button>
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    {user.email || "client@chronos.com"}
                    <button
                      type="button"
                      onClick={() => navigate("/edit-profile")}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors underline underline-offset-2"
                    >
                      Change
                    </button>
                  </span>
                  {displayedMobile ? (
                    <span className="inline-flex items-center gap-1.5">
                      • {user.countryCode || "+91"} {displayedMobile}
                      <button
                        type="button"
                        onClick={() => setShowMobileModal(true)}
                        className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors underline underline-offset-2"
                      >
                        Change
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMobileModal(true)}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors underline underline-offset-2"
                    >
                      Add mobile number
                    </button>
                  )}
                  {user.gender && <span>• Gender: {user.gender}</span>}
                  {user.dob && (
                    <span>
                      • DOB: {new Date(user.dob).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
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
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Membership Standards Sub-Strip */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold text-center">AUTHENTICATION</p>
              <p className="text-sm font-semibold text-white mt-0.5 text-center">256-Bit Encrypted</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold text-center">MANUFACTURE WARRANTY</p>
              <p className="text-sm font-semibold text-white mt-0.5 text-center">5-Year Global Care</p>
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

        {/* 3. ACTIVE DEVICE SESSIONS */}
        <section className="mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Active Device Sessions
                </h2>
                {sessions.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    {sessions.length} {sessions.length === 1 ? 'Device' : 'Devices'} Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time overview of devices currently authenticated with your account
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={fetchSessions}
                disabled={sessionsLoading}
                title="Refresh sessions"
                className="p-2.5 bg-[#0E1015] border border-white/10 hover:border-white/30 text-gray-400 hover:text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
              </button>

              {otherSessionsCount > 0 && (
                <button
                  type="button"
                  onClick={handleLogoutOthers}
                  disabled={terminatingOthers}
                  className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {terminatingOthers ? 'Signing out…' : 'Sign Out Other Devices'}
                </button>
              )}

              <Link
                to="/security"
                className="inline-flex items-center gap-1.5 border border-white/20 hover:border-white text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors"
              >
                <KeyRound size={13} />
                <span>Security Center</span>
              </Link>
            </div>
          </div>

          {sessionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="p-5 bg-[#0E1015] border border-white/10 rounded-2xl animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-32 h-3 bg-white/15 rounded" />
                    <div className="w-20 h-2 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-8 text-center">
              <Laptop size={30} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-300 font-medium">No active sessions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    session.isCurrent
                      ? "bg-[#12151E] border-white/40 shadow-xl"
                      : "bg-[#0E1015] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <DeviceIcon type={session.deviceType} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white truncate">
                          {session.device || `${session.browser} on ${session.os}`}
                        </p>
                        {session.isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            This Device
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1.5">
                        {session.ipAddress && (
                          <span className="flex items-center gap-1">
                            <Globe size={11} className="text-gray-500" />
                            {session.ipAddress}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-gray-500" />
                          {formatLastActive(session.lastActive, session.isCurrent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="text-[11px] text-gray-500">
                      Logged in {new Date(session.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>

                    {session.isCurrent ? (
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                        Primary Session
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTerminateSession(session.sessionId)}
                        disabled={terminatingSessionId === session.sessionId}
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-[11px] transition-colors disabled:opacity-50"
                      >
                        <LogOut size={12} />
                        <span>{terminatingSessionId === session.sessionId ? 'Signing out…' : 'Sign Out Device'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. SAVED RESIDENCES / DELIVERY ADDRESSES */}
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

        {/* 5. LOGOUT ACTION */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-end">
          <button
            onClick={() => setShowLogoutConfirm(true)}
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

      {showMobileModal && (
        <MobileUpdateModal
          currentMobile={user.mobileNumber}
          onClose={() => setShowMobileModal(false)}
          onUpdated={handleMobileUpdated}
          post={post}
          put={put}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleConfirmLogout}
        />
      )}
    </div>
  );
}