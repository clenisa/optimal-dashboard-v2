import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface DesktopServiceStore {
  selectedServiceId: string
  isDesktopModeEnabled: boolean
  setSelectedService: (serviceId: string) => void
  setDesktopMode: (enabled: boolean) => void
}

export const useDesktopServiceStore = create<DesktopServiceStore>()(
  persist(
    (set) => ({
      selectedServiceId: "ai-chat-console",
      isDesktopModeEnabled: true,
      setSelectedService: (serviceId: string) => set({ selectedServiceId: serviceId }),
      setDesktopMode: (enabled: boolean) => set({ isDesktopModeEnabled: enabled }),
    }),
    {
      name: "desktop-service-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
