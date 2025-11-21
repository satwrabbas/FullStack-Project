// app/units/[id]/page.tsx

"use client"; // حافظنا عليها لأننا نستخدم useState و useEffect

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase/client';
import React from 'react'; // React.use يحتاج إلى استيراد React

// 1. تعريف أنواع البيانات الصحيحة لهذه الصفحة
type Unit = {
  id: string;
  title: string;
};
type Subject = {
  name: string;
};

// 2. استقبال params بنفس الطريقة التي طلبتها
export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { id: subjectId } = React.use(params); // استخراج id المادة وتسميته subjectId للوضوح

  useEffect(() => {
    if (!subjectId) return;

    // 3. هذا هو المنطق الجديد والصحيح
    const fetchSubjectAndUnits = async () => {
      setLoading(true);

      // جلب اسم المادة لوضعه في العنوان
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('name')
        .eq('id', subjectId)
        .single();

      // جلب الوحدات التي تنتمي لهذه المادة
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('id, title')
        .eq('subject_id', subjectId) // الشرط الأهم: البحث باستخدام subject_id
        .order('order', { ascending: true });

      if (subjectError || unitsError) {
        console.error('Error fetching data:', subjectError || unitsError);
      } else {
        setSubject(subjectData);
        setUnits(unitsData);
      }
      setLoading(false);
    };

    fetchSubjectAndUnits();
  }, [subjectId]);

  if (loading) {
    return <div className="text-center p-10 text-white">يتم تحميل الوحدات...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <header className="mb-8">
        <Link href="/dashboard" className="text-indigo-400 hover:underline">
          &larr; العودة إلى لوحة التحكم
        </Link>
        <h1 className="text-3xl font-bold mt-2">وحدات مادة: {subject?.name || '...'}</h1>
      </header>

      <main>
        <div className="space-y-4">
          {units.length > 0 ? (
            units.map((unit) => (
              <div key={unit.id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow">
                <div>
                  <h2 className="text-lg font-semibold text-gray-100">{unit.title}</h2>
                </div>
                {/* 4. هذا الرابط سينقلنا الآن إلى الصفحة التالية لعرض الدروس */}
                <Link 
                  href={`/lessons/${unit.id}`} // الرابط الآن يشير إلى صفحة الوحدة
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  عرض الدروس
                </Link>
              </div>
            ))
          ) : (
            <p>لا توجد وحدات متاحة في هذه المادة بعد.</p>
          )}
        </div>
      </main>
    </div>
  );
}