"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  HeartPulse,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { isProductAvailable, isProductLowStock, Product } from "@/lib/data";
import { getDiscountedPrice } from "@/lib/pricing";

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

type RecommendationSignal =
  | "sugar"
  | "cholesterol"
  | "weight"
  | "active"
  | "everyday";

type Benefit = {
  label: string;
  detail: string;
};

type RecommendationMetric = {
  label: string;
  value: string;
  detail: string;
};

type Recommendation = {
  id: string;
  title: string;
  product: string;
  productSearchTerms: string[];
  bestFor: string;
  reason: string;
  action: string;
  valueNote: string;
  benefits: Benefit[];
  useCases: string[];
  compatibility: string[];
  metrics: RecommendationMetric[];
  signalMatches: RecommendationSignal[];
  baseScore: number;
  scoreBoosts: Partial<Record<RecommendationSignal, number>>;
  sourceIds: string[];
};

type ProductsResponse = {
  products?: Product[];
};

type SignalState = Record<RecommendationSignal, boolean>;

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
    title: "Sugar-conscious staple",
    product: "Diacare Aata",
    productSearchTerms: ["diacare", "atta", "aata", "flour"],
    bestFor: "Daily rotis when fasting sugar or HbA1c needs closer attention",
    reason:
      "A flour-first recommendation keeps the change close to the meal customers already repeat most, making the swap practical for long-term pantry discipline.",
    action:
      "Use for rotis or parathas, then pair with dal, curd, paneer, eggs, sprouts, or vegetables so the plate is balanced rather than flour-heavy.",
    valueNote:
      "High repeat-use value because it replaces a daily base ingredient instead of adding a separate wellness product.",
    benefits: [
      {
        label: "Functional fit",
        detail:
          "Designed around everyday Indian meals, so the customer can improve the pantry pattern without changing the entire menu.",
      },
      {
        label: "Decision clarity",
        detail:
          "Recommended only when sugar markers cross conservative public screening thresholds or when the customer actively chooses it.",
      },
      {
        label: "Cost efficiency",
        detail:
          "Works as a staple replacement, which spreads the purchase across many meals and avoids duplicate specialty mixes.",
      },
      {
        label: "Use-case match",
        detail:
          "Best suited for lunch and dinner rotis, travel tiffins, and family meals where consistency matters.",
      },
    ],
    useCases: ["Rotis", "Lunch tiffins", "Family dinners", "Meal prep"],
    compatibility: ["Dal", "Curd", "Vegetables", "Paneer", "Sprouts"],
    metrics: [
      {
        label: "Meal stability",
        value: "High",
        detail:
          "Best for repeated daily meals where consistency beats novelty.",
      },
      {
        label: "Lifestyle friction",
        value: "Low",
        detail: "Keeps the cooking method familiar for most households.",
      },
      {
        label: "Repeat value",
        value: "Strong",
        detail: "Staple format supports frequent use.",
      },
    ],
    signalMatches: ["sugar"],
    baseScore: 78,
    scoreBoosts: { sugar: 17, weight: 4 },
    sourceIds: ["cdc-glucose", "catalog-fit"],
  },
  {
    id: "cholesterol",
    title: "Heart-smart oil rotation",
    product: "Extra Virgin Olive Oil",
    productSearchTerms: ["olive oil", "extra virgin olive"],
    bestFor:
      "Customers reducing heavy or highly saturated cooking-fat patterns",
    reason:
      "Oil is one of the highest-leverage pantry choices because it touches vegetables, grains, dressings, marinades, and snacks across the week.",
    action:
      "Use for low-to-medium heat cooking, salad dressings, chutney finishing, roasted vegetables, marinades, and grain bowls.",
    valueNote:
      "A small measured pour can flavor an entire dish, improving value per serving when used as a finishing or dressing oil.",
    benefits: [
      {
        label: "Functional advantage",
        detail:
          "Adds an unsaturated-fat cooking option for dishes where heavy solid fats are not necessary.",
      },
      {
        label: "Unique value",
        detail:
          "Works both as an ingredient and as a finishing oil, giving one bottle multiple kitchen roles.",
      },
      {
        label: "Cost efficiency",
        detail:
          "Best used strategically in dressings and finishing, where smaller portions deliver flavor without overuse.",
      },
      {
        label: "Use-case match",
        detail:
          "Useful for sauteed vegetables, dal tadka finishing, millet salads, hummus, dips, and lunch bowls.",
      },
    ],
    useCases: ["Dressings", "Low-heat saute", "Marinades", "Finishing oil"],
    compatibility: ["Millets", "Vegetables", "Legumes", "Salads", "Dips"],
    metrics: [
      {
        label: "Versatility",
        value: "Very high",
        detail: "Works across cooked and uncooked preparations.",
      },
      {
        label: "Measured-use value",
        value: "High",
        detail: "Strong flavor contribution in small quantities.",
      },
      {
        label: "Routine impact",
        value: "High",
        detail: "Affects many weekly meals with one pantry swap.",
      },
    ],
    signalMatches: ["cholesterol", "everyday"],
    baseScore: 76,
    scoreBoosts: { cholesterol: 18, everyday: 8 },
    sourceIds: ["nhlbi-cholesterol", "aha-fats", "catalog-fit"],
  },
  {
    id: "balanced-energy",
    title: "Balanced energy base",
    product: "Organic Millets and Whole Grains",
    productSearchTerms: ["millet", "whole grain", "grain", "rice"],
    bestFor: "Busy, active, or mixed-goal households that need steady meals",
    reason:
      "Whole-grain rotation gives customers a practical base for breakfast, lunch, and dinner without depending on refined grains every day.",
    action:
      "Rotate into khichdi, upma, breakfast bowls, curd bowls, grain salads, and simple one-pot dinners.",
    valueNote:
      "Strong pantry value because one grain can become breakfast, lunch, dinner, or a next-day bowl.",
    benefits: [
      {
        label: "Functional advantage",
        detail:
          "Supports more texture, variety, and slow-meal satisfaction in a weekly menu.",
      },
      {
        label: "Unique value",
        detail:
          "Flexible enough for traditional recipes and modern bowls, so different family members can use it differently.",
      },
      {
        label: "Cost efficiency",
        detail:
          "Works well in batch cooking, which reduces last-minute snack purchases and food waste.",
      },
      {
        label: "Use-case match",
        detail:
          "Best for breakfast prep, work lunches, post-activity meals, and simple dinners.",
      },
    ],
    useCases: ["Khichdi", "Upma", "Breakfast bowls", "Grain salads"],
    compatibility: ["Ghee", "Olive oil", "Dal", "Curd", "Pickles"],
    metrics: [
      {
        label: "Batch-cook fit",
        value: "High",
        detail: "Easy to portion across several meals.",
      },
      {
        label: "Family flexibility",
        value: "High",
        detail: "Works in both traditional and bowl-style formats.",
      },
      {
        label: "Menu variety",
        value: "Strong",
        detail: "Reduces dependence on one grain format.",
      },
    ],
    signalMatches: ["active", "everyday", "weight"],
    baseScore: 80,
    scoreBoosts: { active: 11, everyday: 10, weight: 5 },
    sourceIds: ["cdc-bmi", "catalog-fit"],
  },
  {
    id: "weight-balance",
    title: "Satiety-led pantry rhythm",
    product: "High-fibre flours and pulses",
    productSearchTerms: ["pulse", "dal", "flour", "atta", "millet"],
    bestFor:
      "Customers who want fuller meals without relying on larger portions",
    reason:
      "Fibre-forward staples help the customer build plates around structure: vegetables, pulses, grains, and protein-rich sides.",
    action:
      "Use pulses, sprouts, high-fibre flours, and grains as the base, then keep fried extras and calorie-dense toppings measured.",
    valueNote:
      "Good value because pulses and flours stretch across multiple portions and can replace packaged snacks in the weekly routine.",
    benefits: [
      {
        label: "Functional advantage",
        detail:
          "Encourages fuller meals built from staples instead of relying on add-on snacks.",
      },
      {
        label: "Unique value",
        detail:
          "Works across breakfast, lunch, and dinner, making it useful for households with different schedules.",
      },
      {
        label: "Cost efficiency",
        detail:
          "Dry staples store well, portion predictably, and usually cost less per serving than ready-to-eat options.",
      },
      {
        label: "Use-case match",
        detail:
          "Best for dal, chilla, sprouts, rotis, khichdi, and meal-prep bowls.",
      },
    ],
    useCases: ["Dal", "Chilla", "Sprouts", "Khichdi", "Meal bowls"],
    compatibility: ["Vegetables", "Curd", "Millets", "Spices", "Ghee"],
    metrics: [
      {
        label: "Satiety fit",
        value: "Very high",
        detail: "Best when fullness and portion planning are priorities.",
      },
      {
        label: "Storage reliability",
        value: "High",
        detail: "Dry staples are easy to store and portion.",
      },
      {
        label: "Meal coverage",
        value: "Wide",
        detail: "Fits breakfast, lunch, dinner, and snacks.",
      },
    ],
    signalMatches: ["weight", "sugar"],
    baseScore: 79,
    scoreBoosts: { weight: 16, sugar: 6 },
    sourceIds: ["cdc-bmi", "cdc-glucose", "catalog-fit"],
  },
  {
    id: "daily-cooking",
    title: "Everyday cooking foundation",
    product: "Cold Pressed Mustard Oil",
    productSearchTerms: ["mustard oil", "cold pressed", "sarson"],
    bestFor:
      "Households that want a familiar Indian cooking oil with stronger pantry discipline",
    reason:
      "A familiar cold-pressed oil helps customers improve cooking quality without abandoning regional taste, tadka habits, or family recipes.",
    action:
      "Use for tadka, pickles, sauteed vegetables, and regional dishes where mustard flavor is expected. Keep portions measured.",
    valueNote:
      "High household value because it supports regular Indian cooking, not just occasional health-focused recipes.",
    benefits: [
      {
        label: "Functional advantage",
        detail:
          "Cold-pressed format keeps the product close to traditional kitchen expectations and everyday flavor.",
      },
      {
        label: "Unique value",
        detail:
          "Preserves the sharp regional taste customers expect in pickles, tadka, and vegetable dishes.",
      },
      {
        label: "Cost efficiency",
        detail:
          "Best suited to frequent cooking use, so the bottle has clearer value than a niche specialty ingredient.",
      },
      {
        label: "Use-case match",
        detail:
          "Useful for Indian lunch and dinner recipes, especially when the family wants continuity in taste.",
      },
    ],
    useCases: ["Tadka", "Pickles", "Vegetable saute", "Regional cooking"],
    compatibility: ["Dal", "Sabzi", "Pickles", "Millets", "Whole grains"],
    metrics: [
      {
        label: "Cuisine fit",
        value: "Very high",
        detail: "Strong match for traditional Indian cooking patterns.",
      },
      {
        label: "Reliability",
        value: "High",
        detail: "Simple, repeatable use cases make adoption easier.",
      },
      {
        label: "Pantry role",
        value: "Core",
        detail:
          "Acts as a daily cooking base rather than an occasional add-on.",
      },
    ],
    signalMatches: ["everyday"],
    baseScore: 77,
    scoreBoosts: { everyday: 12, active: 3 },
    sourceIds: ["aha-fats", "catalog-fit"],
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

function getScore(recommendation: Recommendation, signals: SignalState) {
  const score = recommendation.signalMatches.reduce((total, signal) => {
    if (!signals[signal]) return total;
    return total + (recommendation.scoreBoosts[signal] ?? 0);
  }, recommendation.baseScore);

  return Math.min(score, 98);
}

function getProductMatch(
  recommendation: Recommendation,
  products: Product[],
): Product | null {
  const visibleProducts = products.filter(
    (product) => product.isVisible !== false,
  );

  return (
    visibleProducts.find((product) => {
      const searchable = [
        product.name,
        product.name2,
        product.category,
        product.description,
        ...(product.benefits ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return recommendation.productSearchTerms.some((term) =>
        searchable.includes(term.toLowerCase()),
      );
    }) ?? null
  );
}

function getRecommendationProductKey(
  recommendation: Recommendation,
  product: Product | null,
) {
  return String(product?.id ?? recommendation.product)
    .trim()
    .toLowerCase();
}

function getAvailabilityLabel(product: Product | null) {
  if (!product) return "Available soon";
  if (!isProductAvailable(product)) return "Available soon";
  if (isProductLowStock(product)) return "Few left";
  return "In stock";
}

function canOpenProduct(product: Product | null) {
  return product !== null && isProductAvailable(product);
}

function getSatisfactionScore(product: Product | null) {
  if (typeof product?.rating === "number") {
    return Math.round((product.rating / 5) * 100);
  }

  return 72;
}

function getReliabilityScore(product: Product | null) {
  if (!product) return 68;
  if (!isProductAvailable(product)) return 36;
  if (isProductLowStock(product)) return 74;
  return 88;
}

function getValueScore(product: Product | null) {
  if (!product) return 74;

  const price = getDiscountedPrice(product);
  const discount = product.discount ?? 0;
  const priceScore = price <= 250 ? 88 : price <= 500 ? 80 : 72;

  return Math.min(priceScore + Math.round(discount / 2), 96);
}

function getSignalLabel(signal: RecommendationSignal) {
  const labels: Record<RecommendationSignal, string> = {
    sugar: "Sugar",
    cholesterol: "Heart",
    weight: "Wt",
    active: "Move",
    everyday: "Daily",
  };

  return labels[signal];
}

export default function HelpMeDecide() {
  const [profile, setProfile] = useState<HealthProfile>(initialProfile);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeRecommendationId, setActiveRecommendationId] = useState("");
  const [expandedRecommendationId, setExpandedRecommendationId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const result = (await response.json()) as ProductsResponse;

        if (isMounted && response.ok && result.products) {
          setProducts(result.products);
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const bmi = useMemo(
    () => getBmi(profile.height, profile.weight),
    [profile.height, profile.weight],
  );

  const signals = useMemo<SignalState>(() => {
    const fastingSugar = toNumber(profile.fastingSugar);
    const hba1c = toNumber(profile.hba1c);
    const totalCholesterol = toNumber(profile.totalCholesterol);
    const sugar =
      (fastingSugar > 0 && fastingSugar >= 100) || (hba1c > 0 && hba1c >= 5.7);
    const cholesterol = totalCholesterol > 0 && totalCholesterol >= 200;
    const weight = bmi !== null && bmi >= 25;
    const active = profile.activityLevel !== "low";

    return {
      sugar,
      cholesterol,
      weight,
      active,
      everyday: !sugar && !cholesterol && !weight,
    };
  }, [
    bmi,
    profile.activityLevel,
    profile.fastingSugar,
    profile.hba1c,
    profile.totalCholesterol,
  ]);

  const insights = useMemo(() => {
    const seenProducts = new Set<string>();
    const selected = recommendationDataset
      .filter((recommendation) =>
        recommendation.signalMatches.some((signal) => signals[signal]),
      )
      .map((recommendation) => {
        const product = getProductMatch(recommendation, products);
        return {
          ...recommendation,
          catalogProduct: product,
          matchScore: getScore(recommendation, signals),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return selected
      .filter((recommendation) => {
        const productKey = getRecommendationProductKey(
          recommendation,
          recommendation.catalogProduct,
        );

        if (seenProducts.has(productKey)) {
          return false;
        }

        seenProducts.add(productKey);
        return true;
      })
      .slice(0, 2);
  }, [products, signals]);

  const activeSignalLabels = useMemo(() => {
    const labels: string[] = [];

    if (signals.sugar) labels.push("Sugar-conscious");
    if (signals.cholesterol) labels.push("Heart-smart");
    if (signals.weight) labels.push("Weight balance");
    if (signals.active) labels.push("Active routine");
    if (signals.everyday) labels.push("Everyday pantry");

    return labels;
  }, [signals]);

  const activeRecommendation = useMemo(() => {
    return (
      insights.find((insight) => insight.id === activeRecommendationId) ??
      insights[0] ??
      null
    );
  }, [activeRecommendationId, insights]);

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
        <ScrollReveal className="flex flex-col items-center text-center mb-8">
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
            Share your wellness markers for a personalized Urban Kisan guide. The
            recommendations combine public wellness thresholds, live catalog
            signals, and practical kitchen-fit data.
          </p>
        </ScrollReveal>

        <div
          className={`grid grid-cols-1 ${hasSubmitted ? "lg:grid-cols-12" : "lg:grid-cols-1"} gap-8 xl:gap-10 items-start`}
        >
          <ScrollReveal
            className={hasSubmitted ? "lg:col-span-4" : "lg:col-span-12"}
          >
            <form
              onSubmit={handleSubmit}
              className={`bg-white rounded-3xl border border-brand-gold/10 p-8 md:p-10 shadow-2xl shadow-brand-brown/5 relative overflow-hidden transition-all duration-700 ${!hasSubmitted ? "max-w-5xl mx-auto" : ""}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2" />

              <div
                className={`relative z-10 flex ${!hasSubmitted ? "flex-col md:flex-row items-center text-center md:text-left" : "items-start"} justify-between gap-6 mb-10 pb-4 border-b border-brand-gold/5`}
              >
                <div>
                  <h3 className="text-2xl font-serif text-brand-brown tracking-tight">
                    Wellness Profile
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-brand-brown/45">
                    Shopping guidance only, not medical advice.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-brand-sand flex items-center justify-center text-brand-gold shrink-0">
                  <HeartPulse size={20} strokeWidth={1.5} />
                </div>
              </div>

              <div
                className={`grid ${hasSubmitted ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-7"} gap-x-6 gap-y-8 relative z-10`}
              >
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
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-2"
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
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-2"
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
                    className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-2"
                    placeholder="e.g. 70"
                    required
                  />
                </div>

                <div
                  className={`${hasSubmitted ? "col-span-2" : "col-span-2 md:col-span-4 lg:col-span-3"}`}
                >
                  <div
                    className={`grid ${hasSubmitted ? "grid-cols-3" : "grid-cols-3"} gap-4`}
                  >
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3 whitespace-nowrap">
                        Sugar
                      </label>
                      <input
                        type="number"
                        name="fastingSugar"
                        value={profile.fastingSugar}
                        onChange={handleChange}
                        className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-2"
                        placeholder="mg/dL"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3 whitespace-nowrap">
                        HbA1c
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="hba1c"
                        value={profile.hba1c}
                        onChange={handleChange}
                        className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-2"
                        placeholder="%"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-brown/40 mb-3 whitespace-nowrap">
                        Chol.
                      </label>
                      <input
                        type="number"
                        name="totalCholesterol"
                        value={profile.totalCholesterol}
                        onChange={handleChange}
                        className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/50 font-light px-2"
                        placeholder="mg/dL"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex ${!hasSubmitted ? "justify-center" : "justify-start"} mt-12`}
              >
                <button
                  type="submit"
                  className={`${!hasSubmitted ? "w-full md:w-auto px-12" : "w-full"} group relative flex items-center justify-center gap-4 bg-brand-brown text-brand-cream py-5 rounded-full text-[11px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-2xl hover:translate-y-[-2px]`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {hasSubmitted ? "Update Results" : "Reveal Suggestions"}{" "}
                    <ArrowRight size={14} />
                  </span>
                  <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
                </button>
              </div>

              {hasSubmitted && (
                <div className="relative z-10 mt-8 rounded-2xl bg-brand-cream/70 border border-brand-gold/10 p-5">
                  <p className="text-[9px] font-black uppercase tracking-[0.24em] text-brand-gold mb-3">
                    Decision Basis
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xl font-serif text-brand-brown">
                        {insights.length}
                      </p>
                      <p className="text-[10px] leading-relaxed text-brand-brown/50">
                        distinct product matches
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-serif text-brand-brown">
                        {activeSignalLabels.length}
                      </p>
                      <p className="text-[10px] leading-relaxed text-brand-brown/50">
                        profile signals used
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeSignalLabels.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1.5 rounded-full bg-white text-brand-brown/60 border border-brand-gold/10 text-[9px] font-bold uppercase tracking-[0.12em]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </ScrollReveal>

          {hasSubmitted && (
            <ScrollReveal
              animation="reveal-fade"
              delay={200}
              className="lg:col-span-8"
            >
              {activeRecommendation ? (
                <div className="animate-fade-in bg-white rounded-3xl border border-brand-gold/5 shadow-2xl shadow-brand-brown/5 overflow-hidden">
                  {(() => {
                    const activeProduct = activeRecommendation.catalogProduct;
                    const productIsOpenable = canOpenProduct(activeProduct);
                    const productHref = activeProduct
                      ? `/product/${activeProduct.id}`
                      : "#shop";

                    return (
                      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr]">
                        <div className="bg-brand-brown text-brand-cream p-5 flex flex-col gap-6">
                          <div>
                            <div className="flex items-center gap-3 text-brand-gold mb-5">
                              <BarChart3 size={16} />
                              <p className="text-[9px] font-black uppercase tracking-[0.24em]">
                                Match Board
                              </p>
                            </div>
                            <div className="space-y-3">
                              {insights.map((rec, index) => {
                                const isActive =
                                  rec.id === activeRecommendation.id;

                                return (
                                  <button
                                    key={rec.id}
                                    type="button"
                                    onClick={() =>
                                      setActiveRecommendationId(rec.id)
                                    }
                                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                      isActive
                                        ? "bg-brand-cream text-brand-brown border-brand-gold"
                                        : "bg-white/5 text-brand-cream border-white/10 hover:border-brand-gold/50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[9px] font-black uppercase tracking-[0.22em] opacity-60">
                                        Pick {index + 1}
                                      </span>
                                      <span className="font-serif text-2xl">
                                        {rec.matchScore}%
                                      </span>
                                    </div>
                                    <p className="mt-2 font-serif text-base leading-tight">
                                      {rec.catalogProduct?.name ?? rec.product}
                                    </p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                                      <div
                                        className={`h-full rounded-full ${
                                          isActive
                                            ? "bg-brand-green"
                                            : "bg-brand-gold"
                                        }`}
                                        style={{ width: `${rec.matchScore}%` }}
                                      />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-brand-cream/50">
                              Profile Signals
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {activeSignalLabels.slice(0, 4).map((label) => (
                                <span
                                  key={label}
                                  className="rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-brand-cream/80"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-5 md:p-7">
                          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
                            <div className="rounded-3xl bg-brand-cream/70 border border-brand-gold/10 p-5 flex flex-col items-center justify-center text-center">
                              <div
                                className="relative grid h-36 w-36 place-items-center rounded-full"
                                style={{
                                  background: `conic-gradient(#2D3A26 ${
                                    activeRecommendation.matchScore * 3.6
                                  }deg, rgba(212,175,55,0.18) 0deg)`,
                                }}
                              >
                                <div className="absolute inset-3 rounded-full bg-white" />
                                <div className="relative">
                                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-gold">
                                    Match
                                  </p>
                                  <p className="text-4xl font-serif text-brand-brown">
                                    {activeRecommendation.matchScore}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-brand-terracotta">
                                {activeRecommendation.title}
                              </p>
                              {productIsOpenable ? (
                                <Link
                                  href={productHref}
                                  className="mt-2 font-serif text-xl leading-tight text-brand-brown hover:text-brand-terracotta transition-colors"
                                >
                                  {activeProduct?.name ??
                                    activeRecommendation.product}
                                </Link>
                              ) : (
                                <p className="mt-2 font-serif text-xl leading-tight text-brand-brown">
                                  {activeProduct?.name ??
                                    activeRecommendation.product}
                                </p>
                              )}
                              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-green">
                                {getAvailabilityLabel(activeProduct)}
                              </p>
                              {!productIsOpenable && (
                                <p className="mt-3 max-w-44 text-xs leading-relaxed text-brand-brown/55">
                                  This product will soon be available in the
                                  catalog.
                                </p>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                  {
                                    label: "Fit",
                                    score: activeRecommendation.matchScore,
                                  },
                                  {
                                    label: "Trust",
                                    score: getSatisfactionScore(
                                      activeRecommendation.catalogProduct,
                                    ),
                                  },
                                  {
                                    label: "Value",
                                    score: getValueScore(
                                      activeRecommendation.catalogProduct,
                                    ),
                                  },
                                ].map((metric) => (
                                  <div
                                    key={metric.label}
                                    className="rounded-2xl border border-brand-gold/10 bg-white p-4 min-w-0"
                                  >
                                    <div className="flex flex-col gap-1">
                                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-brown/40">
                                        {metric.label}
                                      </p>
                                      <p className="font-serif text-2xl leading-none text-brand-brown">
                                        {metric.score}
                                      </p>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-sand">
                                      <div
                                        className="h-full rounded-full bg-brand-green"
                                        style={{ width: `${metric.score}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="rounded-3xl border border-brand-gold/10 bg-brand-cream/60 p-5">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-gold">
                                    Signal Map
                                  </p>
                                  <ShieldCheck
                                    size={16}
                                    className="text-brand-green"
                                  />
                                </div>
                                <div className="grid grid-cols-5 gap-3 items-end h-32">
                                  {(
                                    [
                                      "sugar",
                                      "cholesterol",
                                      "weight",
                                      "active",
                                      "everyday",
                                    ] as RecommendationSignal[]
                                  ).map((signal) => {
                                    const isMatched =
                                      activeRecommendation.signalMatches.includes(
                                        signal,
                                      ) && signals[signal];
                                    const height = isMatched
                                      ? 92
                                      : signals[signal]
                                        ? 52
                                        : 22;

                                    return (
                                      <div
                                        key={signal}
                                        className="flex h-full flex-col items-center justify-end gap-2"
                                      >
                                        <div
                                          className={`w-full max-w-10 rounded-t-full transition-all ${
                                            isMatched
                                              ? "bg-brand-green"
                                              : signals[signal]
                                                ? "bg-brand-gold/70"
                                                : "bg-brand-sand"
                                          }`}
                                          style={{ height: `${height}%` }}
                                        />
                                        <span className="text-[8px] font-black uppercase tracking-[0.12em] text-brand-brown/45">
                                          {getSignalLabel(signal)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  {
                                    label: "Reliability",
                                    score: getReliabilityScore(
                                      activeRecommendation.catalogProduct,
                                    ),
                                  },
                                  {
                                    label: "Catalog",
                                    score: getSatisfactionScore(
                                      activeRecommendation.catalogProduct,
                                    ),
                                  },
                                ].map((metric) => (
                                  <div
                                    key={metric.label}
                                    className="rounded-2xl border border-brand-gold/10 bg-white p-4"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-brand-brown/40">
                                        {metric.label}
                                      </p>
                                      <p className="font-serif text-lg leading-none text-brand-brown">
                                        {metric.score}/100
                                      </p>
                                    </div>
                                    <div className="mt-3 grid grid-cols-10 gap-1">
                                      {Array.from({ length: 10 }).map(
                                        (_, index) => (
                                          <span
                                            key={index}
                                            className={`h-8 rounded-full ${
                                              index <
                                              Math.round(metric.score / 10)
                                                ? "bg-brand-green"
                                                : "bg-brand-sand"
                                            }`}
                                          />
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
                            <div className="flex flex-wrap gap-2">
                              {[
                                ...activeRecommendation.useCases.slice(0, 3),
                                ...activeRecommendation.compatibility.slice(
                                  0,
                                  2,
                                ),
                              ].map((item) => (
                                <span
                                  key={item}
                                  className="px-3 py-1.5 rounded-full bg-brand-green/5 text-brand-green border border-brand-green/10 text-[10px] font-bold"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                            {productIsOpenable ? (
                              <Link
                                href={productHref}
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-brand-brown px-8 py-4 text-[10px] font-black uppercase tracking-[0.24em] text-brand-cream transition-all hover:bg-brand-brown-light"
                              >
                                View Product <ArrowRight size={14} />
                              </Link>
                            ) : (
                              <div className="rounded-full border border-brand-gold/20 bg-brand-gold/5 px-8 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-brand-brown/55">
                                Available Soon
                              </div>
                            )}
                          </div>

                          <div className="mt-5 rounded-2xl border border-brand-gold/10 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedRecommendationId((current) =>
                                  current === activeRecommendation.id
                                    ? ""
                                    : activeRecommendation.id,
                                )
                              }
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-brand-brown/50">
                                Why this pick
                              </span>
                              <ChevronDown
                                size={16}
                                className={`text-brand-gold transition-transform ${
                                  expandedRecommendationId ===
                                  activeRecommendation.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>

                            {expandedRecommendationId ===
                              activeRecommendation.id && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-gold/10 p-5">
                                {activeRecommendation.benefits
                                  .slice(0, 2)
                                  .map((benefit) => (
                                    <div
                                      key={benefit.label}
                                      className="flex gap-3"
                                    >
                                      <CheckCircle2
                                        size={16}
                                        className="mt-0.5 shrink-0 text-brand-green"
                                        strokeWidth={1.8}
                                      />
                                      <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-brown/45">
                                          {benefit.label}
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-brand-brown/65">
                                          {benefit.detail}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="min-h-[520px] rounded-3xl border border-brand-gold/10 bg-white/60 p-12 text-center">
                  <p className="font-serif text-2xl text-brand-brown">
                    No recommendation available yet.
                  </p>
                </div>
              )}
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
