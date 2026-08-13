import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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

export default function MyAccount() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user) || {};

  const handleLogout = () => {
    // Assumed action name — swap for whatever your auth slice actually exports
    dispatch({ type: "auth/logout" });
    navigate("/login");
  };

  return (
    <div className="w-full bg-[#F9F9F9] flex justify-center">
      <div className="w-full max-w-screen-2xl px-16 py-16 font-['Inter']">
        {/* Profile Header */}
        <div className="flex items-center justify-between border-b border-[#C4C7C7] pb-8 mb-16">
          <div className="flex items-center gap-6">
            <img
              src={user.profileImage || "/default-avatar.png"}
              alt={user.name || "Profile"}
              className="w-24 h-24 rounded-full object-cover bg-[#E2E2E2]"
            />
            <div>
              <h1 className="font-['Libre_Caslon_Text'] text-[40px] font-normal text-black leading-tight">
                {user.name || "Guest"}
              </h1>
              <p className="text-base text-[#5D5E63] mt-2">
                {user.email || "—"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3 px-8 hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {QUICK_ACCESS_CARDS.map((card) => (
            <button
              key={card.key}
              onClick={() => card.route && navigate(card.route)}
              className="text-left bg-white border border-[#E2E2E2] p-8 hover:border-black transition-colors"
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

        {/* Additional Information */}
        <div className="flex flex-col gap-4 mt-8">
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
          className="bg-black text-white font-['Inter'] text-xs font-semibold uppercase tracking-wide py-3 px-8 mt-8"
          style={{ width: "220px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
