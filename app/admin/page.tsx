"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";

type Subject = { id: string; name: string };
type Unit = { id: string; title: string };

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [unitsForLesson, setUnitsForLesson] = useState<Unit[]>([]);

  const [subjectName, setSubjectName] = useState("");

  const [unitSubjectId, setUnitSubjectId] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitOrder, setUnitOrder] = useState(1);

  const [lessonSubjectId, setLessonSubjectId] = useState("");
  const [lessonUnitId, setLessonUnitId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonXP, setLessonXP] = useState(100);
  const [lessonOrder, setLessonOrder] = useState(1);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const init = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profile?.is_admin) {
        setIsAdmin(true);

        const { data } = await supabase
          .from("subjects")
          .select("*")
          .order("name");
        if (data) setSubjects(data);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    };
    init();
  }, [user, router]);

  useEffect(() => {
    const fetchUnits = async () => {
      if (!lessonSubjectId) {
        setUnitsForLesson([]);
        return;
      }
      const { data } = await supabase
        .from("units")
        .select("id, title")
        .eq("subject_id", lessonSubjectId)
        .order("order");

      if (data) setUnitsForLesson(data);
    };
    fetchUnits();
  }, [lessonSubjectId]);

  const handleAddSubject = async () => {
    if (!subjectName) return;
    const { error } = await supabase
      .from("subjects")
      .insert({ name: subjectName });
    if (!error) {
      alert("تمت إضافة المادة!");
      setSubjectName("");

      const { data } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (data) setSubjects(data);
    } else alert(error.message);
  };

  const handleAddUnit = async () => {
    if (!unitTitle || !unitSubjectId) return;
    const { error } = await supabase.from("units").insert({
      title: unitTitle,
      subject_id: unitSubjectId,
      order: unitOrder,
    });
    if (!error) {
      alert("تمت إضافة الوحدة!");
      setUnitTitle("");

      setUnitOrder((prev) => prev + 1);
    } else alert(error.message);
  };

  const handleAddLesson = async () => {
    if (!lessonTitle || !lessonUnitId) return;
    const { error } = await supabase.from("lessons").insert({
      title: lessonTitle,
      unit_id: lessonUnitId,
      xp_value: lessonXP,
      order: lessonOrder,
    });
    if (!error) {
      alert("تمت إضافة الدرس بنجاح!");
      setLessonTitle("");
      setLessonOrder((prev) => prev + 1);
    } else alert(error.message);
  };

  if (loading)
    return <div className="p-10 text-center text-white">جاري التحميل...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 text-red-500 flex items-center gap-2">
        <span>🛠️</span> لوحة التحكم والإدارة
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-blue-400 border-b border-gray-800 pb-2">
            1. إضافة مادة
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                اسم المادة
              </label>
              <input
                type="text"
                placeholder="مثلاً: الفيزياء"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={handleAddSubject}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
            >
              حفظ المادة
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-green-400 border-b border-gray-800 pb-2">
            2. إضافة وحدة
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                تابع للمادة
              </label>
              <select
                value={unitSubjectId}
                onChange={(e) => setUnitSubjectId(e.target.value)}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 outline-none"
              >
                <option value="">اختر المادة...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                عنوان الوحدة
              </label>
              <input
                type="text"
                placeholder="مثلاً: الميكانيكا"
                value={unitTitle}
                onChange={(e) => setUnitTitle(e.target.value)}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                الترتيب (Order)
              </label>
              <input
                type="number"
                value={unitOrder}
                onChange={(e) => setUnitOrder(Number(e.target.value))}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-green-500 outline-none"
              />
            </div>
            <button
              onClick={handleAddUnit}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition-colors"
            >
              حفظ الوحدة
            </button>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg h-fit">
          <h2 className="text-xl font-bold mb-4 text-purple-400 border-b border-gray-800 pb-2">
            3. إضافة درس
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                1. اختر المادة (للفلترة)
              </label>
              <select
                value={lessonSubjectId}
                onChange={(e) => {
                  setLessonSubjectId(e.target.value);
                  setLessonUnitId("");
                }}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-purple-500 outline-none"
              >
                <option value="">اختر المادة...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                2. اختر الوحدة
              </label>
              <select
                value={lessonUnitId}
                onChange={(e) => setLessonUnitId(e.target.value)}
                disabled={!lessonSubjectId}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-purple-500 outline-none disabled:opacity-50"
              >
                <option value="">
                  {lessonSubjectId ? "اختر الوحدة..." : "اختر مادة أولاً"}
                </option>
                {unitsForLesson.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                عنوان الدرس
              </label>
              <input
                type="text"
                placeholder="عنوان الدرس"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-purple-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  نقاط XP
                </label>
                <input
                  type="number"
                  value={lessonXP}
                  onChange={(e) => setLessonXP(Number(e.target.value))}
                  className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">
                  الترتيب
                </label>
                <input
                  type="number"
                  value={lessonOrder}
                  onChange={(e) => setLessonOrder(Number(e.target.value))}
                  className="w-full p-2 bg-black border border-gray-700 rounded text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddLesson}
              disabled={!lessonUnitId}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              حفظ الدرس
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
