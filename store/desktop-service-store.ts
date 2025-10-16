import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { AppId } from "@/lib/app-definitions"

export interface DesktopServiceStore {
  selectedServiceId: AppId | null
  isDesktopModeEnabled: boolean
  setSelectedService: (serviceId: AppId | null) => void
  setDesktopMode: (enabled: boolean) => void
}

export const useDesktopServiceStore = create<DesktopServiceStore>()(
  persist(
    (set) => ({
      selectedServiceId: "ai-chat-console" as AppId,
      isDesktopModeEnabled: true,
      setSelectedService: (serviceId: AppId | null) => set({ selectedServiceId: serviceId }),
      setDesktopMode: (enabled: boolean) => set({ isDesktopModeEnabled: enabled }),
    }),
    {
      name: "desktop-service-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
