import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/nav-bar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow">{children}</div>
            <footer className="border-t py-6">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span className="font-medium">NFT Masterclass</span>
                  </div>
                  <div className="flex space-x-6">
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Terms of Use
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Contact
                    </a>
                  </div>
                </div>
                <div className="mt-4 text-center md:text-left text-sm text-muted-foreground">
                  © {new Date().getFullYear()} NFT Masterclass. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
}
