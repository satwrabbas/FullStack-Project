// app/dashboard/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase/client';
import Link from 'next/link';

// 1. تعديل: تغيير title إلى name ليطابق قاعدة البيانات
type Subject = {
  id: string;
  name: string; // تم التعديل هنا
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [subjects , setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      const fetchSubjects = async () => {
        setLoading(true);
        // لا يوجد تغيير هنا، الكود صحيح
        const { data: subjectData, error } = await supabase
          .from('subjects')
          .select('id, name'); // يمكن تحديد الأعمدة لتحسين الأداء

        if (error) {
          console.error('Error fetching subjects:', error);
        } else {
          setSubjects(subjectData);
        }
        setLoading(false);
      };

      fetchSubjects();
    }
  }, [user, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  if (loading) {
    return <div className="text-center p-10">يتم تحميل المواد الدراسية...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800 p-8 text-white">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-gray-400">أهلاً بك، {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          تسجيل الخروج
        </button>
      </header>
      
      <main>
        <h2 className="text-2xl font-semibold mb-4">المواد الدراسية:</h2>
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 2. تعديل: تغيير اسم المتغير من unit إلى subject للوضوح */}
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                {/* تعديل: استخدام subject.name */}
                <h3 className="text-xl font-bold text-indigo-400">{subject.name}</h3>
                <Link 
                  href={`/units/${subject.id}`}
                  className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  {/* 3. تعديل: تغيير النص ليعكس الوظيفة الصحيحة */}
                  عرض الوحدات
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>لم يتم العثور على مواد دراسية.</p>
        )}
      </main>
    </div>
  );
}