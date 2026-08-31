import { Flower2 } from "lucide-react";

const SPICES = [
  { hi: "हल्दी", en: "Turmeric" },
  { hi: "जीरा", en: "Cumin" },
  { hi: "धनिया", en: "Coriander" },
  { hi: "हींग", en: "Asafoetida" },
  { hi: "लाल मिर्च", en: "Red Chilli" },
  { hi: "सरसों", en: "Mustard" },
  { hi: "मेथी", en: "Fenugreek" },
  { hi: "सौंफ", en: "Fennel" },
];

const TickerContent = () => (
  <>
    {SPICES.map((spice, index) => (
      <span
        key={`${spice.en}-${index}`}
        className="inline-flex items-center gap-3 sm:gap-4 mx-5 sm:mx-8 shrink-0"
      >
        <span className="font-devanagari text-base sm:text-lg text-brand-gold">
          {spice.hi}
        </span>
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black text-brand-brown/40">
          {spice.en}
        </span>
        <Flower2
          size={10}
          strokeWidth={1.5}
          className="text-brand-gold/30 shrink-0"
        />
      </span>
    ))}
  </>
);

const SpiceTicker = () => {
  return (
    <div className="relative bg-brand-cream py-4 sm:py-5 border-y border-brand-gold/10 overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-brand-cream to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-brand-cream to-transparent z-10 pointer-events-none" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <div className="flex shrink-0">
          <TickerContent />
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          <TickerContent />
        </div>
      </div>
    </div>
  );
};

export default SpiceTicker;
