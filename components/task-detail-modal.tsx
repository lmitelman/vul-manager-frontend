"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import type { Task, Column } from "@/types/kanban"
import { formatDate, generateId } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onDuplicate: (task: Task) => void
  columns: Column[]
  isCreating?: boolean
}

export default function TaskDetailModal({
  task,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onDuplicate,
  columns,
  isCreating = false,
}: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(task)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  // Update local state when task prop changes or when modal opens
  useEffect(() => {
    if (task && open) {
      setEditedTask({ ...task })
      setIsEditingTitle(isCreating) // Auto-edit title when creating
      setIsEditingDescription(false)
    }
  }, [task, open, isCreating])

  if (!editedTask) return null

  const handleTitleSave = () => {
    if (editedTask.title.trim()) {
      onUpdate(editedTask)
      setIsEditingTitle(false)
    }
  }

  const handleDescriptionSave = () => {
    onUpdate(editedTask)
    setIsEditingDescription(false)
  }

  const handleStatusChange = (status: string) => {
    const updatedTask = { ...editedTask, status }
    setEditedTask(updatedTask)
    onUpdate(updatedTask)
  }

  const handleDeleteTask = () => {
    onDelete(editedTask.id)
    onOpenChange(false)
  }

  const handleDuplicateTask = () => {
    onDuplicate(editedTask)
    onOpenChange(false)
  }

  const handleCreateTask = () => {
    if (!editedTask.title.trim()) {
      // Show error or focus on title
      setIsEditingTitle(true)
      return
    }

    // Make sure we have the required custom fields
    const customFields = [...editedTask.customFields]

    // Ensure Criticality field exists
    if (!customFields.some((f) => f.name === "Criticality")) {
      customFields.push({
        id: `field-${generateId()}`,
        name: "Criticality",
        value: "Medium",
      })
    }

    // Ensure CWE field exists
    if (!customFields.some((f) => f.name === "CWE")) {
      customFields.push({
        id: `field-${generateId()}`,
        name: "CWE",
        value: "",
      })
    }

    // Ensure Suggested Fix field exists
    if (!customFields.some((f) => f.name === "Suggested Fix")) {
      customFields.push({
        id: `field-${generateId()}`,
        name: "Suggested Fix",
        value: "",
      })
    }

    // Create the final task with all required fields
    const finalTask = {
      ...editedTask,
      customFields,
      createdAt: new Date().toISOString(),
    }

    // Call onUpdate to create the task
    onUpdate(finalTask)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#0A1128] rounded-xl border-[#4F6DF5]/20 modal-content">
        <DialogHeader>
          <div className="flex justify-between items-center">
            {isEditingTitle || isCreating ? (
              <div className="space-y-2 w-full pr-4">
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-medium border-[#4F6DF5]/30 text-white bg-[#111D3B]"
                  placeholder="Enter task title"
                  autoFocus={isCreating}
                />
                <div className="flex gap-2">
                  {!isCreating && (
                    <>
                      <Button size="sm" className="bg-[#4F6DF5] hover:bg-[#6B85F6]" onClick={handleTitleSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingTitle(false)}
                        className="border-[#4F6DF5] text-[#4F6DF5]"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <DialogTitle className="text-lg font-medium text-white pr-16">{editedTask.title}</DialogTitle>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditingTitle(true)}
                    className="text-[#4F6DF5] hover:bg-[#4F6DF5]/10 mr-4"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status */}
          <div>
            <label className="text-sm font-medium text-white block mb-1">Status</label>
            <Select
              key={editedTask.status} // Add a key to force re-render when status changes
              value={editedTask.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="border-[#4F6DF5]/30 text-white bg-[#111D3B]">
                <SelectValue>{editedTask.status}</SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#111D3B] border-[#4F6DF5]/30">
                {columns.map((column) => (
                  <SelectItem
                    key={column.id}
                    value={column.title}
                    className="text-white focus:bg-[#4F6DF5]/20 focus:text-white"
                  >
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-white">Description</label>
              {!isEditingDescription && !isCreating && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                  className="text-[#4F6DF5] hover:bg-[#4F6DF5]/10"
                >
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </div>

            {isEditingDescription || isCreating ? (
              <div className="space-y-2">
                <Textarea
                  value={editedTask.description || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={4}
                  className="border-[#4F6DF5]/30 text-white bg-[#111D3B]"
                />
                {!isCreating && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleDescriptionSave} className="bg-[#4F6DF5] hover:bg-[#6B85F6]">
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingDescription(false)}
                      className="border-[#4F6DF5] text-[#4F6DF5]"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-[#A0AEC0] bg-[#111D3B] p-3 rounded-md min-h-[60px] border border-[#4F6DF5]/10">
                {editedTask.description || "No description provided."}
              </div>
            )}
          </div>

          <Separator className="bg-[#4F6DF5]/20" />

          {/* Fixed Fields */}
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Vulnerability Details</h4>

            <div className="space-y-3">
              {/* Criticality Field */}
              <div>
                <label className="text-sm font-medium text-white block mb-1">Criticality</label>
                <Select
                  value={editedTask.customFields.find((f) => f.name === "Criticality")?.value || "Medium"}
                  onValueChange={(value) => {
                    const updatedFields = [...editedTask.customFields]
                    const criticalityIndex = updatedFields.findIndex((f) => f.name === "Criticality")

                    if (criticalityIndex >= 0) {
                      updatedFields[criticalityIndex] = { ...updatedFields[criticalityIndex], value }
                    } else {
                      updatedFields.push({ id: `field-${generateId()}`, name: "Criticality", value })
                    }

                    const updatedTask = { ...editedTask, customFields: updatedFields }
                    setEditedTask(updatedTask)
                    // Removed the immediate update call
                  }}
                >
                  <SelectTrigger className="border-[#4F6DF5]/30 text-white bg-[#111D3B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111D3B] border-[#4F6DF5]/30">
                    <SelectItem value="Critical" className="text-red-400 focus:bg-[#4F6DF5]/20 focus:text-red-400">
                      Critical
                    </SelectItem>
                    <SelectItem value="High" className="text-orange-400 focus:bg-[#4F6DF5]/20 focus:text-orange-400">
                      High
                    </SelectItem>
                    <SelectItem value="Medium" className="text-[#4F6DF5] focus:bg-[#4F6DF5]/20 focus:text-[#4F6DF5]">
                      Medium
                    </SelectItem>
                    <SelectItem value="Low" className="text-green-400 focus:bg-[#4F6DF5]/20 focus:text-green-400">
                      Low
                    </SelectItem>
                    <SelectItem value="Info" className="text-blue-400 focus:bg-[#4F6DF5]/20 focus:text-blue-400">
                      Info
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CWE Field */}
              <div>
                <label className="text-sm font-medium text-white block mb-1">CWE</label>
                <Input
                  value={editedTask.customFields.find((f) => f.name === "CWE")?.value || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    const updatedFields = [...editedTask.customFields]
                    const cweIndex = updatedFields.findIndex((f) => f.name === "CWE")

                    if (cweIndex >= 0) {
                      updatedFields[cweIndex] = { ...updatedFields[cweIndex], value }
                    } else {
                      updatedFields.push({ id: `field-${generateId()}`, name: "CWE", value })
                    }

                    const updatedTask = { ...editedTask, customFields: updatedFields }
                    setEditedTask(updatedTask)
                    // Removed the immediate update call
                  }}
                  placeholder="e.g., 79"
                  className="border-[#4F6DF5]/30 text-white bg-[#111D3B]"
                />
              </div>

              {/* Suggested Fix Field */}
              <div>
                <label className="text-sm font-medium text-white block mb-1">Suggested Fix</label>
                <Textarea
                  value={editedTask.customFields.find((f) => f.name === "Suggested Fix")?.value || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    const updatedFields = [...editedTask.customFields]
                    const fixIndex = updatedFields.findIndex((f) => f.name === "Suggested Fix")

                    if (fixIndex >= 0) {
                      updatedFields[fixIndex] = { ...updatedFields[fixIndex], value }
                    } else {
                      updatedFields.push({ id: `field-${generateId()}`, name: "Suggested Fix", value })
                    }

                    const updatedTask = { ...editedTask, customFields: updatedFields }
                    setEditedTask(updatedTask)
                    // Removed the immediate update call
                  }}
                  placeholder="Provide a suggested fix for this vulnerability"
                  rows={3}
                  className="border-[#4F6DF5]/30 text-white bg-[#111D3B]"
                />
              </div>

              {/* Created At Field (read-only) */}
              <div>
                <label className="text-sm font-medium text-white block mb-1">Created At</label>
                <div className="text-sm text-[#A0AEC0] bg-[#111D3B] p-2 rounded-md border border-[#4F6DF5]/10">
                  {editedTask.createdAt ? formatDate(editedTask.createdAt) : "Not available"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          {isCreating ? (
            <Button className="flex-1 bg-[#4F6DF5] hover:bg-[#6B85F6]" onClick={handleCreateTask}>
              <Save className="h-4 w-4 mr-2" /> Create Task
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 border-[#4F6DF5] text-[#4F6DF5] hover:bg-[#4F6DF5]/10"
                onClick={() => {
                  onUpdate(editedTask)
                  onOpenChange(false)
                }}
              >
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Task
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0A1128] border-[#4F6DF5]/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[#A0AEC0]">
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-[#4F6DF5] text-[#4F6DF5] bg-transparent hover:bg-[#4F6DF5]/10">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteTask}
                      className="bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
