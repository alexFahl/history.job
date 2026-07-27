import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STATUS_ORDER } from "../utils/constants";

/**
 * useUiStore
 *
 * Global UI state, persisted to localStorage via the `persist` middleware.
 *
 * State:
 *   selectedProfile : The full profile object the user clicked on the selector screen.
 *                     Used on the Dashboard and ApplicationDetail to know which
 *                     profile's data to load and display in the Navbar.
 *   visibleColumns  : Array of Kanban status codes currently shown on the Dashboard.
 */
const useUiStore = create(
  persist(
    (set) => ({
      selectedProfile: null,

      setSelectedProfile: (profile) => set({ selectedProfile: profile }),

      clearSelectedProfile: () => set({ selectedProfile: null }),

      // Kanban columns visibility (defaults to every status)
      visibleColumns: STATUS_ORDER,

      toggleColumn: (statusCode) =>
        set((state) => ({
          visibleColumns: state.visibleColumns.includes(statusCode)
            ? state.visibleColumns.filter((c) => c !== statusCode)
            : [...state.visibleColumns, statusCode],
        })),
    }),
    {
      name: "ui-storage", // The localStorage key where this state is saved
    },
  ),
);

export default useUiStore;
