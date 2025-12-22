"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Profile } from "@/app/components/AuthProvider";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { useAuth } from "@/app/components/AuthProvider";

type Achievement = {
  id: string;
  title: string;
  description: string;
};

export default function ProfilePage() {
  const { user, globalLevel, globalXp, subjectsProgress } = useAuth();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*");
      const { data: myAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (achievementsData) setAllAchievements(achievementsData);
      if (myAchievements)
        setUnlockedIds(myAchievements.map((item) => item.achievement_id));
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading)
    return (
      <div className="text-center p-10 text-white">
        جاري تحميل الملف الشخصي...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 p-3 md:p-6 text-white pb-20 overflow-x-hidden">
      <header className="max-w-4xl mx-auto mb-8 md:mb-12 bg-gradient-to-b from-gray-800 to-gray-900 p-5 md:p-8 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <button
          onClick={handleLogout}
          className="absolute top-4 left-4 z-20 p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all flex items-center gap-2 group"
          title="تسجيل الخروج"
        >
          <span className="text-xs font-bold hidden group-hover:inline-block transition-all">
            خروج
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 z-10 relative mt-4 md:mt-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-800 flex items-center justify-center border-4 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] shrink-0">
            <div className="text-center">
              <div className="text-[10px] md:text-xs text-indigo-300 font-bold tracking-widest uppercase">
                Level
              </div>
              <div className="text-4xl md:text-5xl font-black text-white">
                {globalLevel}
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-right space-y-2 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              الملف الشخصي
            </h1>
            <p className="text-indigo-200 text-sm md:text-base break-all">
              {user?.email}
            </p>

            <div className="bg-gray-950/50 p-3 md:p-4 rounded-lg border border-gray-700 mt-4 inline-block w-full">
              <div className="flex justify-between text-xs md:text-sm mb-2 text-gray-400">
                <span>إجمالي الخبرة المكتسبة</span>
                <span className="text-white font-mono">{globalXp} XP</span>
              </div>
              <div className="h-2 md:h-3 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 w-1/2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8 md:space-y-12">
        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
            <span className="text-xl md:text-2xl">⚡</span> القدرات العلمية
            (Skills)
          </h2>

          {subjectsProgress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {subjectsProgress.map((subject) => {
                const nextLvl = Math.pow(subject.level * 5, 2);
                const percent = Math.min(100, (subject.xp / nextLvl) * 100);

                return (
                  <div
                    key={subject.id}
                    className="bg-gray-900 p-4 md:p-5 rounded-xl border border-gray-800 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-900/10 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-base md:text-lg text-gray-100 group-hover:text-indigo-400 transition-colors">
                        {subject.name}
                      </h3>
                      <div className="bg-gray-800 px-2 py-1 md:px-3 md:py-1 rounded-md border border-gray-700 shrink-0">
                        <span className="text-[10px] md:text-xs text-gray-500 uppercase mr-1">
                          LVL
                        </span>
                        <span className="font-bold text-sm md:text-base text-indigo-400">
                          {subject.level}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] md:text-xs text-gray-500">
                        <span>{subject.xp} XP</span>
                        <span>{nextLvl} XP</span>
                      </div>
                      <div className="h-1.5 md:h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-6 md:p-8 bg-gray-900/50 rounded-xl border border-dashed border-gray-700 text-gray-500 text-sm md:text-base">
              لم تبدأ في دراسة أي مادة بعد. أكمل الدروس لرفع مستوياتك!
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
            <span className="text-xl md:text-2xl">🏆</span> الأوسمة والإنجازات
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {allAchievements.map((achievement) => {
              const isUnlocked = unlockedIds.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                    isUnlocked
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-600/50 shadow-lg shadow-yellow-900/10"
                      : "bg-gray-900 border-gray-800 opacity-60"
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 bg-yellow-500/10 rounded-bl-full -mr-6 -mt-6 md:-mr-8 md:-mt-8"></div>
                  )}

                  <div className="flex justify-between items-start relative z-10 gap-2">
                    <h3
                      className={`font-bold text-sm md:text-base ${
                        isUnlocked ? "text-yellow-500" : "text-gray-500"
                      }`}
                    >
                      {achievement.title}
                    </h3>
                    {isUnlocked ? (
                      <span className="text-lg md:text-xl shrink-0">🥇</span>
                    ) : (
                      <span className="text-lg md:text-xl grayscale opacity-30 shrink-0">
                        🔒
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm mt-2 md:mt-3 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
