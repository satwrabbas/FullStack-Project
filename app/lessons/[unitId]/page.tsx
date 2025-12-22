"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";

const CONFIDENCE_LEVELS = [
  { value: "🤯", label: "ضائع تماماً", color: "bg-red-900/50 border-red-500" },
  {
    value: "🤔",
    label: "غير متأكد",
    color: "bg-orange-900/50 border-orange-500",
  },
  { value: "😐", label: "عادي", color: "bg-yellow-900/50 border-yellow-500" },
  { value: "🙂", label: "جيد", color: "bg-blue-900/50 border-blue-500" },
  {
    value: "😎",
    label: "واثق جداً",
    color: "bg-green-900/50 border-green-500",
  },
];

type Lesson = {
  id: string;
  title: string;
  xp_value: number;
  order: number;
  completed: boolean;
  note: string | null;
  confidence: string | null;
  isNoteDirty?: boolean;
};

type Unit = {
  subject_id: string;
  title: string;
};

export default function UnitPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { user, isAdmin, updateLocalXP, refreshXP } = useAuth();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { unitId } = React.use(params);

  useEffect(() => {
    if (!user || !unitId) return;

    const fetchUnitAndLessons = async () => {
      setLoading(true);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, xp_value, order")
        .eq("unit_id", unitId)
        .order("order", { ascending: true });

      const lessonIds = lessonsData?.map((l) => l.id) || [];
      const { data: progressData, error: progressError } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, completed, note, confidence")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      const { data: unitData, error: unitError } = await supabase
        .from("units")
        .select("title, subject_id")
        .eq("id", unitId)
        .single();

      if (lessonsError || progressError || unitError) {
        console.error(
          "Error fetching data:",
          lessonsError || progressError || unitError
        );
      } else {
        const enrichedLessons = lessonsData.map((lesson) => {
          const progress = progressData?.find((p) => p.lesson_id === lesson.id);
          return {
            ...lesson,
            completed: progress?.completed || false,
            note: progress?.note || null,
            confidence: progress?.confidence || null,
            isNoteDirty: false,
          };
        });
        setUnit(unitData);
        setLessons(enrichedLessons);
      }
      setLoading(false);
    };

    fetchUnitAndLessons();
  }, [user, unitId]);

  const checkAndUnlockAchievements = async () => {
    if (!user || !unitId) return;

    const { count } = await supabase
      .from("user_lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);

    const achievementsToUnlock: string[] = [];
    if (count === 1) achievementsToUnlock.push("first_spark");
    if (count === 5) achievementsToUnlock.push("five_lessons");
    if (count === 10) achievementsToUnlock.push("ten_lessons");

    const { data: unitData } = await supabase
      .from("units")
      .select("linked_achievement_id, lessons(id)")
      .eq("id", unitId)
      .single();

    if (unitData?.linked_achievement_id) {
      const totalLessonsInUnit = unitData.lessons.length;

      const lessonIds = unitData.lessons.map((l: any) => l.id);
      const { count: completedInUnit } = await supabase
        .from("user_lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("lesson_id", lessonIds);

      if (completedInUnit === totalLessonsInUnit) {
        achievementsToUnlock.push(unitData.linked_achievement_id);
      }
    }

    for (const achievementId of achievementsToUnlock) {
      const { data: existing } = await supabase
        .from("user_achievements")
        .select("id")
        .eq("user_id", user.id)
        .eq("achievement_id", achievementId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("user_achievements").insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

        if (!error) {
          const { data: achievementDetails } = await supabase
            .from("achievements")
            .select("title")
            .eq("id", achievementId)
            .single();

          alert(
            `🏆 إنجاز مذهل! لقد حصلت على وسام: ${
              achievementDetails?.title || achievementId
            }`
          );
        }
      }
    }
  };

  const handleToggleComplete = async (
    lessonId: string,
    currentStatus: boolean
  ) => {
    if (!user) return;

    const lesson = lessons.find((l) => l.id === lessonId);
    const xpAmount = lesson?.xp_value || 0;

    const newStatus = !currentStatus;

    setLessons((prev) =>
      prev.map((l) => (l.id === lessonId ? { ...l, completed: newStatus } : l))
    );

    if (newStatus) {
      updateLocalXP(xpAmount);
    } else {
      updateLocalXP(-xpAmount);
    }

    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed: newStatus,
      },
      { onConflict: "user_id, lesson_id" }
    );

    if (error) {
      console.error("Error updating progress:", error.message);
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId ? { ...l, completed: !newStatus } : l
        )
      );
      updateLocalXP(newStatus ? -xpAmount : xpAmount);
    } else {
      if (newStatus === true) {
        checkAndUnlockAchievements();
        refreshXP();
      }
    }
  };

  const handleChangeConfidence = async (
    lessonId: string,
    newConfidence: string
  ) => {
    if (!user) return;

    setLessons((prev) =>
      prev.map((l) =>
        l.id === lessonId ? { ...l, confidence: newConfidence } : l
      )
    );

    const { data: existingProgress } = await supabase
      .from("user_lesson_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (existingProgress) {
      await supabase
        .from("user_lesson_progress")
        .update({ confidence: newConfidence })
        .eq("id", existingProgress.id);
    } else {
      await supabase.from("user_lesson_progress").insert({
        user_id: user.id,
        lesson_id: lessonId,
        confidence: newConfidence,
      });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدرس؟")) return;
    const { error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", lessonId);
    if (!error) {
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    } else {
      alert(error.message);
    }
  };

  const handleNoteChange = (lessonId: string, newNote: string) => {
    setLessons((prevLessons) =>
      prevLessons.map((l) =>
        l.id === lessonId ? { ...l, note: newNote, isNoteDirty: true } : l
      )
    );
  };

  const handleSaveNote = async (lessonId: string) => {
    if (!user) return;
    const lessonToSave = lessons.find((l) => l.id === lessonId);
    if (!lessonToSave) return;

    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        note: lessonToSave.note,

        completed: lessonToSave.completed,
        confidence: lessonToSave.confidence,
      },
      { onConflict: "user_id, lesson_id" }
    );

    if (error) {
      alert("حدث خطأ أثناء حفظ الملاحظة!");
    } else {
      setLessons((prev) =>
        prev.map((l) => (l.id === lessonId ? { ...l, isNoteDirty: false } : l))
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        جاري تحميل البيانات...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 p-3 md:p-8 text-gray-100 overflow-x-hidden">
      <header className="mb-6 md:mb-8 max-w-4xl mx-auto">
        <Link
          href={`/units/${unit?.subject_id}`}
          className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 mb-4 text-sm md:text-base"
        >
          <span>&larr;</span> العودة للوحدات
        </Link>
        <h1 className="text-xl md:text-3xl font-bold text-white break-words">
          {unit?.title || "..."}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto space-y-2 md:space-y-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`relative group rounded-lg shadow transition-colors border border-gray-700 overflow-hidden ${
              lesson.completed
                ? "bg-green-900/20 border-green-800"
                : "bg-gray-800"
            }`}
          >
            {isAdmin && (
              <button
                onClick={() => handleDeleteLesson(lesson.id)}
                className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] md:text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all backdrop-blur-sm shadow-sm"
              >
                حذف 🗑️
              </button>
            )}

            <div
              className={`h-1.5 md:h-2 w-full transition-all ${
                lesson.completed ? "bg-green-500" : "bg-gray-700"
              }`}
            />

            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:mb-6">
                <div className="w-full md:w-auto">
                  <h2
                    className={` md:text-xl font-bold transition-all break-words ${
                      lesson.completed
                        ? "text-gray-500 line-through"
                        : "text-white"
                    }`}
                  >
                    {lesson.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 md:mt-2 text-xs md:text-sm text-gray-400">
                    <span className="bg-gray-700 px-2 md:py-0.5 rounded text-gray-300">
                      {lesson.xp_value} XP
                    </span>
                    {lesson.completed && (
                      <span className="text-green-400 flex items-center gap-1 font-medium">
                        ✓ مكتمل
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleToggleComplete(lesson.id, lesson.completed)
                  }
                  className={`w-full md:w-auto px-5 py-1 md:py-2.5 rounded-lg font-medium transition-all transform active:scale-95 shadow-md text-sm md:text-base ${
                    lesson.completed
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-green-600 text-white hover:bg-green-500 hover:shadow-green-900/20"
                  }`}
                >
                  {lesson.completed ? "إلغاء الإكمال" : "إتمام الدرس"}
                </button>
              </div>

              <hr className="border-gray-700/50 md:my-4 my-1" />

              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 md:mb-3 block">
                  مستوى الفهم والثقة:
                </label>
                <div className="flex flex-wrap gap-2">
                  {CONFIDENCE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() =>
                        handleChangeConfidence(lesson.id, level.value)
                      }
                      title={level.label}
                      className={`
                        flex-1 md:flex-none justify-center
                        px-3 md:py-2 rounded-lg border transition-all flex items-center gap-2 text-xs md:text-sm
                        ${
                          lesson.confidence === level.value
                            ? `${level.color} border-opacity-100 scale-105 shadow-md font-bold text-white`
                            : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100"
                        }
                      `}
                    >
                      <span className="text-base md:text-lg">
                        {level.value}
                      </span>

                      <span
                        className={`whitespace-nowrap ${
                          lesson.confidence === level.value
                            ? "inline"
                            : "hidden sm:inline"
                        }`}
                      >
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    📝 ملاحظاتك الخاصة:
                  </label>

                  {lesson.isNoteDirty && (
                    <span className="text-yellow-500 text-[10px] md:text-xs animate-pulse font-medium">
                      ● تم التعديل (غير محفوظ)
                    </span>
                  )}
                </div>

                <textarea
                  placeholder="سجل أفكارك، قوانين مهمة، أو أسئلة للمراجعة..."
                  value={lesson.note || ""}
                  onChange={(e) => handleNoteChange(lesson.id, e.target.value)}
                  className="w-full bg-gray-900/50 text-gray-200 p-3 md:p-4 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y min-h-[100px] text-sm leading-relaxed placeholder-gray-600"
                />

                {lesson.isNoteDirty && (
                  <div className="absolute bottom-3 left-3 animate-fade-in z-10">
                    <button
                      onClick={() => handleSaveNote(lesson.id)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium shadow-lg shadow-indigo-900/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>حفظ</span>
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
