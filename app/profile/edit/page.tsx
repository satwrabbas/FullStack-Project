"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";
import Link from "next/link";

export default function EditProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
  });

  useEffect(() => {
    if (!user) return;

    const getProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, full_name, bio")
        .eq("id", user.id)
        .single();

      if (data) {
        setFormData({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
        });
      }
    };
    getProfile();
  }, [user]);

  const updateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: formData.username,
        full_name: formData.full_name,
        bio: formData.bio,
      })
      .eq("id", user!.id);

    if (error) {
      alert("حدث خطأ!");
      console.log(error);
    } else {
      alert("تم تحديث بيانات الشخصية!");
      router.push("/profile");
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 text-gray-100">
      <div className="bg-gray-800 p-5 md:p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <h1 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
          تعديل الملف الشخصي
        </h1>

        <div className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-gray-400 mb-2 text-xs md:text-sm font-medium">
              اسم المستخدم (اللقب)
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm md:text-base text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600"
              placeholder="مثال: Ahmed_123"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-xs md:text-sm font-medium">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm md:text-base text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600"
              placeholder="الاسم الحقيقي"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2 text-xs md:text-sm font-medium">
              نبذة عنك (Bio)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-sm md:text-base text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none h-24 resize-none transition-all placeholder-gray-600 leading-relaxed"
              placeholder="اكتب شيئاً مختصراً عنك..."
            />
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={updateProfile}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-indigo-900/20 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                "حفظ التعديلات"
              )}
            </button>

            <Link
              href="/profile"
              className="block text-center text-gray-400 hover:text-white text-sm py-2 transition-colors hover:bg-gray-700/50 rounded-lg"
            >
              إلغاء والعودة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
