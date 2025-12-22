"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/client";
import Link from "next/link";

type Profile = {
  id: string;
  username: string;
  full_name: string;
  total_xp: number;
  avatar_url: string | null;
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, total_xp, avatar_url")
        .order("total_xp", { ascending: false })
        .limit(20);

      if (data) {
        setLeaders(data);
      }
      setLoading(false);
    };

    fetchLeaders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <header className="max-w-2xl mx-auto mb-10 text-center">
        <Link
          href="/dashboard"
          className="text-indigo-400 hover:underline mb-4 block"
        >
          &larr; العودة للرئيسية
        </Link>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-sm">
          🏆 لوحة الأساطير
        </h1>
        <p className="text-gray-400 mt-2">أفضل الطلاب أداءً في المنصة</p>
      </header>

      <div className="max-w-2xl mx-auto bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            جاري تحميل الأبطال...
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {leaders.map((profile, index) => {
              let rankColor = "text-gray-400";
              let rankIcon = `#${index + 1}`;
              let bgColor = "bg-transparent";

              if (index === 0) {
                rankColor = "text-yellow-400";
                rankIcon = "👑";
                bgColor = "bg-yellow-900/10";
              }
              if (index === 1) {
                rankColor = "text-gray-300";
                rankIcon = "🥈";
                bgColor = "bg-gray-800/50";
              }
              if (index === 2) {
                rankColor = "text-orange-400";
                rankIcon = "🥉";
                bgColor = "bg-orange-900/10";
              }

              return (
                <div
                  key={profile.id}
                  className={`flex items-center p-4 ${bgColor} hover:bg-gray-800 transition-colors`}
                >
                  <div
                    className={`w-12 text-2xl font-bold text-center ${rankColor}`}
                  >
                    {rankIcon}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg mr-4 border border-gray-600">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-white">
                      {profile.full_name || profile.username || "مستخدم مجهول"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      @{profile.username || "unknown"}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-indigo-400 text-lg">
                      {profile.total_xp.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
