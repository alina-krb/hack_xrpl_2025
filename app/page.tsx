"use client"

import { useEffect, useState } from 'react'
import { ExplorerCard, Masterclass } from '@/components/explorer_card'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    fetch('/api/masterclasses')
      .then(res => {
        if (!res.ok) throw new Error('Erreur de chargement')
        return res.json()
      })
      .then(data => {
        setMasterclasses(Array.isArray(data) ? data as Masterclass[] : [])
        setError(null)
        setLoading(false)
      })
      .catch(() => {
        setError('Erreur de chargement des masterclasses')
        setMasterclasses([])
        setLoading(false)
      })
  }, [])


  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto py-10 text-red-600 text-center">{error}</div>
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <section className="mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium mb-4">NFT Masterclass Marketplace</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover exclusive masterclasses represented by NFTs. Own the NFT to access an immersive learning space with
            enriched content and conversational AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {masterclasses.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Aucune masterclass trouvée.
            </div>
          ) : (
            masterclasses.map((masterclass) => (
              <ExplorerCard key={masterclass.id} masterclass={masterclass} />
            ))
          )}
        </div>
      </section>

      <section className="bg-secondary rounded-lg p-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-medium mb-4">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-primary text-2xl font-medium">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Buy an NFT</h3>
              <p className="text-muted-foreground">
                Each masterclass is represented by a unique NFT that gives you access to the content.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-primary text-2xl font-medium">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Access the content</h3>
              <p className="text-muted-foreground">
                Connect your wallet to access the dedicated space of your masterclass.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-primary text-2xl font-medium">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Learn with AI</h3>
              <p className="text-muted-foreground">
                Interact with our AI that knows all the content of the masterclass.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center mb-16">
        <h2 className="text-3xl font-medium mb-4">Ready to start?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Connect your wallet to explore the masterclasses you own or acquire new ones.
        </p>
        <Button size="lg" className="px-8">
          Connect Wallet
        </Button>
      </section>
    </main>
  )
}
