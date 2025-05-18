"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
  acceptedFileTypes: string
  maxSizeMB: number
  currentFile: File | null
}

export function FileUploader({ onFileSelect, acceptedFileTypes, maxSizeMB, currentFile }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0])
    }
  }

  const validateAndProcessFile = (file: File) => {
    setError(null)

    // Nouvelle logique de validation du type de fichier
    const fileType = file.type
    const acceptedTypes = acceptedFileTypes.split(',').map(t => t.trim())
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        // ex: video/*
        return fileType.startsWith(type.replace('/*', '/')) || fileType.startsWith(type.replace('/*', ''))
      }
      return fileType === type
    })
    if (!isAccepted) {
      setError(`Invalid file type. Supported: ${acceptedFileTypes}`)
      return
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB.`)
      return
    }

    // Simulate upload
    simulateUpload(file)
  }

  const simulateUpload = (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          onFileSelect(file)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    onFileSelect(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      {!currentFile && !isUploading ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept={acceptedFileTypes}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>

            <div>
              <p className="text-lg font-medium">Drag and drop your video here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or{" "}
                <Button variant="link" className="p-0 h-auto" onClick={handleBrowseClick}>
                  browse files
                </Button>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, MOV, AVI, WEBM (Max size: {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : isUploading ? (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Uploading video...</p>
            <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      ) : currentFile ? (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>

              <div>
                <p className="font-medium">{currentFile.name}</p>
                <p className="text-sm text-muted-foreground">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleRemoveFile}>
              Remove
            </Button>
          </div>
        </div>
      ) : null}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
