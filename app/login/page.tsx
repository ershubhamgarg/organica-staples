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
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <section className="grid w-full max-w-4xl grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-xl border border-brand-gold/10 bg-white">
        {/* Left column - branding */}
        <div className="flex flex-col items-center justify-center bg-brand-green text-brand-cream p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-organic-texture opacity-5" />
          <div className="relative z-10 group">
            <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-3xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <Image
              src="/logo-horizon-new1.png"
              alt="Urban Kisan"
              width={240}
              height={240}
              priority
              className="relative z-10 h-auto w-32 sm:w-40 brightness-0 invert opacity-95 transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="mt-8 relative z-10 text-center">
            <h3 className="font-serif text-brand-gold text-lg mb-2">Urban Kisan</h3>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-cream/40">
              Premium Organic Pantry
            </p>
          </div>
        </div>

        {/* Right column - authentication form */}
        <div className="p-8 lg:p-12 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-brand-brown/60 hover:text-brand-brown transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>

          <h1 className="mb-2 text-xl font-serif text-brand-brown">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>

          <p className="mb-4 text-sm text-brand-brown/70">
            {isSignUp
              ? "Join us to enjoy seamless checkout and order history."
              : "Sign in to manage your addresses and orders."}
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-gold/20 bg-brand-cream px-5 py-3 text-sm font-medium text-brand-brown transition-colors hover:bg-brand-gold/10 disabled:opacity-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand-gold shadow-sm">
              G
            </span>{" "}
            Continue with Google
          </button>

          <div className="my-4 flex items-center">
            <div className="flex-1 h-px bg-brand-gold/20" />
            <span className="px-2 text-xs font-medium text-brand-brown/50">
              or
            </span>
            <div className="flex-1 h-px bg-brand-gold/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-xs font-bold uppercase text-brand-brown/70 mb-1"
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
                aria-invalid={Boolean(touchedFields.email && emailError)}
                aria-describedby={
                  touchedFields.email && emailError ? "email-error" : undefined
                }
                className="w-full rounded-md border border-brand-gold/15 bg-brand-cream/60 px-4 py-2 text-sm text-brand-brown placeholder:text-brand-brown/70 focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/30 transition"
                placeholder="you@example.com"
              />
              {touchedFields.email && emailError && (
                <p
                  id="email-error"
                  className="mt-1 text-xs font-medium text-brand-terracotta"
                >
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase text-brand-brown/70 mb-1"
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
                aria-invalid={Boolean(touchedFields.password && passwordError)}
                aria-describedby={
                  touchedFields.password && passwordError
                    ? "password-error"
                    : undefined
                }
                className="w-full rounded-md border border-brand-gold/15 bg-brand-cream/60 px-4 py-2 text-sm text-brand-brown placeholder:text-brand-brown/70 focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/30 transition"
                placeholder="Minimum 6 characters"
              />
              {touchedFields.password && passwordError && (
                <p
                  id="password-error"
                  className="mt-1 text-xs font-medium text-brand-terracotta"
                >
                  {passwordError}
                </p>
              )}
            </div>

            {displayError && (
              <div
                role="alert"
                className="rounded-md border border-brand-terracotta/15 bg-brand-terracotta/5 p-3 text-center text-xs font-medium text-brand-terracotta"
              >
                {displayError}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-5 py-3 text-sm font-bold uppercase text-brand-cream transition-all hover:bg-brand-brown-light disabled:opacity-50 hover:shadow-md"
            >
              {isLoading
                ? "Processing..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              {!isLoading && (
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-brown/50">
            {isSignUp ? "Already have an account?" : "New to Urban Kisan?"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormError(null);
                clearError();
                setTouchedFields({ email: false, password: false });
              }}
              className="ml-2 font-medium text-brand-gold hover:text-brand-brown"
            >
              {isSignUp ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
