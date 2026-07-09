import { create } from "zustand";

/**
 * useUiStore
 *
 * Global UI state resets on page refresh
 *
 * State:
 *   selectedProfile : The full profile object the user clicked on the selector screen
 *                     Used on the Dashboard to know which profile's data to load
 */
const useUiStore = create((set) => ({
  selectedProfile: null,

  setSelectedProfile: (profile) => set({ selectedProfile: profile }),

  clearSelectedProfile: () => set({ selectedProfile: null }),
}));

export default useUiStore;
