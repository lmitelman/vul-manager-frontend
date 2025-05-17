"use client"

import { useState } from "react"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import Column from "./column"
import VulnerabilityDetailModal from "./vulnerability-detail-modal"
import { useToast } from "@/hooks/use-toast"
import type { Vulnerability } from "@/types/kanban"
import { generateId } from "@/lib/utils"
import Image from "next/image"
import { LogOut, RefreshCw, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useVulnerabilities } from "@/hooks/use-vulnerabilities"
import { Skeleton } from "@/components/ui/skeleton"

export default function KanbanBoard() {
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const {
    columns,
    isLoading,
    error,
    addVulnerability,
    updateVulnerability,
    deleteVulnerability,
    refreshData,
    resetMockData,
    useMockData,
  } = useVulnerabilities()

  const [selectedVulnerability, setSelectedVulnerability] = useState<Vulnerability | null>(null)
  const [isVulnerabilityModalOpen, setIsVulnerabilityModalOpen] = useState(false)
  const [isCreatingVulnerability, setIsCreatingVulnerability] = useState(false)
  const [newVulnerabilityColumnId, setNewVulnerabilityColumnId] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If there's no destination or the item is dropped in the same place
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    // Find the vulnerability being moved
    const vulnerability = sourceColumn.vulnerabilities.find((v) => v.id === draggableId)
    if (!vulnerability) return

    try {
      // Update the vulnerability with the new status
      const updatedVulnerability = { ...vulnerability, status: destColumn.title }
      await updateVulnerability(updatedVulnerability)

      // Update selected vulnerability if it's the one being moved
      if (selectedVulnerability && selectedVulnerability.id === draggableId) {
        setSelectedVulnerability({ ...updatedVulnerability })
      }
    } catch (error) {
      // Error is handled in the hook, but we can add additional UI feedback here if needed
      console.error("Failed to update vulnerability status:", error)
    }
  }

  const handleVulnerabilityClick = (vulnerability: Vulnerability) => {
    // Find the most current version of the vulnerability from columns
    const currentVulnerability =
      columns.flatMap((col) => col.vulnerabilities).find((v) => v.id === vulnerability.id) || vulnerability
    setSelectedVulnerability({ ...currentVulnerability })
    setIsCreatingVulnerability(false)
    setIsVulnerabilityModalOpen(true)
  }

  const handleCreateNewVulnerability = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId)
    if (!column) return

    // Create an empty vulnerability with default values
    const newVulnerability: Vulnerability = {
      id: `temp-${generateId()}`, // Temporary ID that will be replaced by the backend
      title: "",
      description: "",
      status: column.title,
      severity: "Medium",
      cweId: "",
      suggestedFix: "",
      reportedAt: new Date().toISOString(),
    }

    setSelectedVulnerability(newVulnerability)
    setIsCreatingVulnerability(true)
    setNewVulnerabilityColumnId(columnId)
    setIsVulnerabilityModalOpen(true)
  }

  const handleUpdateVulnerability = async (updatedVulnerability: Vulnerability) => {
    try {
      // If we're creating a new vulnerability
      if (isCreatingVulnerability && newVulnerabilityColumnId) {
        // Remove the temporary ID before sending to the API
        const { id, ...vulnerabilityWithoutId } = updatedVulnerability
        await addVulnerability(newVulnerabilityColumnId, vulnerabilityWithoutId)
        setIsCreatingVulnerability(false)
        setNewVulnerabilityColumnId(null)
      } else {
        // Update existing vulnerability
        await updateVulnerability(updatedVulnerability)
      }
      setSelectedVulnerability(null)
    } catch (error) {
      // Error is handled in the hook
      console.error("Failed to update vulnerability:", error)
    }
  }

  const handleDeleteVulnerability = async (vulnerabilityId: string) => {
    try {
      await deleteVulnerability(vulnerabilityId)
      setSelectedVulnerability(null)
    } catch (error) {
      // Error is handled in the hook
      console.error("Failed to delete vulnerability:", error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      toast({
        title: "Data refreshed",
        description: "Vulnerability data has been updated",
      })
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    try {
      await resetMockData()
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsResetting(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return (
    <div className="flex flex-col h-screen strike-gradient-bg">
      <header className="bg-[#0A1128] border-b border-[#4F6DF5]/20 p-4 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <Image src="/images/strike-logo.svg" alt="Strike Logo" width={120} height={40} className="mr-6" />
            <h1 className="text-2xl font-bold text-white">Vulnerability Management</h1>
            {useMockData && (
              <span className="ml-4 px-2 py-1 text-xs font-medium bg-[#4F6DF5]/20 text-[#4F6DF5] rounded-md border border-[#4F6DF5]/30">
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center">

            <div className="mr-4 text-white">
              Welcome, <span className="font-medium text-[#4F6DF5]">{user?.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#4F6DF5]/30 text-white hover:bg-[#4F6DF5]/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-x-auto">
        {isLoading ? (
          <div className="flex gap-4 h-full max-w-7xl mx-auto">
            {/* Loading skeleton for columns */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shrink-0 w-72 flex flex-col column-container">
                <div className="p-3 flex justify-between items-center column-header bg-[#111D3B]">
                  <Skeleton className="h-5 w-32 bg-[#152142]" />
                </div>
                <div className="flex-1 p-2 overflow-y-auto" style={{ backgroundColor: "#0F1A33" }}>
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-24 w-full mb-2 bg-[#152142]" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="bg-red-900/30 border border-red-700/30 text-red-400 p-4 rounded-md max-w-md">
              <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
              <p>{error}</p>
              <Button onClick={handleRefresh} className="mt-4 bg-[#4F6DF5] hover:bg-[#6B85F6]">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full max-w-7xl mx-auto">
              {columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  onAddVulnerability={addVulnerability}
                  onVulnerabilityClick={handleVulnerabilityClick}
                  onDeleteColumn={() => {}} // Not implemented for API version
                  onUpdateColumn={() => {}} // Not implemented for API version
                  onCreateNewVulnerability={handleCreateNewVulnerability}
                />
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {selectedVulnerability && (
        <VulnerabilityDetailModal
          vulnerability={selectedVulnerability}
          open={isVulnerabilityModalOpen}
          onOpenChange={setIsVulnerabilityModalOpen}
          onUpdate={handleUpdateVulnerability}
          onDelete={handleDeleteVulnerability}
          columns={columns}
          isCreating={isCreatingVulnerability}
        />
      )}
    </div>
  )
}
