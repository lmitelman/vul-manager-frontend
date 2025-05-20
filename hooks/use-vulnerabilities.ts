"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { type Vulnerability, type Column, VulnStatus, VulnSeverity } from "@/types/kanban"
import {
  fetchVulnerabilities,
  createVulnerability,
  updateVulnerability,
  deleteVulnerability as deleteVulnerabilityApi,
} from "@/api/vulnerabilities"

export function useVulnerabilities() {
  const [columns, setColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch vulnerabilities from API or mock data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const vulnerabilities = await fetchVulnerabilities()
      const groupedVulnerabilities: Record<string, Vulnerability[]> = {}

      vulnerabilities.forEach((vulnerability) => {
        const status = vulnerability.status
        vulnerability.severity = vulnerability.severity.charAt(0).toUpperCase() + 
          vulnerability.severity.slice(1).toLowerCase() as VulnSeverity
        if (!groupedVulnerabilities[status]) {
          groupedVulnerabilities[status] = []
        }
        groupedVulnerabilities[status].push(vulnerability)
      })

      console.log(groupedVulnerabilities)

      const columnData: Column[] = [
        {
          id: "column-1",
          title: "Pending Fix",
          vulnerabilities: groupedVulnerabilities[VulnStatus.PENDING_FIX] || [],
          color: "bg-[#111D3B]",
        },
        {
          id: "column-2",
          title: "In Progress",
          vulnerabilities: groupedVulnerabilities[VulnStatus.IN_PROGRESS] || [],
          color: "bg-[#152142]",
        },
        {
          id: "column-3",
          title: "Solved",
          vulnerabilities: groupedVulnerabilities[VulnStatus.SOLVED] || [],
          color: "bg-[#111D3B]",
        },
        {
          id: "column-4",
          title: "False Positive",
          vulnerabilities: groupedVulnerabilities[VulnStatus.FALSE_POSITIVE] || [],
          color: "bg-[#152142]",
        },
      ]

      setColumns(columnData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vulnerabilities")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch vulnerabilities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, user])

  useEffect(() => {
    fetchData()
  }, [fetchData, user])

  const addVulnerability = async (columnId: string, vulnerability: Omit<Vulnerability, "id">) => {
    try {
      const newVulnerability = await createVulnerability(vulnerability)
      
      // Only update state and show success toast if the API call succeeds
      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.id === columnId) {
            return {
              ...column,
              vulnerabilities: [...column.vulnerabilities, newVulnerability],
            }
          }
          return column
        }),
      )

      toast({
        title: "Success",
        description: `"${newVulnerability.title}" added successfully`,
      })

      return newVulnerability
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create vulnerability",
        variant: "destructive",
      })
      throw error // Important: Re-throw the error to prevent modal closing
    }
  }

  // Update an existing vulnerability
  const updateVulnerabilityItem = async (updatedVulnerability: Vulnerability) => {
    try {
      const result = await updateVulnerability(updatedVulnerability.id, updatedVulnerability)
      
      // Only update state and show success toast if the API call succeeds
      const newColumns = [...columns]
      // Find which column currently contains the vulnerability
      let sourceColumnIndex = -1

      // Find the vulnerability in the current columns
      columns.forEach((column, colIndex) => {
        const index = column.vulnerabilities.findIndex((vulnerability) => vulnerability.id === updatedVulnerability.id)
        if (index !== -1) {
          sourceColumnIndex = colIndex
        }
      })

      if (sourceColumnIndex === -1) return // Vulnerability not found

      // Create a copy of the columns
      const sourceColumn = newColumns[sourceColumnIndex]

      // If status hasn't changed, just update the vulnerability in place
      if (sourceColumn.title === updatedVulnerability.status) {
        newColumns[sourceColumnIndex] = {
          ...sourceColumn,
          vulnerabilities: sourceColumn.vulnerabilities.map((vulnerability) =>
            vulnerability.id === updatedVulnerability.id ? updatedVulnerability : vulnerability,
          ),
        }
      } else {
        // Status has changed, need to move the vulnerability to a different column

        // Remove the vulnerability from the source column
        newColumns[sourceColumnIndex] = {
          ...sourceColumn,
          vulnerabilities: sourceColumn.vulnerabilities.filter(
            (vulnerability) => vulnerability.id !== updatedVulnerability.id,
          ),
        }

        // Find the destination column
        const destColumnIndex = newColumns.findIndex((col) => col.title === updatedVulnerability.status)

        if (destColumnIndex !== -1) {
          // Add the vulnerability to the destination column
          newColumns[destColumnIndex] = {
            ...newColumns[destColumnIndex],
            vulnerabilities: [...newColumns[destColumnIndex].vulnerabilities, updatedVulnerability],
          }
        } else {
          // If destination column not found, add the vulnerability back to the source column
          newColumns[sourceColumnIndex].vulnerabilities.push(updatedVulnerability)
        }
      }

      setColumns(newColumns)

      toast({
        title: "Success",
        description: `"${updatedVulnerability.title}" has been updated`,
      })

      return result // Return successful result
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update vulnerability",
        variant: "destructive",
      })
      throw error // Important: Re-throw the error to prevent modal closing
    }
  }

  // Delete a vulnerability
  const deleteVulnerability = async (vulnerabilityId: string) => {
    try {
      await deleteVulnerabilityApi(vulnerabilityId)
      
      // Only update state and show success toast if the API call succeeds
      const newColumns = columns.map((column) => ({
        ...column,
        vulnerabilities: column.vulnerabilities.filter((v) => v.id !== vulnerabilityId),
      }))
      setColumns(newColumns)

      toast({
        title: "Success",
        description: "The vulnerability has been deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete vulnerability",
        variant: "destructive",
      })
      throw error // Important: Re-throw the error to prevent modal closing
    }
  }

  // Refresh data
  const refreshData = () => {
    return fetchData()
  }

  return {
    columns,
    isLoading,
    error,
    addVulnerability,
    updateVulnerability: updateVulnerabilityItem,
    deleteVulnerability,
    refreshData,
  }
}
