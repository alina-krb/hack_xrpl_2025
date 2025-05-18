"use client"

import React, { useEffect, useState } from 'react'
// import { CollectionMint } from '@/components/collection-mint'
import { mintMasterclassNFT } from '@/lib/xrpl'
import { toast } from 'sonner'

export default function AdminPage() {
  const [masterclasses, setMasterclasses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [mintingId, setMintingId] = useState<number | null>(null)

  const refresh = async () => {
    setLoading(true)
    setLoadingUsers(true)
    const [masterRes, userRes] = await Promise.all([
      fetch('/api/masterclasses'),
      fetch('/api/users')
    ])
    const masterData = await masterRes.json()
    const userData = await userRes.json()
    setMasterclasses(masterData)
    setUsers(userData)
    setLoading(false)
    setLoadingUsers(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  if (loading || loadingUsers) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Admin API Masterclasses (Prisma/Supabase)</h1>
      <div className="space-y-8">
        {masterclasses.map((mc) => {
          let modules = mc.modules
          let resources = mc.resources
          let collectionNFTs = mc.collectionNFTs
          try {
            if (typeof modules === 'string') modules = JSON.parse(modules)
          } catch {}
          try {
            if (typeof resources === 'string') resources = JSON.parse(resources)
          } catch {}
          try {
            if (typeof collectionNFTs === 'string') collectionNFTs = JSON.parse(collectionNFTs)
            if (!Array.isArray(collectionNFTs)) collectionNFTs = []
          } catch {
            collectionNFTs = []
          }
          return (
            <div key={mc.id} className="mb-8 border rounded-lg overflow-hidden">
              <table className="min-w-full border text-xs md:text-sm">
                <tbody>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">ID</th><td className="border px-2 py-1">{mc.id}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Title</th><td className="border px-2 py-1">{mc.title}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Instructor</th><td className="border px-2 py-1">{mc.instructor}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Description</th><td className="border px-2 py-1 max-w-xs truncate" title={mc.description}>{mc.description}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Image</th><td className="border px-2 py-1"><img src={mc.image} alt={mc.title} className="w-32 h-20 object-cover" /></td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Price</th><td className="border px-2 py-1">{mc.price}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Volume</th><td className="border px-2 py-1">{mc.volume}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Category</th><td className="border px-2 py-1">{mc.category}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Duration</th><td className="border px-2 py-1">{mc.duration}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">ipfsUri</th><td className="border px-2 py-1 max-w-xs truncate" title={mc.ipfsUri}>{mc.ipfsUri}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">gatewayUrl</th><td className="border px-2 py-1 max-w-xs truncate" title={mc.gatewayUrl}>{mc.gatewayUrl}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Modules</th><td className="border px-2 py-1"><ul className="list-disc pl-4">{Array.isArray(mc.modules) && mc.modules.length > 0 ? mc.modules.map((mod: string, idx: number) => (<li key={mod}>{mod}</li>)) : <li className="text-muted-foreground">Aucun module</li>}</ul></td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Resources</th><td className="border px-2 py-1"><ul className="list-disc pl-4">{Array.isArray(mc.resources) && mc.resources.length > 0 ? mc.resources.map((res: string, idx: number) => (<li key={res}>{res}</li>)) : <li className="text-muted-foreground">Aucune ressource</li>}</ul></td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">NFTs</th><td className="border px-2 py-1"><ul className="list-disc pl-4">{Array.isArray(mc.nftTokenIds) && mc.nftTokenIds.length > 0 ? mc.nftTokenIds.map((nft: string, idx: number) => (
                    <li key={nft} className="flex items-center gap-2">
                      {nft}
                      <button
                        className="ml-2 px-2 py-1 bg-orange-600 text-white rounded text-xs"
                        onClick={async () => {
                          const price = window.prompt('Prix de vente en XRP pour ce NFT ?', '10')
                          if (!price) return
                          try {
                            const res = await fetch('/api/nft/sell', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ nftId: nft, priceXrp: Number(price) })
                            })
                            const data = await res.json()
                            if (res.ok && data.success) {
                              toast.success('Offre de vente créée ! Offer ID: ' + data.offerId)
                              await refresh()
                            } else {
                              toast.error('Erreur lors de la mise en vente du NFT' + (data.error ? `: ${data.error}` : ''))
                            }
                          } catch (e) {
                            toast.error('Erreur lors de la mise en vente du NFT')
                          }
                        }}
                      >
                        Mettre en vente
                      </button>
                    </li>
                  )) : <li className="text-muted-foreground">Aucun NFT</li>}</ul></td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Creator</th><td className="border px-2 py-1">{mc.creator ? (<span>{mc.creator.email} ({mc.creator.wallet})</span>) : '-'}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">Collection</th><td className="border px-2 py-1">{mc.collection ? (<span>{mc.collection.name}</span>) : '-'}</td></tr>
                  <tr><th className="bg-gray-100 border px-2 py-1 text-left">CreatedAt</th><td className="border px-2 py-1">{mc.createdAt ? new Date(mc.createdAt).toLocaleString() : '-'}</td></tr>
                </tbody>
              </table>
              <div className="p-4 flex flex-col gap-2">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
                  disabled={mintingId === mc.id}
                  onClick={async () => {
                    setMintingId(mc.id)
                    try {
                      const res = await fetch('/api/upload-json', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: mc.id })
                      })
                      const data = await res.json()
                      if (res.ok && data.success) {
                        toast.success('Upload Pinata réussi pour la masterclass #' + mc.id + (data.ipfsUri ? `\nIPFS: ${data.ipfsUri}` : ''))
                        const updateRes = await fetch('/api/masterclasses/update', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: mc.id, ipfsUri: data.ipfsUri, gatewayUrl: data.gatewayUrl })
                        })
                        const updateData = await updateRes.json()
                        if (updateRes.ok && updateData.success) {
                          toast.success('Base de données mise à jour pour la masterclass #' + mc.id)
                          await refresh()
                        } else {
                          toast.error('Erreur mise à jour BDD pour la masterclass #' + mc.id + (updateData.error ? `: ${updateData.error}` : ''))
                        }
                      } else {
                        toast.error('Erreur upload Pinata pour la masterclass #' + mc.id + (data.error ? `: ${data.error}` : ''))
                      }
                    } catch (e) {
                      toast.error('Erreur upload Pinata pour la masterclass #' + mc.id)
                    }
                    setMintingId(null)
                  }}
                >
                  {mintingId === mc.id ? 'Uploading...' : 'Upload Pinata'}
                </button>
                <button
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded text-sm"
                  disabled={mintingId === mc.id}
                  onClick={async () => {
                    setMintingId(mc.id)
                    try {
                      const res = await fetch('/api/mint', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: mc.id, gatewayUrl: mc.gatewayUrl })
                      })
                      const data = await res.json()
                      if (res.ok && data.success) {
                        toast.success('NFT minté avec succès pour la masterclass #' + mc.id + (data.result?.result?.tx_json?.hash ? `\nHash: ${data.result.result.tx_json.hash}` : ''))
                        const tokenId = data.result?.result?.meta?.nftoken_id
                        if (tokenId) {
                          const newNftTokenIds = Array.isArray(mc.nftTokenIds) ? [...mc.nftTokenIds, tokenId] : [tokenId]
                          const updateRes = await fetch('/api/masterclasses/update', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: mc.id, nftTokenIds: newNftTokenIds })
                          })
                          const updateData = await updateRes.json()
                          if (updateRes.ok && updateData.success) {
                            toast.success('NFT ID ajouté à la masterclass #' + mc.id)
                            await refresh()
                          } else {
                            toast.error('Erreur lors de l ajout du NFT ID à la masterclass #' + mc.id)
                          }
                        }
                        await refresh()
                      } else {
                        toast.error('Erreur lors du mint NFT pour la masterclass #' + mc.id + (data.error ? `: ${data.error}` : ''))
                      }
                    } catch (e) {
                      toast.error('Erreur lors du mint NFT pour la masterclass #' + mc.id)
                    }
                    setMintingId(null)
                  }}
                >
                  {mintingId === mc.id ? 'Minting...' : 'Mint NFT'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <h2 className="text-2xl font-bold mb-4">Utilisateurs de la plateforme</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Wallet</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Web3Provider</th>
              <th className="border px-2 py-1">CreatedAt</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="border px-2 py-1">{user.id}</td>
                <td className="border px-2 py-1">{user.email}</td>
                <td className="border px-2 py-1">{user.wallet}</td>
                <td className="border px-2 py-1">{user.role}</td>
                <td className="border px-2 py-1">{user.web3Provider}</td>
                <td className="border px-2 py-1">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 