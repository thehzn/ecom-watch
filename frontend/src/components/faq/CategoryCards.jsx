// import React from 'react';
// import CategoryCard from './CategoryCard';

// export default function CategoryCards() {
//   const categories = [
//     {
//       icon: 'local_shipping',
//       title: 'Orders & Shipping',
//       targetId: 'orders-shipping',
//     },
//     {
//       icon: 'assignment_return',
//       title: 'Returns & Exchanges',
//       targetId: 'returns-exchanges',
//     },
//     {
//       icon: 'watch',
//       title: 'Watch Care',
//       targetId: 'watch-care',
//     },
//     {
//       icon: 'verified',
//       title: 'Warranty & Repairs',
//       targetId: 'watch-care',
//     },
//   ];

//   return (
//     <section className="w-full bg-white py-12 md:py-16 px-5" aria-label="FAQ Categories">
//       <div className="max-w-[1280px] mx-auto">
//         <div className="grid grid-cols-1 min-[370px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           {categories.map((cat, index) => (
//             <CategoryCard
//               key={`cat-card-${index}`}
//               icon={cat.icon}
//               title={cat.title}
//               targetId={cat.targetId}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
import React from 'react';
import { Truck, Undo2, Watch, ShieldCheck } from 'lucide-react';
import CategoryCard from './CategoryCard';

export default function CategoryCards() {
  const categories = [
    {
      icon: Truck,
      title: 'Orders & Shipping',
      targetId: 'orders-shipping',
    },
    {
      icon: Undo2,
      title: 'Returns & Exchanges',
      targetId: 'returns-exchanges',
    },
    {
      icon: Watch,
      title: 'Watch Care',
      targetId: 'watch-care',
    },
    {
      icon: ShieldCheck,
      title: 'Warranty & Repairs',
      targetId: 'watch-care',
    },
  ];

  return (
    <section className="w-full py-12 md:py-16 px-5 relative" aria-label="FAQ Categories">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 min-[370px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <CategoryCard
              key={`cat-card-${index}`}
              icon={cat.icon}
              title={cat.title}
              targetId={cat.targetId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}