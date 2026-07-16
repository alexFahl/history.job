import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * useUiStore
 *
 * Global UI state, persisted to localStorage via the `persist` middleware.
 *
 * State:
 *   selectedProfile : The full profile object the user clicked on the selector screen.
 *                     Used on the Dashboard and ApplicationDetail to know which
 *                     profile's data to load and display in the Navbar.
 */
const useUiStore = create(
  persist(
    (set) => ({
      selectedProfile: null,

      setSelectedProfile: (profile) => set({ selectedProfile: profile }),

      clearSelectedProfile: () => set({ selectedProfile: null }),
    }),
    {
      name: "ui-storage", // The localStorage key where this state is saved
    },
  ),
);

export default useUiStore;
