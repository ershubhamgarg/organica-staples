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
      points.push(`BMI estimate: ${bmi.toFixed(1)}`);
    }

    if (fastingSugar > 0) {
      points.push(`Fasting sugar: ${fastingSugar} mg/dL`);
    }

    if (hba1c > 0) {
      points.push(`HbA1c: ${hba1c}%`);
    }

    if (totalCholesterol > 0) {
      points.push(`Total cholesterol: ${totalCholesterol} mg/dL`);
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
    <section className="bg-brand-cream/30 pt-12 pb-24 px-4 sm:px-6 lg:px-8 border-y border-brand-cream/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Now Centered and Full Width */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-brand-green mb-4">
            <HeartPulse size={24} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
              Pantry Guidance
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-brown mb-6">
            Help me decide
          </h2>
          <p className="text-stone-600 font-light leading-relaxed">
            Share a few wellness markers for a personalized Amritya pantry
            guide. Simple swaps designed for your journey. This is a shopping
            guide, not a medical diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column - Compact Form */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="h-full bg-white border border-brand-brown/5 p-6 md:p-10 rounded-3xl shadow-[0_4px_20px_-4px_rgba(74,83,62,0.05)]"
            >
              <h3 className="text-xl font-serif text-brand-brown mb-8 pb-4 border-b border-brand-cream">
                Wellness Profile
              </h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="13"
                    max="110"
                    value={profile.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
                    placeholder="e.g. 34"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Activity
                  </label>
                  <select
                    name="activityLevel"
                    value={profile.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    min="90"
                    max="240"
                    value={profile.height}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
                    placeholder="170"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min="25"
                    max="250"
                    value={profile.weight}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
                    placeholder="68"
                    required
                  />
                </div>

                <div className="col-span-2 mt-4 pt-4 border-t border-brand-cream">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-6 font-bold">
                    Optional Markers
                  </p>
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Total Chol.
                  </label>
                  <input
                    type="number"
                    name="totalCholesterol"
                    value={profile.totalCholesterol}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
                    placeholder="mg/dL"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Fasting Sugar
                  </label>
                  <input
                    type="number"
                    name="fastingSugar"
                    value={profile.fastingSugar}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
                    placeholder="mg/dL"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    HbA1c (%)
                  </label>
                  <input
                    type="number"
                    name="hba1c"
                    step="0.1"
                    value={profile.hba1c}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-brand-cream/20 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
                    placeholder="e.g. 5.6"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-10 w-full group relative overflow-hidden bg-brand-brown text-white px-8 py-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative z-10 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.2em] text-xs">
                  Reveal Suggestions{" "}
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </button>
            </form>
          </div>

          {/* Right Column - Results Area */}
          <div className="lg:col-span-7">
            <div className="h-full min-h-[500px] flex flex-col bg-white border border-brand-brown/5 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(74,83,62,0.05)]">
              {!hasSubmitted ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-white to-brand-cream/10">
                  <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mb-8 text-brand-gold animate-pulse">
                    <Wheat size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-2xl font-serif text-brand-brown mb-4">
                    Awaiting your details
                  </h3>
                  <p className="text-stone-500 font-light leading-relaxed max-w-sm mx-auto">
                    Once you provide your wellness markers, we will analyze and
                    suggest the most suitable Amritya pantry essentials tailored
                    to your needs.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-brand-cream">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green">
                        <Scale size={24} />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl text-brand-brown">
                          Your Pantry Match
                        </h3>
                        <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mt-1">
                          Based on your profile
                        </p>
                      </div>
                    </div>

                    {summary.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {summary.slice(0, 3).map((point) => (
                          <span
                            key={point}
                            className="text-[9px] font-bold uppercase tracking-wider bg-brand-cream text-brand-brown px-3 py-1.5 rounded-full border border-brand-brown/5"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {insights.map((item) => (
                      <article
                        key={item.id}
                        className="group flex flex-col bg-brand-cream/20 hover:bg-white border border-brand-brown/5 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green bg-brand-green/5 px-2 py-1 rounded">
                            {item.title.split(" ")[0]}
                          </span>
                        </div>
                        <h4 className="text-lg font-serif text-brand-brown mb-2 group-hover:text-brand-gold transition-colors">
                          {item.product}
                        </h4>
                        <p className="text-xs text-stone-500 font-light leading-relaxed mb-4 flex-1">
                          {item.reason}
                        </p>
                        <div className="pt-4 border-t border-brand-brown/5 mt-auto">
                          <p className="text-[11px] text-stone-700 font-medium italic leading-relaxed">
                            "{item.action}"
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-brand-cream flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] text-stone-400 leading-relaxed max-w-md italic">
                      *Consult a healthcare professional before making
                      significant dietary changes.
                    </p>
                    <a
                      href="#shop"
                      className="inline-flex items-center gap-2 bg-brand-green text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand-brown transition-all shadow-md hover:shadow-lg"
                    >
                      Shop Matches <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
