"use client"

import { Message } from "ai/react"
import { ActivityMatrix } from "./activity-matrix"
import { BarChart3 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

interface RightSidebarProps {
  messages: { id: string; role: string; content: string; createdAt?: string }[]
  currentMode: string
  uiStyle: "pixel" | "modern"
}

export function RightSidebar({ messages, currentMode, uiStyle }: RightSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  return (
    <>
      {/* Analytics Button in Header */}
      <Button
        variant="ghost"
        size="sm"
        className={`text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1 transition-colors ${
          uiStyle === "pixel"
            ? "hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 pixel-border"
            : "hover:bg-gray-100 dark:hover:bg-gray-800/50"
        }`}
        onClick={() => setIsCollapsed(false)}
        title="Show Analytics"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>

      {/* Analytics Dialog */}
      <Dialog open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
        <DialogContent
          className={`sm:max-w-[525px] ${
            uiStyle === "pixel"
              ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <DialogHeader>
            <DialogTitle 
              className={`flex items-center gap-2 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ActivityMatrix messages={messages} currentMode={currentMode} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
