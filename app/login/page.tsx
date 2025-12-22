"use client";

import { useState, FormEvent } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Error signing in:", error.message);
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  const handleSignUp = async () => {
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    console.log(data);

    if (error) {
      console.error("Error signing up:", error.message);
      setError(error.message);
    } else {
      alert(
        "تم إنشاء الحساب بنجاح! الرجاء التحقق من بريدك الإلكتروني لتفعيل الحساب."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          تسجيل الدخول إلى المنصة
        </h1>

        {error && (
          <div
            className="p-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border text-black border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border text-black border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              className="w-full px-4 py-2 font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
