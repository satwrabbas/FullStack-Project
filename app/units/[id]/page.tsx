"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { supabase } from "@/app/lib/supabase/client";
import React from "react";

type Unit = {
  id: string;
  title: string;
};
type Subject = {
  name: string;
};

export default function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, isAdmin } = useAuth();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { id: subjectId } = React.use(params);

  useEffect(() => {
    if (!subjectId) return;

    const fetchSubjectAndUnits = async () => {
      setLoading(true);

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("name")
        .eq("id", subjectId)
        .single();

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, title")
        .eq("subject_id", subjectId)
        .order("order", { ascending: true });

      if (subjectError || unitsError) {
        console.error("Error fetching data:", subjectError || unitsError);
      } else {
        setSubject(subjectData);
        setUnits(unitsData);
      }
      setLoading(false);
    };

    fetchSubjectAndUnits();
  }, [subjectId]);

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("حذف هذه الوحدة؟ سيتم حذف دروسها أيضاً.")) return;
    const { error } = await supabase.from("units").delete().eq("id", unitId);
    if (!error) {
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
    } else {
      alert(error.message);
    }
  };
  if (loading) {
    return (
      <div className="text-center p-10 text-white">يتم تحميل الوحدات...</div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 p-3 md:p-8 text-white overflow-x-hidden">
      <header className="mb-6 md:mb-8 max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 mb-4 text-sm md:text-base"
        >
          <span>&larr;</span> العودة إلى لوحة التحكم
        </Link>
        <h1 className="text-xl md:text-3xl font-bold mt-2 break-words">
          وحدات مادة: {subject?.name || "..."}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="space-y-1 md:space-y-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="relative group bg-gray-800 p-3 md:p-6 rounded-lg shadow border border-gray-700 hover:border-indigo-500 transition-all"
            >
              {/* 
                 زر الحذف (للأدمن فقط)
                 في الموبايل: (opacity-100) ظاهر دائماً
                 في اللابتوب: (md:opacity-0) مخفي ويظهر عند التمرير
              */}
              {isAdmin && (
                <button
                  onClick={() => handleDeleteUnit(unit.id)}
                  className="absolute top-2 left-2 z-20 bg-red-500/80 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] md:text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all backdrop-blur-sm shadow-sm flex items-center gap-1"
                >
                  <span>حذف</span>
                  <span>✕</span>
                </button>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-auto">
                  <h2 className=" md:text-xl font-semibold text-gray-100 break-words leading-relaxed">
                    {unit.title}
                  </h2>
                </div>

                <Link
                  href={`/lessons/${unit.id}`}
                  className="w-full md:w-auto text-center px-5  py-1 md:py-2 text-sm md:text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-900/20 transition-all transform active:scale-95 z-10"
                >
                  عرض الدروس
                </Link>
              </div>
            </div>
          ))}
        </div>

        {units.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-lg border border-gray-700 border-dashed">
            <p>لا توجد وحدات مضافة لهذه المادة بعد.</p>
          </div>
        )}
      </main>
    </div>
  );
}
