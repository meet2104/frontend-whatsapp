/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useContext } from "react";
import type { PropsWithChildren } from "react";
import API from "../services/api/axios";
import { connectSocket, disconnectSocket } from "../services/socket";

/* ================= USER TYPE ================= */

type Role = "SUPER_ADMIN" | "ADMIN" | "SHOP_OWNER";

interface User {
  id: string;
  email: string;
  role: Role; // ✅ STRING ONLY
  name: string;

  // ✅ REQUIRED FOR HEADER AVATAR
  profileImage?: {
    url?: string;
    publicId?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // 🔥 UPDATED TYPE (NON-BREAKING)
  updateUser: (user: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

/* ======================================================
   🔒 STRICT MODE SAFE PROFILE FETCH (DEDUPED)
   ====================================================== */
let profilePromise: Promise<any> | null = null;

const getProfileOnce = async () => {
  if (!profilePromise) {
    profilePromise = API.get("/profile").finally(() => {
      profilePromise = null;
    });
  }
  return profilePromise;
};

/* ================= ROLE NORMALIZER ================= */
const normalizeRole = (role: any): Role => {
  const value = role?.name || role;
  return value?.toUpperCase() as Role;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= INIT AUTH ================= */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await getProfileOnce();

        const normalizedUser: User = {
          ...res.data,
          role: normalizeRole(res.data.role),
          name: `${res.data.firstName ?? ""} ${res.data.lastName ?? ""}`.trim(),
        };

        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        // 🔥 SOCKET RECONNECT
        connectSocket({
          userId: normalizedUser.id,
          role: normalizedUser.role,
          name: normalizedUser.name,
          token,
        });
      } catch {
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /* ================= LOGIN ================= */
  const login = async (email: string, password: string) => {
    const res = await API.post("/auth/login", { email, password });

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    const profile = await getProfileOnce();

    const normalizedUser: User = {
      ...profile.data,
      role: normalizeRole(profile.data.role),
      name: `${profile.data.firstName ?? ""} ${profile.data.lastName ?? ""}`.trim(),
    };

    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));

    connectSocket({
      userId: normalizedUser.id,
      role: normalizedUser.role,
      name: normalizedUser.name,
      token: res.data.accessToken,
    });
  };

  /* ================= UPDATE USER (🔥 FINAL FIX) ================= */
  const updateUser = (updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const mergedUser: User = {
        ...prev,        // ✅ keep role, id, email
        ...updatedUser, // ✅ update only changed fields
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      return mergedUser;
    });
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    disconnectSocket();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);