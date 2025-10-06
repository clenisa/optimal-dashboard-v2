"use client"

import { AppRenderer } from '@/components/desktop/app-renderer'
import type { AppId } from '@/lib/app-definitions'
import { WindowFrame } from '@/components/window-frame'
import type { WindowState } from '@/store/window-store'

interface WindowStackProps {
  windows: WindowState[]
}

export function WindowStack({ windows }: WindowStackProps) {
  return (
    <>
      {windows.map((win) => {
        if (win.minimized) return null

        return (
          <WindowFrame
            key={win.id}
            id={win.id}
            title={win.title}
            x={win.x}
            y={win.y}
            width={win.width}
            height={win.height}
            minimized={win.minimized}
            zIndex={win.zIndex}
          >
            <AppRenderer appId={win.id as AppId} />
          </WindowFrame>
        )
      })}
    </>
  )
}
