"use client";

import { ArrowRight, HeartPulse, Scale, Wheat } from "lucide-react";
import { useMemo, useState } from "react";

type ActivityLevel = "low" | "moderate" | "high";

type HealthProfile = {
  age: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  totalCholesterol: string;
  fastingSugar: string;
  hba1c: string;
};

type Recommendation = {
  id: string;
  title: string;
  product: string;
  reason: string;
  action: string;
};

const initialProfile: HealthProfile = {
  age: "",
  height: "",
  weight: "",
  activityLevel: "moderate",
  totalCholesterol: "",
  fastingSugar: "",
  hba1c: "",
};

const recommendationDataset: Recommendation[] = [
  {
    id: "sugar",
    title: "Sugar-conscious staples",
    product: "Diacare Aata",
    reason:
      "A steadier flour choice can make everyday rotis feel more intentional when fasting sugar or HbA1c readings are above the usual wellness range.",
    action:
      "Use it for regular meals and pair with vegetables, dal, curd, or protein-rich sides for a more balanced plate.",
  },
  {
    id: "cholesterol",
    title: "Heart-smart cooking swaps",
    product: "Extra Virgin Olive Oil",
    reason:
      "Replacing frequent refined-oil cooking with olive oil supports a lighter pantry pattern when cholesterol readings need attention.",
    action:
      "Use it for low-to-medium heat cooking, dressings, marinades, and finishing cooked vegetables or grains.",
  },
  {
    id: "balanced-energy",
    title: "Everyday energy support",
    product: "Organic Millets and Whole Grains",
    reason:
      "Whole grains add natural texture and slow, satisfying energy for busy days, especially when activity is moderate to high.",
    action:
      "Rotate them into breakfast bowls, khichdi, upma, or salads instead of relying on refined grains every day.",
  },
  {
    id: "weight-balance",
    title: "Lighter pantry rhythm",
    product: "High-fibre flours and pulses",
    reason:
      "Fibre-forward staples can help meals feel fuller and more nourishing when weight goals are part of the conversation.",
    action:
      "Build plates around vegetables, dal, sprouts, whole grains, and smaller portions of calorie-dense add-ons.",
  },
];

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getBmi(height: string, weight: string) {
  const heightInMeters = toNumber(height) / 100;
  const weightInKg = toNumber(weight);

  if (!heightInMeters || !weightInKg) {
    return null;
  }

  return weightInKg / (heightInMeters * heightInMeters);
}

export default function HelpMeDecide() {
  const [profile, setProfile] = useState<HealthProfile>(initialProfile);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const bmi = useMemo(
    () => getBmi(profile.height, profile.weight),
    [profile.height, profile.weight],
  );

  const insights = useMemo(() => {
    const fastingSugar = toNumber(profile.fastingSugar);
    const hba1c = toNumber(profile.hba1c);
    const totalCholesterol = toNumber(profile.totalCholesterol);

    const hasSugarConcern =
      (fastingSugar > 0 && fastingSugar >= 100) || (hba1c > 0 && hba1c >= 5.7);
    const hasCholesterolConcern =
      totalCholesterol > 0 && totalCholesterol >= 200;
    const hasWeightBalanceNeed = bmi !== null && bmi >= 25;
    const selectedFallbackNeeded =
      !hasSugarConcern && !hasCholesterolConcern && !hasWeightBalanceNeed;

    const selected = recommendationDataset.filter((item) => {
      if (item.id === "sugar") return hasSugarConcern;
      if (item.id === "cholesterol") return hasCholesterolConcern;
      if (item.id === "weight-balance") return hasWeightBalanceNeed;
      return profile.activityLevel !== "low" || selectedFallbackNeeded;
    });

    if (selectedFallbackNeeded) {
      return recommendationDataset.filter(
        (item) => item.id === "balanced-energy",
      );
    }

    return selected;
  }, [
    bmi,
    profile.activityLevel,
    profile.fastingSugar,
    profile.hba1c,
    profile.totalCholesterol,
  ]);

  const summary = useMemo(() => {
    const points: string[] = [];
    const fastingSugar = toNumber(profile.fastingSugar);
    const hba1c = toNumber(profile.hba1c);
    const totalCholesterol = toNumber(profile.totalCholesterol);

    if (bmi !== null) {
      points.push(`BMI: ${bmi.toFixed(1)}`);
    }

    if (fastingSugar > 0) {
      points.push(`Sugar: ${fastingSugar}`);
    }

    if (hba1c > 0) {
      points.push(`HbA1c: ${hba1c}%`);
    }

    if (totalCholesterol > 0) {
      points.push(`Cholesterol: ${totalCholesterol}`);
    }

    return points;
  }, [bmi, profile.fastingSugar, profile.hba1c, profile.totalCholesterol]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasSubmitted(true);
  };

  return (
    <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-brand-sand/30 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 text-brand-gold mb-3">
            <span className="h-px w-8 bg-brand-gold/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Shopping Guide
            </span>
            <span className="h-px w-8 bg-brand-gold/30" />
          </div>
          <h2 className="text-2xl md:text-4xl font-serif text-brand-brown mb-4 tracking-tight">
            Help Me <span className="italic text-brand-terracotta">Decide</span>
          </h2>
          <p className="text-xs text-brand-brown/60 font-light leading-relaxed text-balance max-w-xl">
            Share your wellness markers for a personalized Amritya guide. Simple
            swaps designed for your unique health needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column - Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="h-full bg-white organic-border border border-brand-gold/10 p-10 md:p-12 shadow-2xl shadow-brand-brown/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 organic-border-alt translate-x-1/2 -translate-y-1/2" />

              <h3 className="text-2xl font-serif text-brand-brown mb-10 pb-4 border-b border-brand-gold/5 relative z-10">
                Wellness Profile
              </h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-10 relative z-10">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="13"
                    max="110"
                    value={profile.age}
                    onChange={handleChange}
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                    placeholder="e.g. 34"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3">
                    Activity
                  </label>
                  <select
                    name="activityLevel"
                    value={profile.activityLevel}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors appearance-none cursor-pointer px-2"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    min="90"
                    max="240"
                    value={profile.height}
                    onChange={handleChange}
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                    placeholder="e.g. 175"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min="30"
                    max="300"
                    value={profile.weight}
                    onChange={handleChange}
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-2"
                    placeholder="e.g. 70"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-8 mt-4 flex items-center gap-3">
                    Optional Bio-Markers
                    <span className="h-px flex-grow bg-brand-gold/10" />
                  </h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-brown/40 mb-2">
                        Sugar
                      </label>
                      <input
                        type="number"
                        name="fastingSugar"
                        value={profile.fastingSugar}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-xs focus:outline-none focus:border-brand-brown transition-colors"
                        placeholder="mg/dL"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-brown/40 mb-2">
                        HbA1c
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="hba1c"
                        value={profile.hba1c}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-xs focus:outline-none focus:border-brand-brown transition-colors"
                        placeholder="%"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-brand-brown/40 mb-2">
                        Chol.
                      </label>
                      <input
                        type="number"
                        name="totalCholesterol"
                        value={profile.totalCholesterol}
                        onChange={handleChange}
                        className="w-full bg-transparent border-b border-brand-gold/20 py-2 text-xs focus:outline-none focus:border-brand-brown transition-colors"
                        placeholder="mg/dL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full group relative mt-16 flex items-center justify-center gap-4 bg-brand-brown text-brand-cream py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-2xl hover:translate-y-[-2px]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  See Recommendations <ArrowRight size={14} />
                </span>
                <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
              </button>
            </form>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-7">
            {!hasSubmitted ? (
              <div className="h-full bg-white/40 organic-border-alt border-2 border-dashed border-brand-gold/10 flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 organic-border bg-brand-sand flex items-center justify-center mb-8 text-brand-gold/30">
                  <Scale size={32} strokeWidth={1} />
                </div>
                <h4 className="text-2xl font-serif text-brand-brown/40 mb-4 tracking-tight">
                  Awaiting Your Profile
                </h4>
                <p className="text-brand-brown/30 font-light max-w-sm text-balance">
                  Fill your wellness profile to receive a tailored selection of
                  Amritya products for your home.
                </p>
              </div>
            ) : (
              <div className="h-full animate-fade-in space-y-8">
                {/* Profile Summary Badges */}
                <div className="flex flex-wrap gap-3">
                  {summary.map((point) => (
                    <span
                      key={point}
                      className="px-5 py-2 bg-brand-gold/5 border border-brand-gold/10 organic-border-alt text-[9px] font-black uppercase tracking-widest text-brand-gold"
                    >
                      {point}
                    </span>
                  ))}
                  <span className="px-5 py-2 bg-brand-green/5 border border-brand-green/10 organic-border-alt text-[9px] font-black uppercase tracking-widest text-brand-green">
                    Activity: {profile.activityLevel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.map((rec) => (
                    <div
                      key={rec.id}
                      className="group bg-white organic-border border border-brand-gold/5 p-10 shadow-xl shadow-brand-brown/5 transition-all hover:shadow-2xl hover:translate-y-[-2px] relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green/5 organic-border-alt translate-x-1/2 -translate-y-1/2" />

                      <div className="w-12 h-12 organic-border-alt bg-brand-sand flex items-center justify-center mb-8 text-brand-brown group-hover:bg-brand-brown group-hover:text-brand-cream transition-all duration-500">
                        <Wheat size={20} strokeWidth={1.5} />
                      </div>

                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-terracotta mb-3">
                        {rec.title}
                      </h4>
                      <h5 className="text-2xl font-serif text-brand-brown mb-6 tracking-tight">
                        {rec.product}
                      </h5>
                      <p className="text-sm text-brand-brown/60 font-light leading-relaxed mb-6 text-balance">
                        {rec.reason}
                      </p>
                      <div className="pt-6 border-t border-brand-gold/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-2">
                          How to use
                        </p>
                        <p className="text-xs text-brand-brown/80 font-light leading-relaxed">
                          {rec.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-brand-brown p-8 organic-border-alt flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
                  <div className="text-center md:text-left">
                    <p className="text-brand-cream/60 text-[10px] uppercase tracking-[0.3em] font-black mb-2">
                      Ready to transform?
                    </p>
                    <p className="text-brand-cream font-serif text-2xl tracking-tight">
                      Your personalized store awaits.
                    </p>
                  </div>
                  <a
                    href="#shop"
                    className="inline-flex items-center gap-4 bg-brand-cream text-brand-brown px-10 py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-black transition-all hover:bg-brand-gold"
                  >
                    View Selection <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
