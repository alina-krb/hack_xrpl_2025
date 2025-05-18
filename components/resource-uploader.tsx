"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Resource {
  title: string
  type: string
  file: File | null
  description: string
}

interface ResourceUploaderProps {
  onAddResource: (resource: Resource) => void
  onRemoveResource: (index: number) => void
  resources: Resource[]
}

export function ResourceUploader({ onAddResource, onRemoveResource, resources }: ResourceUploaderProps) {
  const [newResource, setNewResource] = useState<Resource>({
    title: "",
    type: "",
    file: null,
    description: "",
  })
  const [fileError, setFileError] = useState<string | null>(null)

  const resourceTypes = [
    { value: "pdf", label: "PDF Document" },
    { value: "code", label: "Code Sample" },
    { value: "image", label: "Image" },
    { value: "spreadsheet", label: "Spreadsheet" },
    { value: "presentation", label: "Presentation" },
    { value: "link", label: "External Link" },
    { value: "other", label: "Other" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewResource((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setNewResource((prev) => ({ ...prev, type: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setFileError("File is too large. Maximum size is 20MB.")
        return
      }

      setNewResource((prev) => ({ ...prev, file }))
    }
  }

  const handleAddResource = () => {
    if (!newResource.title || !newResource.type) {
      return
    }

    onAddResource(newResource)

    // Reset form
    setNewResource({
      title: "",
      type: "",
      file: null,
      description: "",
    })

    // Reset file input
    const fileInput = document.getElementById("resourceFile") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      case "code":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        )
      case "link":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Resource Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., XRP Ledger Developer Guide"
              value={newResource.title}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Resource Type</Label>
            <Select value={newResource.type} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceFile">Upload File</Label>
            <Input id="resourceFile" type="file" onChange={handleFileChange} className="cursor-pointer" />
            {fileError && <p className="text-sm text-destructive">{fileError}</p>}
            <p className="text-xs text-muted-foreground">
              Max file size: 20MB. For external resources, you can skip this step and provide a link in the description.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Briefly describe this resource"
              value={newResource.description}
              onChange={handleInputChange}
              className="resize-none"
              rows={3}
            />
          </div>

          <Button onClick={handleAddResource} disabled={!newResource.title || !newResource.type}>
            Add Resource
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Added Resources ({resources.length})</h3>

          {resources.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No resources added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add supplementary materials to enhance your masterclass
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {resources.map((resource, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1 p-2 bg-secondary rounded-full">{getFileTypeIcon(resource.type)}</div>

                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <Badge variant="secondary" className="mt-1">
                              {resourceTypes.find((t) => t.value === resource.type)?.label || resource.type}
                            </Badge>
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{resource.description}</p>
                            )}
                            {resource.file && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {resource.file.name} ({(resource.file.size / (1024 * 1024)).toFixed(2)} MB)
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => onRemoveResource(index)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
