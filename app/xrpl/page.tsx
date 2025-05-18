'use client'
import { useState } from 'react'
import { getBalance } from '@/lib/xrpl'

export default function XRPLPage() {
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<string | null>(null)

  const handleCheckBalance = async () => {
    console.log('Vérification du solde pour :', address)
    try {
      const result = await getBalance(address)
      setBalance(result + ' XRP')
    } catch (e) {
      setBalance('Erreur lors de la récupération du solde')
      console.error(e)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl mb-2">Vérifier un solde XRPL</h1>
      <input
        type="text"
        placeholder="Adresse XRPL"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="border p-2 w-full max-w-md"
      />
      <button
        onClick={handleCheckBalance}
        className="mt-2 px-4 py-2 bg-black text-white rounded"
      >
        Vérifier
      </button>
      {balance && <p className="mt-4">💰 Solde : {balance}</p>}
    </div>
  )
}