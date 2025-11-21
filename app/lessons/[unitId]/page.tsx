// app/lessons/[unitId]/page.tsx

"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/components/AuthProvider';

// تعريف أنواع البيانات لتطابق قاعدة بياناتك
type Lesson = {
  id: string;
  title: string;
  xp_value: number;
  order: number;
  completed: boolean; // سيتم إضافتها بعد الدمج
  note: string | null;
};
type Unit = {
  subject_id: string;
  title: string;
};

export default function UnitPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { user } = useAuth();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { unitId } = React.use(params);

  useEffect(() => {
    if (!user || !unitId) return;

    const fetchUnitAndLessons = async () => {
      setLoading(true);

      // الخطوة 1: جلب الدروس الأساسية للوحدة، مع الفرز بعمود 'order'
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, xp_value, order') // جلب عمود order
        .eq('unit_id', unitId)
        .order('order', { ascending: true }); // **التعديل 1: استخدام عمود order للفرز**
      // ... بقية منطق جلب البيانات ودمجها يبقى كما هو ...
      const lessonIds = lessonsData?.map(l => l.id) || [];
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed , note')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('title, subject_id')
        .eq('id', unitId)
        .single();
      
      if (lessonsError || progressError || unitError) {
        console.error('Error fetching data:', lessonsError || progressError || unitError);
      } else {
        const enrichedLessons = lessonsData.map(lesson => {
          const progress = progressData?.find(p => p.lesson_id === lesson.id);
          return {
            ...lesson,
            completed: progress?.completed || false,
            note: progress?.note || null, 
          };
        });
        setUnit(unitData);
        setLessons(enrichedLessons);
      }
      setLoading(false);
    };

    fetchUnitAndLessons();
  }, [user, unitId]);
  
  // **التعديل 2: منطق جديد وأكثر قوة لتحديث التقدم**
  const handleToggleComplete = async (lessonId: string, currentStatus: boolean) => {
    if (!user) return;

    const newStatus = !currentStatus;

    // أولاً، تحقق مما إذا كان هناك سجل تقدم موجود بالفعل
    const { data: existingProgress, error: selectError } = await supabase
      .from('user_lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle(); // .maybeSingle() يرجع صفًا واحدًا أو null، وهو مثالي لهذا

    if (selectError) {
      console.error('Error checking for progress:', selectError);
      return;
    }

    let error;
    if (existingProgress) {
      // إذا كان السجل موجودًا، قم بتحديثه
      ({ error } = await supabase
        .from('user_lesson_progress')
        .update({ completed: newStatus })
        .eq('id', existingProgress.id));
    } else {
      // إذا لم يكن موجودًا، قم بإضافة سجل جديد
      ({ error } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: newStatus
        }));
    }

    if (error) {
      console.error('Error updating progress:', error.message);
    } else {
      // تحديث الحالة محليًا لعرض التغيير فورًا
      setLessons(prevLessons => 
        prevLessons.map(l => 
          l.id === lessonId ? { ...l, completed: newStatus } : l
        )
      );
    }
  };
// 1. تعديل دالة handleNoteChange لتحديث الحالة المحلية فقط
  const handleNoteChange = (lessonId: string, newNote: string) => {
    setLessons(prevLessons =>
      prevLessons.map(l =>
        l.id === lessonId ? { ...l, note: newNote } : l
      )
    );
  };


  // 2. دالة جديدة للحفظ عند النقر على الزر
  const handleSaveNote = async (lessonId: string) => {
    if (!user) return;

    // العثور على الملاحظة الحالية من الحالة
    const lessonToSave = lessons.find(l => l.id === lessonId);
    if (!lessonToSave) return;
    
    const { error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        note: lessonToSave.note,
      }, { onConflict: 'user_id, lesson_id' }); // هنا upsert يعمل جيدًا

    if (error) {
      alert('حدث خطأ أثناء حفظ الملاحظة!');
      console.error('Error saving note:', error);
    } else {
      alert('تم حفظ الملاحظة بنجاح!');
    }
  };

  if (loading) {
    return <div className="text-center p-10">يتم تحميل الدروس...</div>;
  }

  // واجهة المستخدم (JSX) تبقى كما هي، لأنها تعتمد على الحالة (state) التي قمنا بتعديلها
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <header className="mb-8">
        <Link href={`/units/${unit?.subject_id}`}> {/* يمكنك تعديل هذا الرابط لاحقًا */}
          &larr; العودة إلى الوحدات
        </Link>
        <h1 className="text-3xl font-bold mt-2">{unit?.title || 'وحدة دراسية'}</h1>
      </header>

      <main>
        <div className="space-y-4">
          {lessons.map((lesson) => (
            //  ▼▼▼ هذا هو العنصر الأب الوحيد الذي يجب أن يرجعه الـ map ▼▼▼
            <div key={lesson.id} className={`p-4 rounded-lg shadow transition-colors ${lesson.completed ? 'bg-green-500' : 'bg-white'}`}>
              
              {/* الجزء العلوي: العنوان والزر */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className={`text-lg font-semibold ${lesson.completed ? 'text-gray-500 line-through' : ''}`}>
                    {lesson.title}
                  </h2>
                  <p className="text-sm text-gray-500">نقاط الخبرة: {lesson.xp_value} XP</p>
                </div>
                <button 
                  onClick={() => handleToggleComplete(lesson.id, lesson.completed)}
                  className={`px-4 py-2 text-sm font-medium text-black rounded-md ${lesson.completed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {lesson.completed ? 'تم الإكمال' : 'إكمال الدرس'}
                </button>
              </div>

              {/* الجزء السفلي: حقل الملاحظات (الآن بداخل العنصر الأب) */}
              <div className="mt-4">
                <textarea
                  placeholder="اكتب ملاحظاتك هنا..."
                  value={lesson.note || ''}
                  // استدعاء الدالة التي تحدث الحالة المحلية فقط
                  onChange={(e) => handleNoteChange(lesson.id, e.target.value)}
                  className="bg-gray-900 text-white w-full p-2 text-l border border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                />
                <button 
                  onClick={() => handleSaveNote(lesson.id)}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  حفظ الملاحظة
                </button>
              </div>

            </div> //  ▲▲▲ إغلاق العنصر الأب الوحيد ▲▲▲
          ))}
        </div>
      </main>
    </div>
  );
}