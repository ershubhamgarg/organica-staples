"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signInWithGoogle, signUp, isLoading, error } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }

    router.push("/");
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <main className="min-h-screen bg-brand-cream px-4 py-8 sm:px-6 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
        <Link
          href="/"
          className="mb-8 inline-flex w-max items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-brand-brown/50 transition-colors hover:text-brand-brown"
        >
          <ArrowLeft size={13} />
          Back to Store
        </Link>

        <section className="grid flex-1 overflow-hidden rounded-3xl border border-brand-gold/10 bg-white shadow-2xl shadow-brand-brown/10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-brand-green p-8 text-brand-cream sm:p-10 lg:p-12">
            <div className="absolute inset-x-0 bottom-0 h-44 bg-brand-brown/20" />
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-brand-gold/20" />
            <div className="absolute -bottom-28 left-10 h-72 w-72 rounded-full border border-brand-cream/10" />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-gold/30 bg-brand-cream/10 text-brand-gold">
                  <Leaf size={22} />
                </div>
                <div>
                  <p className="text-sm font-serif tracking-tight">
                    Amritya Organics
                  </p>
                  <p className="text-[8px] font-black uppercase tracking-[0.25em] text-brand-cream/45">
                    Pure staples
                  </p>
                </div>
              </Link>
            </div>

            <div className="relative z-10 max-w-md">
              <div className="mb-5 inline-flex items-center gap-3">
                <span className="h-[1px] w-8 bg-brand-gold" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">
                  Member Access
                </span>
              </div>
              <h1 className="text-4xl font-serif leading-[0.98] tracking-tight sm:text-5xl">
                Pantry care, <span className="italic">made personal.</span>
              </h1>
              <p className="mt-5 max-w-sm text-sm font-light leading-relaxed text-brand-cream/70">
                Sign in to manage saved addresses, view orders, and keep your
                organic staples ready for the next restock.
              </p>
            </div>

            <div className="relative z-10 grid gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cream/65 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand-gold" />
                Saved carts
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-gold" />
                Secure auth
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-brand-gold" />
                Order updates
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </p>
                <h2 className="text-3xl font-serif tracking-tight text-brand-brown sm:text-4xl">
                  {isSignUp ? (
                    <>
                      Begin your <span className="italic">membership</span>
                    </>
                  ) : (
                    <>
                      Sign in to <span className="italic">continue</span>
                    </>
                  )}
                </h2>
                <p className="mt-3 text-sm font-light leading-relaxed text-brand-brown/55">
                  {isSignUp
                    ? "Create a secure account for faster checkout and order history."
                    : "Use your email or Google account to return to your profile."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-brand-gold/20 bg-brand-cream px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-brand-brown transition-all hover:border-brand-gold/40 hover:bg-brand-gold/10 disabled:opacity-50"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand-gold shadow-sm">
                  G
                </span>
                Continue with Google
              </button>

              <div className="my-8 flex items-center gap-5">
                <div className="h-[1px] flex-1 bg-brand-gold/15" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-brown/30">
                  Email Access
                </span>
                <div className="h-[1px] flex-1 bg-brand-gold/15" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-brand-brown/55">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-brand-gold/15 bg-brand-cream/60 px-5 py-4 text-sm text-brand-brown outline-none transition-colors placeholder:text-brand-brown/20 focus:border-brand-brown"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-brand-brown/55">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-brand-gold/15 bg-brand-cream/60 px-5 py-4 text-sm text-brand-brown outline-none transition-colors placeholder:text-brand-brown/20 focus:border-brand-brown"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-brand-terracotta/15 bg-brand-terracotta/5 p-4 text-center text-[10px] font-black uppercase tracking-widest text-brand-terracotta">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-4 overflow-hidden rounded-full bg-brand-brown px-6 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-brand-cream shadow-xl shadow-brand-brown/15 transition-all hover:-translate-y-0.5 hover:bg-brand-brown-light disabled:opacity-50"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isLoading
                      ? "Processing..."
                      : isSignUp
                        ? "Create Account"
                        : "Sign In"}
                    {!isLoading && (
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </span>
                </button>
              </form>

              <div className="mt-8 rounded-2xl border border-brand-gold/10 bg-brand-cream/50 px-5 py-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-brown/45">
                  {isSignUp ? "Already registered?" : "New to Amritya?"}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-3 text-brand-gold transition-colors hover:text-brand-brown"
                  >
                    {isSignUp ? "Sign In" : "Create Account"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
