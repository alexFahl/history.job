import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * useAuthStore
 *
 * Global authentication state persisted to localStorage
 *
 * State:
 *   token  : The JWT string returned by the API on login/register
 *   user   : Basic user info { id, username }
 *
 * Actions:
 *   setAuth(token, user) : Called after a successful login or register
 *   clearAuth()          : Called on logout
 */
const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage", // The localStorage key where this state is saved
    },
  ),
);

export default useAuthStore;
