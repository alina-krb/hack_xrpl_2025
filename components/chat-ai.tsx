"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Données fictives pour les masterclass
const masterclasses = [
  {
    id: "1",
    title: "Blockchain Fundamentals",
    instructor: "Alex Dupont",
  },
  {
    id: "2",
    title: "NFT Art & Design",
    instructor: "Marie Laurent",
  },
  {
    id: "3",
    title: "DeFi Masterclass",
    instructor: "Thomas Mercier",
  },
]

// Réponses prédéfinies pour simuler l'IA
const aiResponses = {
  "1": {
    blockchain:
      "Blockchain is a distributed ledger technology that allows information to be stored and transmitted in a transparent, secure manner without a central controlling body. It functions as a database that contains the history of all exchanges made between its users since its creation.",
    "smart contract":
      "A smart contract is a computer program that automatically executes when predefined conditions are met. On the blockchain, these contracts allow transactions to be executed without human intervention, ensuring their reliability and immutability.",
    consensus:
      "Consensus mechanisms are protocols that allow all nodes in a blockchain network to agree on the current state of the ledger. The best known are Proof of Work (PoW) used by Bitcoin and Proof of Stake (PoS) adopted by Ethereum 2.0.",
    default:
      "I am the AI assistant for the 'Blockchain Fundamentals' masterclass. I can help you understand the concepts covered in this training. Feel free to ask me questions about blockchain, cryptocurrencies, smart contracts, or any other topic related to this masterclass.",
  },
  // Other responses...
}

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatAIProps {
  masterclassId: string
}

export function ChatAI({ masterclassId }: ChatAIProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const masterclass = masterclasses.find((m) => m.id === masterclassId)

  // Ajouter un message de bienvenue au chargement
  useEffect(() => {
    const welcomeMessage = {
      id: "0",
      content:
        (aiResponses[masterclassId as keyof typeof aiResponses]?.default as string) || "How can I help you today?",
      sender: "ai" as const,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [masterclassId])

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simuler une réponse de l'IA après un court délai
    setTimeout(() => {
      let response = ""
      const responses = aiResponses[masterclassId as keyof typeof aiResponses]

      // Rechercher des mots-clés dans le message de l'utilisateur
      const lowercaseInput = input.toLowerCase()

      if (responses) {
        for (const [keyword, reply] of Object.entries(responses)) {
          if (keyword !== "default" && lowercaseInput.includes(keyword.toLowerCase())) {
            response = reply as string
            break
          }
        }

        // Si aucun mot-clé n'est trouvé, utiliser la réponse par défaut
        if (!response) {
          response =
            "I'm not sure I understand your question. Could you rephrase it using terms related to this masterclass? I can help you with all topics covered in the course."
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg font-medium">AI Assistant</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[250px] px-4" ref={scrollAreaRef as any}>
          <div className="space-y-4 pt-4 pb-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === "user" ? "bg-primary text-primary-foreground ml-2" : "bg-secondary"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%]">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>

                  <div className="rounded-lg px-3 py-2 text-sm bg-secondary">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Ask a question about this masterclass..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isTyping} className="shrink-0">
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
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
