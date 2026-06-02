"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-brand-cream px-4 py-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-mandala opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      <section className="relative w-full max-w-[440px] z-10">
        {/* Back Link */}
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-brown/40 hover:text-brand-brown transition-all"
          >
            <ArrowLeft
              size={12}
              className="transition-transform group-hover:-translate-x-1"
            />{" "}
            The Pantry
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(17,44,36,0.08)] border border-brand-gold/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-jute opacity-[0.02] pointer-events-none" />

          <div className="relative z-10 text-center mb-10">
            <h1 className="text-3xl font-serif text-brand-brown mb-3 tracking-tight">
              {isSignUp ? "Create Account" : "Namaste,"}
            </h1>
            <p className="text-xs text-brand-brown/60 font-light leading-relaxed max-w-[280px] mx-auto italic">
              {isSignUp
                ? "Join our community for premium organic staples and faster checkout."
                : "Sign in to access your orders and saved addresses."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-brand-gold/10 bg-white px-5 py-4 text-[10px] font-black uppercase tracking-widest text-brand-brown transition-all hover:border-brand-gold/30 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-cream text-brand-gold shadow-sm group-hover:scale-110 transition-transform">
              G
            </span>
            Continue with Google
          </button>

          <div className="my-8 flex items-center">
            <div className="flex-1 h-px bg-brand-gold/10" />
            <span className="px-4 text-[9px] font-black uppercase tracking-widest text-brand-brown/20">
              or
            </span>
            <div className="flex-1 h-px bg-brand-gold/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full rounded-2xl border border-brand-gold/10 bg-brand-cream/40 px-5 py-4 text-sm text-brand-brown placeholder:text-brand-brown/30 focus:border-brand-gold/40 focus:bg-white focus:ring-0 transition-all outline-none"
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
                  setTouchedFields((fields) => ({ ...fields, password: true }))
                }
                className="w-full rounded-2xl border border-brand-gold/10 bg-brand-cream/40 px-5 py-4 text-sm text-brand-brown placeholder:text-brand-brown/30 focus:border-brand-gold/40 focus:bg-white focus:ring-0 transition-all outline-none"
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
              className="group w-full relative inline-flex items-center justify-center gap-3 px-8 py-5 bg-brand-green text-brand-cream rounded-2xl transition-all duration-500 hover:bg-brand-green-light hover:translate-y-[-2px] hover:shadow-xl hover:shadow-brand-green/20 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
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

          <div className="mt-10 text-center">
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
                  New to Urban Kisan?{" "}
                  <span className="text-brand-gold">Create Account</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
