
// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { MessageSquare, ArrowLeft, ArrowRight, Sparkles, Check, Compass } from "lucide-react";

// export default function Enquiry() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     message: "",
//   });
//   const [submitted, setSubmitted] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setSubmitted(true);
//     setFormData({
//       name: "",
//       email: "",
//       phone: "",
//       message: "",
//     });
//   };

//   return (
//     <div className="min-h-screen w-full bg-[#08090C] text-white font-['Plus_Jakarta_Sans'] selection:bg-white selection:text-black relative overflow-hidden">
      
//       {/* Background ambient glow */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none" />

//       {/* Header Banner */}
//       <section className="w-full bg-[#0B0D12] border-b border-white/10 px-6 py-14 sm:py-16 text-center relative overflow-hidden">
//         <div className="max-w-3xl mx-auto flex flex-col items-center">
//           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300 mb-3">
//             <Sparkles size={12} />
//             Bespoke Services &amp; Salon
//           </div>
//           <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
//             Client Enquiry
//           </h1>
//           <p className="text-sm text-gray-400 mt-2">
//             Submit a request for private salon viewings, custom timepieces, or dedicated horology care.
//           </p>
//         </div>
//       </section>

//       <main className="max-w-[700px] mx-auto px-6 sm:px-8 py-12">
        
//         <div className="mb-8">
//           <Link
//             to="/myaccount"
//             className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
//           >
//             <ArrowLeft size={14} />
//             <span>Return to Client Dossier</span>
//           </Link>
//         </div>

//         <div className="bg-[#0E1015] border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl">
          
//           {submitted ? (
//             <div className="flex flex-col items-center text-center py-8">
//               <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
//                 <Check size={30} strokeWidth={2.5} />
//               </div>
//               <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
//                 Transmitted to Geneva Atelier
//               </span>
//               <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
//                 Enquiry Received
//               </h2>
//               <p className="mt-3 text-sm text-gray-300 max-w-md leading-relaxed">
//                 Thank you for your enquiry. A dedicated manufacture horologist will connect with you shortly.
//               </p>
//               <button
//                 onClick={() => setSubmitted(false)}
//                 className="mt-8 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-all"
//               >
//                 Send Another Enquiry
//               </button>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                   placeholder="Jean Dufour"
//                   className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   placeholder="client@chronos.com"
//                   className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   required
//                   placeholder="+41 22 123 4567"
//                   className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl px-4 py-3.5 outline-none transition-colors placeholder:text-gray-600"
//                 />
//               </div>

//               <div>
//                 <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
//                   Your Enquiry Details
//                 </label>
//                 <textarea
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   required
//                   rows="4"
//                   placeholder="Describe the bespoke timepiece, restoration, or private salon consultation you are requesting..."
//                   className="w-full bg-[#141720] border border-white/15 focus:border-white text-white text-sm rounded-xl p-4 outline-none transition-colors placeholder:text-gray-600 resize-none"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-lg transition-all hover:scale-[1.01]"
//               >
//                 <span>Submit Client Enquiry</span>
//                 <ArrowRight size={15} />
//               </button>

//             </form>
//           )}

//         </div>

//       </main>

//     </div>
//   );
// }


