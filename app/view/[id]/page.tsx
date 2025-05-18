import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

async function getMasterclassById(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/masterclasses`, { cache: 'no-store' })
  const masterclasses = await res.json()
  return masterclasses.find((m: any) => String(m.id) === id)
}

export default async function MasterclassDetail({ params }: { params: { id: string } }) {
  const { id } = params
  const masterclass = await getMasterclassById(id)

  if (!masterclass) {
    notFound()
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <Link href="/" className="inline-flex items-center mb-6 text-primary hover:underline">
        ← Back to marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <img
            src={masterclass.image || "/placeholder.svg"}
            alt={masterclass.title}
            className="w-full h-auto rounded-lg mb-6"
          />

          <h1 className="text-3xl font-bold mb-2">{masterclass.title}</h1>
          <div className="flex items-center mb-4">
            <p className="text-gray-600 mr-4">By {masterclass.instructor}</p>
            <Badge>{masterclass.category}</Badge>
            <p className="ml-4 text-gray-600">{masterclass.duration}</p>
          </div>

          <p className="text-lg mb-6">{masterclass.description}</p>

          <Tabs defaultValue="content">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <h3 className="text-xl font-semibold mb-4">Modules</h3>
              {masterclass.modules && masterclass.modules.length > 0 ? (
              <ul className="space-y-3">
                  {masterclass.modules.map((module: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                      {index + 1}
                    </div>
                    <span>{module}</span>
                  </li>
                ))}
              </ul>
              ) : (
                <p className="text-muted-foreground">No modules listed.</p>
              )}
            </TabsContent>

            <TabsContent value="resources">
              <h3 className="text-xl font-semibold mb-4">Included Resources</h3>
              {masterclass.resources && masterclass.resources.length > 0 ? (
              <ul className="space-y-3">
                  {masterclass.resources.map((resource: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 text-primary">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
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
                    </div>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
              ) : (
                <p className="text-muted-foreground">No resources listed.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="mb-6">
                <p className="text-3xl font-bold mb-2">{masterclass.price}</p>
                <p className="text-gray-600">Lifetime access to content</p>
              </div>

                <div className="space-y-4">
                <Button className="w-full" size="lg">
                    Buy NFT
                  </Button>
                  <p className="text-center text-sm text-gray-500">Connect your wallet to buy this NFT</p>
                </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">What you get:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Full access to the masterclass
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    AI chat with content knowledge
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Additional resources
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-green-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unique ownership NFT
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
