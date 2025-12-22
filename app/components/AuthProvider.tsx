"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase/client";
import { User } from "@supabase/supabase-js";

type XPDataResponse = {
  lessons: {
    xp_value: number;
    units: {
      subjects: {
        id: string;
        name: string;
      } | null;
    } | null;
  } | null;
};

export type SubjectProgress = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

export type Profile = {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  is_admin: boolean;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  globalXp: number;
  globalLevel: number;
  subjectsProgress: SubjectProgress[];
  refreshXP: () => Promise<void>;
  updateLocalXP: (amount: number) => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  globalXp: 0,
  globalLevel: 1,
  subjectsProgress: [],
  refreshXP: async () => {},
  updateLocalXP: () => {},
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [globalXp, setGlobalXp] = useState(0);
  const [globalLevel, setGlobalLevel] = useState(1);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>(
    []
  );
  const [profile, setProfile] = useState<Profile | null>(null);

  const calculateLevel = (xp: number) => Math.floor(1 + Math.sqrt(xp) / 5);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (data?.is_admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  };

  const fetchXPData = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select(
        `
        lesson_id,
        lessons (
          xp_value,
          units (
            subjects (
              id,
              name
            )
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("completed", true);

    if (error) {
      console.error("Error fetching XP:", error);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    let totalGlobalXP = 0;
    const subjectsMap: Record<string, SubjectProgress> = {};

    data?.forEach((row) => {
      const item = row as unknown as XPDataResponse;

      const lesson = item.lessons;
      if (lesson && lesson.units && lesson.units.subjects) {
        const xpValue = lesson.xp_value || 0;
        const subject = lesson.units.subjects;

        totalGlobalXP += xpValue;

        if (!subjectsMap[subject.id]) {
          subjectsMap[subject.id] = {
            id: subject.id,
            name: subject.name,
            xp: 0,
            level: 1,
          };
        }
        subjectsMap[subject.id].xp += xpValue;
      }
    });

    const processedSubjects = Object.values(subjectsMap).map((sub) => ({
      ...sub,
      level: calculateLevel(sub.xp),
    }));

    setGlobalXp(totalGlobalXP);
    setGlobalLevel(calculateLevel(totalGlobalXP));
    setSubjectsProgress(processedSubjects);
  };

  const updateLocalXP = (amount: number) => {
    setGlobalXp((prev) => {
      const newXp = prev + amount;
      setGlobalLevel(calculateLevel(newXp));
      return newXp;
    });
  };
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchXPData(session.user.id);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchXPData(session.user.id);
          checkAdmin(session.user.id);
        } else {
          setGlobalXp(0);
          setGlobalLevel(1);
          setSubjectsProgress([]);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const refreshXP = async () => {
    if (user) {
      await fetchXPData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        globalXp,
        globalLevel,
        subjectsProgress,
        refreshXP,
        updateLocalXP,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
