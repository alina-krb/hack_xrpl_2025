'use client'

import { useState } from 'react'
import { mintNFT } from '@/utils/blockchain'
import { useConnection } from '@/utils/connection'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface Masterclass {
  id: number
  title: string
  ipfsUri: string
  gatewayUrl: string
  collection_nft_ids: string[]
  volume?: number
}

interface CollectionMintProps {
  masterclass: Masterclass
  onMintSuccess?: (nftId: string) => void
}

export function CollectionMint({ masterclass, onMintSuccess }: CollectionMintProps) {
  const [isMinting, setIsMinting] = useState(false)
  const [lastMintedId, setLastMintedId] = useState<string | null>(null)
  const { isConnected, isConnecting, accountInfo, error: connectionError, connect } = useConnection()

  const handleMint = async () => {
    if (!isConnected || !accountInfo) {
      toast.error('Veuillez d\'abord connecter votre wallet')
      return
    }

    try {
      setIsMinting(true)
      const result = await mintNFT(masterclass.gatewayUrl)
      if (result.success && result.nftokenID) {
        setLastMintedId(result.nftokenID)
        onMintSuccess?.(result.nftokenID)
        toast.success(`NFT minté avec succès ! ID : ${result.nftokenID}`)
      } else {
        toast.error(`Échec du minting: ${result.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      toast.error('Erreur lors du minting')
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-2">{masterclass.title}</h3>
      {accountInfo && (
        <p className="text-sm text-gray-500 mb-4">
          Wallet: {accountInfo.address.slice(0, 6)}...{accountInfo.address.slice(-4)}
          <br />
          Balance: {accountInfo.balance} XRP
        </p>
      )}
      {connectionError && (
        <p className="text-sm text-red-500 mb-4">
          Erreur: {connectionError}
        </p>
      )}
      {lastMintedId && (
        <p className="text-sm text-green-600 mb-2">
          Dernier NFT minté : <span className="font-mono">{lastMintedId}</span>
        </p>
      )}
      {!isConnected ? (
        <Button 
          onClick={connect}
          disabled={isConnecting}
          className="w-full mb-2"
        >
          {isConnecting ? 'Connexion...' : 'Connecter le Wallet'}
        </Button>
      ) : (
        <Button 
          onClick={handleMint}
          disabled={isMinting}
          className="w-full"
        >
          {isMinting ? 'Minting en cours...' : 'Minter un NFT'}
        </Button>
      )}
    </Card>
  )
} 