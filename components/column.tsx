"use client"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import VulnerabilityCard from "./vulnerability-card"
import { Button } from "@/components/ui/button"
import type { Vulnerability, Column as ColumnType } from "@/types/kanban"

interface ColumnProps {
  column: ColumnType
  onAddVulnerability: (columnId: string, vulnerability: Vulnerability) => void
  onVulnerabilityClick: (vulnerability: Vulnerability) => void
  onDeleteColumn: () => void
  onUpdateColumn: (columnId: string, updates: Partial<ColumnType>) => void
  onCreateNewVulnerability: (columnId: string) => void
}

export default function Column({
  column,
  onAddVulnerability,
  onVulnerabilityClick,
  onDeleteColumn,
  onUpdateColumn,
  onCreateNewVulnerability,
}: ColumnProps) {
  // Get header color class or default to dark navy
  const headerColorClass = column.color || "bg-[#111D3B]"

  return (
    <div className="shrink-0 w-72 flex flex-col column-container">
      <div className={`p-3 flex justify-between items-center column-header ${headerColorClass}`}>
        <h3 className="font-medium text-sm text-white flex items-center">
          {column.title}
          <span className="ml-2 text-xs bg-[#4F6DF5]/20 text-[#4F6DF5] px-2 py-0.5 rounded-full shadow-sm border border-[#4F6DF5]/30">
            {column.vulnerabilities.length}
          </span>
        </h3>
      </div>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 p-2 overflow-y-auto"
            style={{ backgroundColor: "#0F1A33" }}
          >
            {column.vulnerabilities.map((vulnerability, index) => (
              <Draggable key={vulnerability.id} draggableId={vulnerability.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <VulnerabilityCard
                      vulnerability={vulnerability}
                      onClick={() => onVulnerabilityClick(vulnerability)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {column.id === 'column-1' && (
              <Button
                variant="ghost"
                className="w-full mt-2 text-[#4F6DF5] hover:text-[#6B85F6] hover:bg-[#4F6DF5]/10 justify-start border border-[#4F6DF5]/20 hover:border-[#4F6DF5]/40"
                onClick={() => onCreateNewVulnerability(column.id)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Vulnerability
              </Button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
