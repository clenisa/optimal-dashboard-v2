import { create, type StateCreator } from "zustand"

// Systematic z-index hierarchy for proper UI layering
const Z_INDEX_HIERARCHY = {
  // Base layers
  BACKGROUND: 0,
  DESKTOP_ICONS: 1,

  // Window layers
  WINDOW_BASE: 10,
  WINDOW_INCREMENT: 1,

  // UI overlays
  MENU_BAR: 30,
  DROPDOWN_MENUS: 40,
  CONTEXT_MENUS: 50,
  TOOLTIPS: 60,
  POPOVER_CONTENT: 70,

  // Modal layers
  DIALOG_OVERLAY: 80,
  DIALOG_CONTENT: 81,
  DRAWER_OVERLAY: 90,
  DRAWER_CONTENT: 91,
  ALERT_OVERLAY: 100,
  ALERT_CONTENT: 101,
  
  // Chart-specific layers (within window context)
  CHART_TOOLTIP: 50, // Relative to window
  CHART_LEGEND: 60,
  CHART_CONTROLS: 70,
} as const

// Track active window z-indices to manage proper stacking
let windowZIndexCounter = Z_INDEX_HIERARCHY.WINDOW_BASE
const getNextWindowZIndex = () => {
  windowZIndexCounter += Z_INDEX_HIERARCHY.WINDOW_INCREMENT
  return windowZIndexCounter
}

// Utility to get z-index for specific UI elements
export const getUIZIndex = (element: keyof typeof Z_INDEX_HIERARCHY) => Z_INDEX_HIERARCHY[element]

// State management for app windows.

export interface WindowState {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  zIndex: number
}

export interface WindowStore {
  windows: WindowState[]
  activeWindowId: string | null // To track the currently focused/active window
  addWindow: (window: Omit<WindowState, "zIndex">) => void
  removeWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<WindowState>) => void
  focusWindow: (id: string) => void
  getHighestZIndex: () => number
  setActiveWindowId: (id: string | null) => void
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  activeWindowId: null,
  addWindow: (newWindow: Omit<WindowState, "zIndex">) => {
    set((state: WindowStore) => {
      // Check if window already exists and is not minimized
      const existingWindow = state.windows.find((w: WindowState) => w.id === newWindow.id)
      if (existingWindow && !existingWindow.minimized) {
        // If it exists and is open, just focus it
        get().focusWindow(newWindow.id)
        return { windows: state.windows, activeWindowId: newWindow.id }
      } else if (existingWindow && existingWindow.minimized) {
        // If it exists and is minimized, restore and focus it
        const updatedWindows = state.windows.map((w: WindowState) =>
          w.id === newWindow.id ? { ...w, ...newWindow, minimized: false, zIndex: getNextWindowZIndex() } : w,
        )
        return { windows: updatedWindows, activeWindowId: newWindow.id }
      }

      const windowToAdd = { ...newWindow, zIndex: getNextWindowZIndex(), minimized: false }
      return {
        windows: [...state.windows, windowToAdd],
        activeWindowId: windowToAdd.id,
      }
    })
  },
  removeWindow: (id: string) =>
    set((state: WindowStore) => {
      const newWindows = state.windows.filter((window: WindowState) => window.id !== id)
      let newActiveId: string | null = state.activeWindowId // Assume current active ID persists

      if (state.activeWindowId === id) {
        // If the closed window was active
        if (newWindows.length > 0) {
          // Find the window with the highest zIndex among the remaining ones to set as active
          newActiveId = newWindows.reduce((prev: WindowState, current: WindowState) => (prev.zIndex > current.zIndex ? prev : current)).id
        } else {
          newActiveId = null // No windows left, so no active window
        }
      }
      // If activeWindowId was not the one being removed, it remains unchanged.
      // If it was, and newActiveId was determined, it's updated.
      // If it was, and no windows remain, it's set to null.
      return { windows: newWindows, activeWindowId: newActiveId }
    }),
  updateWindow: (id: string, updates: Partial<WindowState>) =>
    set((state: WindowStore) => ({
      windows: state.windows.map((window: WindowState) => (window.id === id ? { ...window, ...updates } : window)),
    })),
  focusWindow: (id: string) =>
    set((state: WindowStore) => {
      return {
        windows: state.windows.map((window: WindowState) => (window.id === id ? { ...window, zIndex: getNextWindowZIndex() } : window)),
        activeWindowId: id, // Set the focused window as active
      }
    }),
  getHighestZIndex: () => windowZIndexCounter,
  setActiveWindowId: (id: string | null) => set({ activeWindowId: id }),
}))
