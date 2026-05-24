"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    router.push("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <section className="grid w-full max-w-4xl grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-xl border border-brand-gold/10 bg-white">
        {/* Left column - branding */}
        <div className="flex flex-col items-center justify-center bg-brand-green text-brand-cream p-8 lg:p-12">
          <Image
            src="/logo-white.png"
            alt="Amritya Organics"
            width={580}
            height={280}
            priority
          // className="mb-5 h-auto w-36 sm:w-44"
          />
          {/* <p className="text-sm text-brand-cream/80 text-center max-w-xs">
            Premium organic pantry for a healthier lifestyle.
          </p> */}
        </div>

        {/* Right column - authentication form */}
        <div className="p-8 lg:p-12 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-brand-brown/60 hover:text-brand-brown transition-colors mb-4">
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
            </span>{" "}Continue with Google
          </button>

          <div className="my-4 flex items-center">
            <div className="flex-1 h-px bg-brand-gold/20" />
            <span className="px-2 text-xs font-medium text-brand-brown/50">or</span>
            <div className="flex-1 h-px bg-brand-gold/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-brand-brown/70 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-brand-gold/15 bg-brand-cream/60 px-4 py-2 text-sm text-brand-brown placeholder:text-brand-brown/70 focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/30 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-brown/70 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-brand-gold/15 bg-brand-cream/60 px-4 py-2 text-sm text-brand-brown placeholder:text-brand-brown/70 focus:border-brand-brown focus:ring-2 focus:ring-brand-brown/30 transition"
                placeholder="Minimum 6 characters"
              />
            </div>

            {error && (
              <div className="rounded-md border border-brand-terracotta/15 bg-brand-terracotta/5 p-3 text-center text-xs font-medium text-brand-terracotta">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-5 py-3 text-sm font-bold uppercase text-brand-cream transition-all hover:bg-brand-brown-light disabled:opacity-50 hover:shadow-md"
            >
              {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
              {!isLoading && <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-brown/50">
            {isSignUp ? "Already have an account?" : "New to Amritya?"}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
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
