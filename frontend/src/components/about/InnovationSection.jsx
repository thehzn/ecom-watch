import React from 'react';

export default function InnovationSection() {
  const features = [
    { label: "Patented Calibers", link: "#" },
    { label: "Material Science", link: "#" },
    { label: "Future Concepts", link: "#" },
  ];

  return (
    <section className="w-full bg-[#000000] py-[80px] px-[20px]" aria-labelledby="innovation-title">
      <div className="max-w-[700px] mx-auto text-center flex flex-col items-center">

        <h2
          id="innovation-title"
          className="font-caslon text-4xl md:text-[40px] font-normal text-white leading-tight">
          Innovation as Heritage
        </h2>

        <p className="font-inter text-base font-normal leading-[28px] text-white mt-6 max-w-xl">
          While we respect history, we never stand still. Our research laboratory continuously explores new frontiers of metallurgy and micro-mechanics. By integrating state-of-the-art silicon escapements and space-grade materials, we build the future of watchmaking on the foundation of our past.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-[32px] mt-[32px]">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.link}
              onClick={(e) => e.preventDefault()}
              className="font-inter text-[12px] font-semibold uppercase tracking-wider text-white hover:text-neutral-300 transition-colors duration-300 relative group">
              {feature.label}
              <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
