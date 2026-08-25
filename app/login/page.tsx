"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";
const slides = [
  {
    title: "No pesticide exposure",
    description:
      "Organic farming restricts the use of many synthetic pesticides, so organic produce generally has no pesticide residues.",
  },
  {
    title: "Better for the environment",
    description:
      "Organic farming helps improve soil health, supports biodiversity, and reduces pollution from synthetic fertilizers and pesticides.",
  },
  {
    title: "No routine use of antibiotics in livestock",
    description:
      "Organic meat and dairy come from animals that are not routinely given antibiotics, which supports responsible antibiotic use.",
  },
  {
    title: "Fewer artificial additives",
    description:
      "Organic packaged foods are made under stricter rules that limit certain artificial preservatives, colors, and flavors.",
  },
  {
    title: "Supports sustainable farming",
    description:
      "Buying organic encourages farming practices that focus on long-term soil fertility, water conservation, and ecosystem health.",
  },
];

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const {
    signIn,
    signInWithGoogle,
    signUp,
    isLoading,
    error,
    clearError,
    user,
    isInitialized,
  } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && user) {
      router.push("/profile");
    }
  }, [isInitialized, user, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");

    if (authError) {
      window.requestAnimationFrame(() => {
        setFormError(authError);
        window.history.replaceState(null, "", window.location.pathname);
      });
    }
  }, []);

  const validateForm = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      return "Please enter your email address and password.";
    }

    if (!trimmedEmail) {
      return "Please enter your email address.";
    }

    if (!password) {
      return "Please enter your password.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    if (isSignUp && password.length < 6) {
      return "Please use a password with at least 6 characters.";
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return "You appear to be offline. Please check your connection and try again.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    clearError();
    setFormError(null);
    setTouchedFields({ email: true, password: true });

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const didAuthenticate = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    if (didAuthenticate) {
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setFormError(null);

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setFormError(
        "You appear to be offline. Please check your connection and try again.",
      );
      return;
    }

    await signInWithGoogle();
  };

  const displayError = formError ?? error;
  const trimmedEmail = email.trim();
  const emailError = !trimmedEmail
    ? "Email address is required."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
      ? "Enter a valid email address."
      : null;
  const passwordError = !password
    ? "Password is required."
    : isSignUp && password.length < 6
      ? "Use at least 6 characters."
      : null;
  const canSubmit = !emailError && !passwordError && !isLoading;

  return (
    <main className="relative flex min-h-[calc(100vh-104px)] items-center justify-center overflow-hidden bg-[#fbfaf7] px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-mandala opacity-[0.035] pointer-events-none" />
      <div className="absolute left-0 top-0 h-full w-[42%] bg-white/55 pointer-events-none" />
      <div className="absolute right-[-12%] top-[-18%] h-[420px] w-[420px] rounded-full bg-brand-gold/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[8%] h-[520px] w-[520px] rounded-full bg-brand-green/10 blur-[150px] pointer-events-none" />

      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-brand-gold/15 bg-white/75 shadow-[0_38px_100px_-55px_rgba(60,54,42,0.45)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
        {/* Back Link */}
        <div className="absolute left-5 top-5 z-20">
          <Link
            href="/"
            className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-brand-gold/15 bg-white/75 px-4 text-[9px] font-black uppercase tracking-[0.22em] text-brand-brown/45 shadow-sm backdrop-blur-md transition-all hover:border-brand-gold/30 hover:text-brand-brown"
          >
            <ArrowLeft
              size={12}
              className="transition-transform group-hover:-translate-x-1"
            />{" "}
            The Pantry
          </Link>
        </div>

        <div className="relative hidden min-h-[650px] overflow-hidden bg-brand-green px-12 py-14 text-brand-cream lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-organic-texture opacity-[0.08] pointer-events-none" />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-brand-gold/20" />
          <div className="absolute -bottom-32 left-12 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="relative pt-8 flex-1 flex flex-col justify-center mb-10">
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
              Why Organic?
            </p>
            <div className="relative min-h-[320px] w-full">
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-1000 ${
                    idx === slideIndex
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <h1 className="max-w-lg font-serif text-5xl leading-[1.1] tracking-tight text-brand-cream">
                    {slide.title}
                  </h1>
                  <p className="mt-6 max-w-md text-lg font-light leading-relaxed text-brand-cream/80">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === slideIndex
                      ? "w-8 bg-brand-gold"
                      : "w-2 bg-brand-gold/30 hover:bg-brand-gold/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {["Pure", "Direct", "Trusted"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-brand-gold/15 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-brand-gold">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center px-5 py-20 sm:px-10 lg:px-14">
          <div className="absolute inset-0 bg-jute opacity-[0.025] pointer-events-none" />
          <div className="relative w-full max-w-[470px]">
            <div className="mb-9 text-center">
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.32em] text-brand-gold">
                Secure Account Access
              </p>
              <h1 className="text-4xl font-serif text-brand-brown mb-3 tracking-tight">
                {isSignUp ? "Create Account" : "Namaste,"}
              </h1>
              <p className="mx-auto max-w-[320px] text-sm text-brand-brown/55 font-light leading-relaxed italic">
                {isSignUp
                  ? "Join our community for premium organic staples and faster checkout."
                  : "Sign in to access your orders and saved addresses."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group flex min-h-[56px] w-full items-center justify-center gap-3 rounded-full border border-[#dadce0] bg-white px-5 text-sm font-medium text-[#3c4043] shadow-sm transition-all hover:border-[#c5c9ce] hover:bg-[#f8fafd] hover:shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="my-7 flex items-center">
              <div className="flex-1 h-px bg-brand-gold/10" />
              <span className="px-4 text-[9px] font-black uppercase tracking-widest text-brand-brown/20">
                or
              </span>
              <div className="flex-1 h-px bg-brand-gold/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  className="block text-[9px] font-black uppercase tracking-widest text-brand-brown/40 ml-1"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError(null);
                    clearError();
                  }}
                  onBlur={() =>
                    setTouchedFields((fields) => ({ ...fields, email: true }))
                  }
                  className="w-full rounded-2xl border border-brand-gold/15 bg-white px-5 py-4 text-sm text-brand-brown shadow-inner shadow-brand-brown/[0.025] placeholder:text-brand-brown/30 focus:border-brand-gold/50 focus:bg-white focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none"
                  placeholder="you@example.com"
                />
                {touchedFields.email && emailError && (
                  <p className="mt-1 text-[9px] font-bold text-brand-terracotta ml-1">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-[9px] font-black uppercase tracking-widest text-brand-brown/40 ml-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormError(null);
                    clearError();
                  }}
                  onBlur={() =>
                    setTouchedFields((fields) => ({
                      ...fields,
                      password: true,
                    }))
                  }
                  className="w-full rounded-2xl border border-brand-gold/15 bg-white px-5 py-4 text-sm text-brand-brown shadow-inner shadow-brand-brown/[0.025] placeholder:text-brand-brown/30 focus:border-brand-gold/50 focus:bg-white focus:ring-4 focus:ring-brand-gold/10 transition-all outline-none"
                  placeholder="••••••••"
                />
                {touchedFields.password && passwordError && (
                  <p className="mt-1 text-[9px] font-bold text-brand-terracotta ml-1">
                    {passwordError}
                  </p>
                )}
              </div>

              {displayError && (
                <div className="p-4 rounded-xl bg-brand-terracotta/5 border border-brand-terracotta/10">
                  <p className="text-[10px] font-bold text-brand-terracotta text-center uppercase tracking-wider">
                    {displayError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="group w-full relative inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full bg-brand-green px-8 text-brand-cream shadow-xl shadow-brand-green/15 transition-all duration-500 hover:bg-brand-green-light hover:translate-y-[-2px] hover:shadow-brand-green/25 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                  {isLoading
                    ? "Verifying..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </span>
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <div className="mt-9 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormError(null);
                  clearError();
                }}
                className="text-[10px] font-black uppercase tracking-widest text-brand-brown/40 hover:text-brand-brown transition-colors"
              >
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <span className="text-brand-gold">Sign In</span>
                  </>
                ) : (
                  <>
                    New to ANNVRIKSH?{" "}
                    <span className="text-brand-gold">Create Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
