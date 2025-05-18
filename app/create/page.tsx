"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUploader } from "@/components/file-uploader"
import { ResourceUploader } from "@/components/resource-uploader"
import { PricingForm } from "@/components/pricing-form"
import { MasterclassPreview } from "@/components/masterclass-preview"
import { Progress } from "@/components/ui/progress"

const categories = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "art", label: "Art & Design" },
  { value: "business", label: "Business" },
  { value: "marketing", label: "Marketing" },
  { value: "development", label: "Development" },
  { value: "blockchain", label: "Blockchain" },
  { value: "other", label: "Other" },
]

export default function CreateMasterclass() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basics")
  const [progress, setProgress] = useState(20)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    category: "",
    duration: "",
    videoFile: null as File | null,
    videoUploaded: false,
    transcript: "",
    resources: [] as { title: string; type: string; file: File | null; description: string }[],
    price: "",
    mintingFee: "0.001",
    royaltyPercentage: "5",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoUpload = (file: File | null) => {
    setFormData((prev) => ({ ...prev, videoFile: file, videoUploaded: !!file }))
  }

  const handleAddResource = (resource: { title: string; type: string; file: File | null; description: string }) => {
    setFormData((prev) => ({ ...prev, resources: [...prev.resources, resource] }))
  }

  const handleRemoveResource = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update progress based on tab
    switch (value) {
      case "basics":
        setProgress(20)
        break
      case "content":
        setProgress(40)
        break
      case "resources":
        setProgress(60)
        break
      case "pricing":
        setProgress(80)
        break
      case "preview":
        setProgress(100)
        break
      default:
        setProgress(20)
    }
  }

  const isBasicsComplete = formData.title && formData.description && formData.category && formData.duration
  const isContentComplete = formData.videoUploaded && formData.transcript
  const isResourcesComplete = true // Resources are optional
  const isPricingComplete = formData.price !== ""

  const handlePublish = () => {
    // Here you would typically send the data to your backend
    console.log("Publishing masterclass:", formData)

    // Redirect to success page or dashboard
    router.push("/create/success")
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium mb-2">Create a New Masterclass</h1>
          <p className="text-muted-foreground">
            Share your expertise with the world by creating a high-quality masterclass NFT
          </p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Getting started</span>
            <span>Ready to publish</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="content" disabled={!isBasicsComplete}>
              Content
            </TabsTrigger>
            <TabsTrigger value="resources" disabled={!isContentComplete}>
              Resources
            </TabsTrigger>
            <TabsTrigger value="pricing" disabled={!isResourcesComplete}>
              Pricing
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!isPricingComplete}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide the essential details about your masterclass</CardDescription>
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
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="A brief overview of your masterclass (150-200 characters)"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longDescription">Detailed Description</Label>
                  <Textarea
                    id="longDescription"
                    name="longDescription"
                    placeholder="Provide a comprehensive description of what students will learn"
                    value={formData.longDescription}
                    onChange={handleInputChange}
                    className="resize-none"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      name="duration"
                      placeholder="e.g., 2h30"
                      value={formData.duration}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => handleTabChange("content")} disabled={!isBasicsComplete}>
                  Continue to Content
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Masterclass Content</CardTitle>
                <CardDescription>Upload your masterclass video and provide a transcript</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Video Upload</Label>
                  <FileUploader
                    onFileSelect={handleVideoUpload}
                    acceptedFileTypes="video/*"
                    maxSizeMB={500}
                    currentFile={formData.videoFile}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transcript">Transcript</Label>
                  <Textarea
                    id="transcript"
                    name="transcript"
                    placeholder="Provide a transcript of your masterclass for accessibility and searchability"
                    value={formData.transcript}
                    onChange={handleInputChange}
                    className="resize-none"
                    rows={10}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("basics")}>
                  Back
                </Button>
                <Button onClick={() => handleTabChange("resources")} disabled={!isContentComplete}>
                  Continue to Resources
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
                <CardDescription>Add supplementary materials to enhance your masterclass</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceUploader
                  onAddResource={handleAddResource}
                  onRemoveResource={handleRemoveResource}
                  resources={formData.resources}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("content")}>
                  Back
                </Button>
                <Button onClick={() => handleTabChange("pricing")}>Continue to Pricing</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Blockchain Settings</CardTitle>
                <CardDescription>
                  Set the price for your masterclass NFT in XRP and configure blockchain settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingForm formData={formData} onChange={handleInputChange} onSelectChange={handleSelectChange} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("resources")}>
                  Back
                </Button>
                <Button onClick={() => handleTabChange("preview")} disabled={!isPricingComplete}>
                  Continue to Preview
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview Your Masterclass</CardTitle>
                <CardDescription>Review how your masterclass will appear to potential students</CardDescription>
              </CardHeader>
              <CardContent>
                <MasterclassPreview formData={formData} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleTabChange("pricing")}>
                  Back
                </Button>
                <Button onClick={handlePublish}>Publish Masterclass</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
