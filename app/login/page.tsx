"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signUp, isLoading, error } = useUserStore();
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

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="text-brand-green" size={24} />
              <span className="text-xl font-sans text-brand-brown tracking-[0.35em] uppercase font-light">
                Organica
              </span>
            </div>
          </Link>
          <h2 className="text-2xl font-serif text-stone-900">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            {isSignUp
              ? "Start your organic journey today"
              : "Welcome back! Please enter your details"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-stone-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-1 text-brand-green font-medium hover:text-brand-green/80 transition-colors"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
