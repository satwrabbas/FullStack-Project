"use client";

import Link from "next/link";
import { useAuth } from "./components/AuthProvider";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[800px] h-[300px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-300 text-sm font-medium mb-6">
            ✨ طريقك نحو الجامعة يبدأ من هنا
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            تفوّق في البكالوريا <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              في جميع المواد
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            منصة تعليمية متكاملة تتيح لك تنظيم دراستك لمواد الرياضيات، الفيزياء،
            العلوم، واللغات. تتبع تقدمك لحظة بلحظة، واجمع النقاط، ونافس زملاءك
            لتكون الأول على الدفعة.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-20">
          {user ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <span>الذهاب للمواد الدراسية</span>
              <span>📚</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                أنشئ حساباً مجانياً
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-transparent border border-gray-700 hover:border-gray-500 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center"
              >
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl text-right">
          <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-colors group">
            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📚
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              كل المواد في مكان واحد
            </h3>
            <p className="text-gray-400">
              نظم وقتك بين الرياضيات، الفيزياء، العلوم، واللغات. كل مادة لها
              مسارها الخاص.
            </p>
          </div>

          <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-colors group">
            <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🧠
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">قيم فهمك</h3>
            <p className="text-gray-400">
              لا تكتفِ بـ{"تم"}. حدد مدى ثقتك في كل درس (من{"ضائع"}إلى {"واثق"})
              لتعرف ما يحتاج للمراجعة.
            </p>
          </div>

          <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-colors group">
            <div className="w-12 h-12 bg-yellow-900/30 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏆
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">كن الأسطورة</h3>
            <p className="text-gray-400">
              طور {"شخصيتك الدراسية"}. كل درس تنهيه يزيد من مستواك ويرفع ترتيبك
              بين الطلاب.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
        <p>© 2024 منصة البكالوريا التعليمية. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
