"use client"
import type { Task } from "@/types/kanban"

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  // Get criticality from custom fields or default to "Medium"
  const criticality = task.customFields.find((field) => field.name === "Criticality")?.value || "Medium"

  // Get CWE from custom fields
  const cwe = task.customFields.find((field) => field.name === "CWE")?.value

  // Helper function to get color based on criticality
  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case "Critical":
        return "bg-red-900/30 text-red-400 border border-red-700/30"
      case "High":
        return "bg-orange-900/30 text-orange-400 border border-orange-700/30"
      case "Medium":
        return "bg-[#4F6DF5]/20 text-[#4F6DF5] border border-[#4F6DF5]/30"
      case "Low":
        return "bg-green-900/30 text-green-400 border border-green-700/30"
      case "Info":
        return "bg-blue-900/30 text-blue-400 border border-blue-700/30"
      default:
        return "bg-[#4F6DF5]/20 text-[#4F6DF5] border border-[#4F6DF5]/30"
    }
  }

  return (
    <div
      className="mb-2 p-3 rounded-md shadow-sm border border-[#4F6DF5]/20 hover:shadow-md transition-all cursor-pointer group task-card"
      onClick={onClick}
    >
      <h4 className="font-medium text-white mb-1">{task.title}</h4>

      {task.description && <p className="text-xs text-[#A0AEC0] mb-2 line-clamp-2">{task.description}</p>}

      <div className="flex flex-wrap gap-2 mt-2">
        {/* Criticality Chip */}
        <div className={`criticality-chip ${getCriticalityColor(criticality)}`}>{criticality}</div>

        {/* CWE Chip */}
        {cwe && <div className="cwe-chip bg-[#4F6DF5]/20 text-[#4F6DF5] border border-[#4F6DF5]/30">CWE-{cwe}</div>}
      </div>
    </div>
  )
}
