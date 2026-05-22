"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-brand-cream flex items-center justify-center py-24 px-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-gold/5 organic-border -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-green/5 organic-border-alt translate-x-1/2 translate-y-1/2" />

      <div className="max-w-md w-full bg-white organic-border shadow-2xl border border-brand-gold/10 p-12 md:p-16 relative z-10">
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex flex-col items-center group mb-8"
          >
            <div className="p-4 bg-brand-cream organic-border-alt border border-brand-gold/20 group-hover:scale-110 transition-transform duration-500">
              <Leaf className="text-brand-gold" size={28} />
            </div>
          </Link>
          <h2 className="text-4xl font-serif text-brand-brown tracking-tight mb-3">
            {isSignUp ? (
              <>
                Sign <span className="italic">Up</span>
              </>
            ) : (
              <>
                Sign <span className="italic">In</span>
              </>
            )}
          </h2>
          <p className="text-brand-brown/40 font-light text-sm uppercase tracking-widest">
            {isSignUp ? "Create your account" : "Welcome back to Amritya"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-4 bg-brand-cream border border-brand-gold/20 text-brand-brown font-bold text-[10px] uppercase tracking-[0.2em] py-4 rounded-full transition-all hover:bg-brand-gold/5 disabled:opacity-50"
        >
          <svg
            className="w-4 h-4 text-brand-gold"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <div className="my-10 flex items-center gap-6">
          <div className="h-[1px] flex-1 bg-brand-gold/10" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold/40">
            or use email
          </span>
          <div className="h-[1px] flex-1 bg-brand-gold/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-4"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-black text-brand-brown/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-cream/50 border-b border-brand-gold/20 py-3 text-sm focus:outline-none focus:border-brand-brown transition-colors placeholder:text-brand-brown/10 font-light px-4"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-brand-terracotta text-[10px] uppercase tracking-widest font-black bg-brand-terracotta/5 p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center gap-4 bg-brand-brown text-brand-cream py-5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 overflow-hidden shadow-2xl hover:translate-y-[-2px] disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center gap-3">
              {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
              {!isLoading && <ArrowRight size={14} />}
            </span>
            <div className="absolute inset-0 bg-brand-brown-light translate-y-full transition-transform duration-500 group-hover:translate-y-0" />
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-[10px] uppercase tracking-widest font-black text-brand-brown/40">
            {isSignUp ? "Already have an account?" : "New user?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-3 text-brand-gold hover:text-brand-brown transition-colors border-b border-brand-gold/20"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
