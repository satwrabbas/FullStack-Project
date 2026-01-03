"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, globalXp, globalLevel, profile } = useAuth();

  if (!user) return null;

  const nextLevelXp = Math.pow(globalLevel * 5, 2);
  const currentLevelBaseXp = Math.pow((globalLevel - 1) * 5, 2);
  const totalRange = nextLevelXp - currentLevelBaseXp;
  const currentProgress = globalXp - currentLevelBaseXp;

  const progressPercent = Math.min(
    100,
    Math.max(0, (currentProgress / totalRange) * 100)
  );

  return (
    <header className="bg-gray-800 border-b border-gray-700 text-white p-1 md:p-3 sticky top-0 z-200 shadow-lg bg-opacity-95 backdrop-blur-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/dashboard"
          className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-80 transition-opacity flex items-center gap-1 md:gap-2 shrink-0"
        >
          <Image
            src="/logo.svg"
            alt="شعار المنصة"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="hidden xs:inline sm:inline">منصة البكالوريا</span>
        </Link>

        <div className="flex items-center gap-2 bg-gray-900 px-2 py-1 rounded-full border border-gray-700 shadow-inner max-w-full">
          <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-indigo-600 rounded-full border-2 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0">
            <span className="font-bold text-xs md:text-sm">{globalLevel}</span>
          </div>

          <div className="hidden sm:flex flex-col w-24 sm:w-32">
            <div className="flex justify-between text-[10px] text-gray-400 mb-0.5 px-1">
              <span>LVL {globalLevel}</span>
              <span>{Math.floor(progressPercent)}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Link
            href="/leaderboard"
            className="p-1.5 md:p-2 hover:bg-gray-700 rounded-full transition-colors group relative shrink-0"
            title="لوحة الأساطير"
          >
            <span className="text-lg md:text-xl filter grayscale group-hover:grayscale-0 transition-all">
              🏆
            </span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-2 hover:bg-gray-800 p-0.5 md:p-1 md:pr-3 rounded-full transition-all group shrink-0"
          >
            <div className="text-right hidden md:block">
              <div className="text-xs text-white font-bold">
                {profile?.full_name || "البطل"}
              </div>
              <div className="text-[10px] text-gray-400">
                @{profile?.username || "user"}
              </div>
            </div>

            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600 group-hover:border-indigo-500 transition-colors">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                  alt="avatar"
                />
              ) : (
                <span>👤</span>
              )}
            </div>
          </Link>

          {profile?.is_admin && (
            <Link
              href="/admin"
              className="ml-1 md:mr-3 px-2 py-1 bg-red-600/20 text-red-400 border border-red-600/50 rounded-full hover:bg-red-600/30 transition-all text-[10px] md:text-xs font-bold shrink-0"
            >
              <span className="md:hidden">🛠️</span>
              <span className="hidden md:inline">🛠️ إدارة</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
