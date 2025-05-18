"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"

export default function CreateMasterclass() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    file: null as File | null,
    transcript: "",
  })
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [summary, setSummary] = useState("")
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [summarizeError, setSummarizeError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (file: File | null) => {
    setTranscribeError(null)
    setFormData((prev) => ({
      ...prev,
      file,
      transcript: ""
    }))
  }

  useEffect(() => {
    const transcribe = async () => {
      if (!formData.file) return
      setIsTranscribing(true)
      try {
        const form = new FormData()
        form.append("file", formData.file)
        const res = await fetch("http://localhost:8000/transcribe", {
          method: "POST",
          body: form,
        })
        if (!res.ok) throw new Error("Transcription failed")
        const data = await res.json()
        setFormData((prev) => ({ ...prev, transcript: data.text || "" }))
      } catch (err: any) {
        setTranscribeError(err.message || "Transcription error")
      } finally {
        setIsTranscribing(false)
      }
    }
    if (formData.file) {
      transcribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.file])

  const isFormComplete = formData.title && formData.description && formData.price && formData.file && formData.transcript && !isTranscribing

  const handleSummarize = async () => {
    setIsSummarizing(true)
    setSummarizeError(null)
    setSummary("")
    try {
      const res = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formData.transcript }),
      })
      if (!res.ok) throw new Error("Summarization failed")
      const data = await res.json()
      setSummary(typeof data === "string" ? data : data.summary || "")
    } catch (err: any) {
      setSummarizeError(err.message || "Summarization error")
    } finally {
      setIsSummarizing(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Masterclass</CardTitle>
            <CardDescription>Fill in the details below to publish your masterclass NFT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Advanced XRP Ledger Development"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A brief overview of your masterclass"
                value={formData.description}
                onChange={handleInputChange}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (XRP)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="any"
                placeholder="e.g., 10"
                value={formData.price}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Upload File</Label>
              <FileUploader
                onFileSelect={handleFileUpload}
                acceptedFileTypes="video/*,application/pdf,image/*"
                maxSizeMB={500}
                currentFile={formData.file}
              />
            </div>
            {isTranscribing && (
              <div className="text-sm text-muted-foreground">Transcribing video, please wait...</div>
            )}
            {transcribeError && (
              <div className="text-sm text-destructive">{transcribeError}</div>
            )}
            {formData.transcript && !isTranscribing && (
              <div className="space-y-2">
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea
                  id="transcript"
                  name="transcript"
                  value={formData.transcript}
                  onChange={handleInputChange}
                  rows={8}
                  className="resize-none"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-end space-y-2">
            <Button onClick={handleSummarize} disabled={!formData.transcript || isSummarizing}>
              {isSummarizing ? "Summarizing..." : "Summarize"}
            </Button>
            {summarizeError && (
              <div className="text-destructive text-sm mt-2">{summarizeError}</div>
            )}
            {summary && (
              <div className="w-full mt-2">
                <Label>Summary</Label>
                <Textarea value={summary} readOnly rows={5} className="resize-none mt-1" />
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
      {summary && (
        <div className="max-w-xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-base text-muted-foreground">{summary}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
