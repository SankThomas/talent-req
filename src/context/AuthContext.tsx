import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { TeamMember } from "@/types";

interface AuthContexValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: TeamMember | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContexValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  const profile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const createProfile = useMutation(api.users.createOrUpdateProfile);
  const [profileNeedsCreation, setProfileNeedsCreation] = useState(false);

  const currentProfile = (profile ?? null) as TeamMember | null;

  useEffect(() => {
    if (isAuthenticated && profile === null && !isLoading) {
      setProfileNeedsCreation(true);
    } else if (profile) {
      setProfileNeedsCreation(false);
    }
  }, [isAuthenticated, profile, isLoading]);

  const signIn = async (email: string, password: string) => {
    try {
      await convexSignIn("password", { email, password, flow: "signIn" });
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      return { error: message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await convexSignIn("password", { email, password, flow: "signUp" });
      setProfileNeedsCreation(true);
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      return { error: message };
    }
  };

  const signOut = async () => {
    await convexSignOut();
    setProfileNeedsCreation(false);
  };

  const refreshProfile = () => {
    // No manual refresh needed because Convex.
  };

  useEffect(() => {
    if (profileNeedsCreation && isAuthenticated) {
      (async () => {
        const email =
          localStorage.getItem("signup_email") ?? "user@example.com";
        const fullName = localStorage.getItem("signup_name") ?? "New user";

        await createProfile({
          fullName,
          email,
          role: "recruiter",
        });

        localStorage.removeItem("signup_email");
        localStorage.removeItem("signup_name");
        setProfileNeedsCreation(false);
      })();
    }
  }, [profileNeedsCreation, isAuthenticated, createProfile]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        profile: currentProfile,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
