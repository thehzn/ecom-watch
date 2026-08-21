// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";

// // Data-driven quick access cards — 3 cards from the BRD (My Orders, Wishlist,
// // Help Center), rendered in a responsive 2-col grid.
// const QUICK_ACCESS_CARDS = [
//   { key: "orders", title: "My Orders", route: "/my-orders" },
//   { key: "wishlist", title: "Wishlist", route: "/wishlist" },
//   { key: "help", title: "Help Center", route: null },
// ];

// const ADDITIONAL_LINKS = [
//   { label: "About Us", route: "/about" },
//   { label: "Terms & Policies", route: "/privacy-policy" },
//   { label: "FAQ", route: "/faq" },
// ];

// export default function MyAccount() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const user = useSelector((state) => state.auth?.user) || {};
//   // Backend stores firstName/lastName, not a combined "name" field.
//   const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

//   const handleLogout = () => {
//     // Assumed action name — swap for whatever your auth slice actually exports
//     dispatch({ type: "auth/logout" });
//     navigate("/login");
//   };

//   return (
//     <div className="w-full bg-[#F9F9F9] flex justify-center">
//       <div className="w-full max-w-screen-2xl px-16 py-16 font-['Inter']">
//         {/* Profile Header */}
//         <div className="flex items-center justify-between border-b border-[#C4C7C7] pb-8 mb-16">
//           <div className="flex items-center gap-6">
//             <img
//               src={user.profileImage || "/default-avatar.png"}
//               alt={displayName || "Profile"}
//               className="w-24 h-24 rounded-full object-cover bg-[#E2E2E2]"
//             />
//             <div>
//               <h1 className="font-['Libre_Caslon_Text'] text-[40px] font-normal text-black leading-tight">
//                 {displayName || "Guest"}
//               </h1>
//               <p className="text-base text-[#5D5E63] mt-2">
//                 {user.email || "—"}
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={() => navigate("/edit-profile")}
//             className="bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3 px-8 hover:opacity-90 transition-opacity"
//           >
//             Edit Profile
//           </button>
//         </div>

//         {/* Quick Access Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
//           {QUICK_ACCESS_CARDS.map((card) => (
//             <button
//               key={card.key}
//               onClick={() => card.route && navigate(card.route)}
//               className="text-left bg-white border border-[#E2E2E2] p-8 hover:border-black transition-colors"
//             >
//               <p className="font-['Inter'] text-xs font-semibold text-black uppercase tracking-wide">
//                 {card.title}
//               </p>
//               {card.key === "help" && (
//                 <>
//                   <p className="text-sm text-[#5D5E63] mt-2">
//                     Need a hand with an order, a return, or anything else?
//                   </p>
//                   <p className="text-sm text-black mt-1">support@chronos.com</p>
//                 </>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Additional Information */}
//         <div className="flex flex-col gap-4 mt-8">
//           {ADDITIONAL_LINKS.map((link) => (
//             <button
//               key={link.label}
//               onClick={() => navigate(link.route)}
//               className="text-left font-['Inter'] text-base font-normal text-black w-fit hover:opacity-70 transition-opacity"
//             >
//               {link.label}
//             </button>
//           ))}
//         </div>

//         {/* Logout */}
//         <button
//           onClick={handleLogout}
//           className="bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3 px-8 mt-8"
//           style={{ width: "220px" }}
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useApi } from "../hooks/useApi";
import { setAddresses, removeAddressLocal } from "../redux/addressSlice";

// Data-driven quick access cards — 3 cards from the BRD (My Orders, Wishlist,
// Help Center), rendered in a responsive 2-col grid.
const QUICK_ACCESS_CARDS = [
  { key: "orders", title: "My Orders", route: "/my-orders" },
  { key: "wishlist", title: "Wishlist", route: "/wishlist" },
  { key: "help", title: "Help Center", route: null },
];

const ADDITIONAL_LINKS = [
  { label: "About Us", route: "/about" },
  { label: "Terms & Policies", route: "/privacy-policy" },
  { label: "FAQ", route: "/faq" },
];

const addressSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  address: Yup.string().trim().required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  pincode: Yup.string()
    .trim()
    .matches(/^\d{4,6}$/, "Enter a valid pincode")
    .required("Pincode is required"),
  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
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
    "w-full border-b border-[#C4C7C7] py-3 bg-transparent font-['Inter'] text-sm text-black placeholder:text-[#5D5E63] focus:outline-none focus:border-black transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 sm:px-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white p-5 sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="font-['Libre_Caslon_Text'] text-lg sm:text-2xl font-normal text-black mb-5 sm:mb-6">
          {isEdit ? "Edit Address" : "Add New Address"}
        </h3>

        <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                className={inputClass}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.firstName}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                className={inputClass}
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <input
              type="text"
              name="address"
              placeholder="Address"
              className={inputClass}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <input
                type="text"
                name="city"
                placeholder="City"
                className={inputClass}
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.city && formik.errors.city && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.city}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="state"
                placeholder="State"
                className={inputClass}
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.state && formik.errors.state && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                className={inputClass}
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.pincode}</p>
              )}
            </div>
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone No"
                className={inputClass}
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.phone}</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-black">
            <input
              type="checkbox"
              name="isDefault"
              checked={formik.values.isDefault}
              onChange={formik.handleChange}
              className="accent-black"
            />
            Set as default address
          </label>

          {submitError && <p className="text-red-600 text-xs">{submitError}</p>}

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex-1 bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {formik.isSubmitting ? "Saving…" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-black text-black font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3.5 hover:bg-[#F3F3F4] transition-colors"
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
  // Backend stores firstName/lastName, not a combined "name" field.
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ');

  const addresses = useSelector((state) => state.address?.items) || [];
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [modalTarget, setModalTarget] = useState(null); // null | {} (new) | address (edit)
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError("");
    try {
      const res = await get("/apiuser/user/getaddress");
      dispatch(setAddresses(res?.addresses || []));
    } catch (err) {
      setAddressesError("Unable to load your addresses right now.");
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
      dispatch(setAddresses(prev)); // revert on failure
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
      fetchAddresses(); // resync on failure
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = () => {
    // Assumed action name — swap for whatever your auth slice actually exports
    dispatch({ type: "auth/logout" });
    navigate("/login");
  };

  return (
    <div className="w-full bg-[#F9F9F9] flex justify-center">
      <div className="w-full max-w-screen-2xl px-5 sm:px-10 lg:px-16 py-10 sm:py-16 font-['Inter']">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#C4C7C7] pb-8 mb-12 sm:mb-16">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={user.profileImage || "/default-avatar.png"}
              alt={displayName || "Profile"}
              className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover bg-[#E2E2E2]"
            />
            <div>
              <h1 className="font-['Libre_Caslon_Text'] text-2xl sm:text-[32px] lg:text-[40px] font-normal text-black leading-tight">
                {displayName || "Guest"}
              </h1>
              <p className="text-sm sm:text-base text-[#5D5E63] mt-1 sm:mt-2">
                {user.email || "—"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="self-start sm:self-auto bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3 px-6 sm:px-8 hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8">
          {QUICK_ACCESS_CARDS.map((card) => (
            <button
              key={card.key}
              onClick={() => card.route && navigate(card.route)}
              className="text-left bg-white border border-[#E2E2E2] p-5 sm:p-8 hover:border-black transition-colors"
            >
              <p className="font-['Inter'] text-xs font-semibold text-black uppercase tracking-wide">
                {card.title}
              </p>
              {card.key === "help" && (
                <>
                  <p className="text-sm text-[#5D5E63] mt-2">
                    Need a hand with an order, a return, or anything else?
                  </p>
                  <p className="text-sm text-black mt-1">support@chronos.com</p>
                </>
              )}
            </button>
          ))}
        </div>

        {/* Addresses */}
        <section className="mt-12 sm:mt-16">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="font-['Libre_Caslon_Text'] text-lg sm:text-xl md:text-2xl font-normal text-black">
              Saved Addresses
            </h2>
            <button
              onClick={() => setModalTarget({})}
              className="bg-black text-white font-['Inter'] text-[11px] sm:text-xs font-semibold uppercase tracking-wide py-2.5 px-4 sm:px-5 hover:opacity-90 transition-opacity"
            >
              Add New
            </button>
          </div>

          {addressesLoading && (
            <p className="text-sm text-[#5D5E63] py-8">Loading addresses…</p>
          )}

          {!addressesLoading && addressesError && (
            <p className="text-sm text-[#A32D2D] py-8">{addressesError}</p>
          )}

          {!addressesLoading && !addressesError && addresses.length === 0 && (
            <div className="bg-white border border-[#E2E2E2] p-8 text-center">
              <p className="text-sm text-[#5D5E63]">
                You haven't saved any addresses yet.
              </p>
            </div>
          )}

          {!addressesLoading && !addressesError && addresses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`bg-white border p-4 sm:p-6 flex flex-col gap-3 transition-colors ${
                    addr.isDefault ? "border-black" : "border-[#E2E2E2]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-['Inter'] text-sm font-semibold text-black">
                      {addr.firstName} {addr.lastName}
                    </p>
                    {addr.isDefault && (
                      <span className="shrink-0 text-[10px] uppercase tracking-wide font-semibold bg-black text-white px-2 py-1">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#5D5E63] leading-relaxed break-words">
                    {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                  <p className="text-sm text-[#5D5E63]">{addr.phone}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 pt-3 border-t border-[#F0F0F0]">
                    <button
                      onClick={() => setModalTarget(addr)}
                      className="text-xs font-semibold uppercase tracking-wide text-black hover:opacity-70 transition-opacity"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      disabled={busyId === addr._id}
                      className="text-xs font-semibold uppercase tracking-wide text-[#A32D2D] hover:opacity-70 transition-opacity disabled:opacity-50"
                    >
                      Delete
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        disabled={busyId === addr._id}
                        className="text-xs font-semibold uppercase tracking-wide text-[#5D5E63] hover:text-black transition-colors disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Additional Information */}
        <div className="flex flex-col gap-4 mt-12 sm:mt-16">
          {ADDITIONAL_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => navigate(link.route)}
              className="text-left font-['Inter'] text-base font-normal text-black w-fit hover:opacity-70 transition-opacity"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3 px-8 mt-8 w-full sm:w-[220px]"
        >
          Logout
        </button>
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