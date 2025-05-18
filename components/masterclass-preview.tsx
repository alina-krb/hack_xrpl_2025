"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MasterclassPreviewProps {
  formData: {
    title: string
    description: string
    longDescription: string
    category: string
    duration: string
    videoFile: File | null
    transcript: string
    resources: { title: string; type: string; file: File | null; description: string }[]
    price: string
    mintingFee: string
    royaltyPercentage: string
  }
}

export function MasterclassPreview({ formData }: MasterclassPreviewProps) {
  const categories = {
    technology: "Technology",
    finance: "Finance",
    art: "Art & Design",
    business: "Business",
    marketing: "Marketing",
    development: "Development",
    blockchain: "Blockchain",
    other: "Other",
  }

  const categoryLabel = formData.category ? categories[formData.category as keyof typeof categories] : "Category"

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="bg-black aspect-video rounded-lg flex items-center justify-center text-white">
              {formData.videoFile ? (
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                  <p>{formData.videoFile.name}</p>
                  <p className="text-sm text-gray-400 mt-2">Video preview will be available after publishing</p>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto mb-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                    <line x1="7" y1="2" x2="7" y2="22"></line>
                    <line x1="17" y1="2" x2="17" y2="22"></line>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="2" y1="7" x2="7" y2="7"></line>
                    <line x1="2" y1="17" x2="7" y2="17"></line>
                    <line x1="17" y1="17" x2="22" y2="17"></line>
                    <line x1="17" y1="7" x2="22" y2="7"></line>
                  </svg>
                  <p>Video preview placeholder</p>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-medium mb-2">{formData.title || "Masterclass Title"}</h1>
              <div className="flex items-center space-x-3">
                <Badge>{categoryLabel}</Badge>
                <span className="text-muted-foreground">{formData.duration || "Duration"}</span>
              </div>
            </div>

            <p className="text-muted-foreground">
              {formData.longDescription ||
                formData.description ||
                "Detailed description of the masterclass will appear here."}
            </p>

            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Masterclass Content</CardTitle>
                    <CardDescription>Preview of the transcript</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="whitespace-pre-line">{formData.transcript || "Transcript will appear here."}</div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                    <CardDescription>
                      {formData.resources.length > 0
                        ? `${formData.resources.length} resources included`
                        : "No resources added yet"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formData.resources.length > 0 ? (
                      <ul className="space-y-2">
                        {formData.resources.map((resource, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Badge variant="secondary">{resource.type}</Badge>
                            <span>{resource.title}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Resources will appear here.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>NFT Details</CardTitle>
              <CardDescription>Preview of the NFT information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{formData.price || "0"} XRP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Royalty</span>
                  <span>{formData.royaltyPercentage || "0"}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Blockchain</span>
                  <span>XRP Ledger</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled>
                Buy NFT (Preview)
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6">
            <h3 className="font-medium mb-3">What you'll get:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Full access to the masterclass</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>AI chat with content knowledge</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>
                  {formData.resources.length > 0
                    ? `${formData.resources.length} additional resources`
                    : "Additional resources"}
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-primary shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Unique ownership NFT on XRP Ledger</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
