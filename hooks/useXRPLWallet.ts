import { useState } from 'react'
import { getWallet, getBalance } from '@/lib/xrpl'

export function useXRPLWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [accountInfo, setAccountInfo] = useState<{ address: string, balance: number } | null>(null)

  const connect = async () => {
    setIsConnecting(true)
    const seed = process.env.NEXT_PUBLIC_XRPL_SEED as string
    console.log('XRPL seed utilisée:', seed)
    if (!seed) throw new Error('XRPL seed non définie')
    const wallet = getWallet(seed)
    console.log('Adresse XRPL:', wallet.address)
    const balanceStr = await getBalance(wallet.address)
    setAccountInfo({ address: wallet.address, balance: balanceStr })
    setIsConnected(true)
    setIsConnecting(false)
  }

  const disconnect = () => {
    setAccountInfo(null)
    setIsConnected(false)
  }

  return { isConnected, isConnecting, accountInfo, connect, disconnect }
} 