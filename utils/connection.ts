'use client'

import { create } from 'zustand'
import { getWallet, getAccountInfo, type AccountInfo } from './blockchain'

interface ConnectionState {
  isConnected: boolean
  isConnecting: boolean
  accountInfo: AccountInfo | null
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
}

export const useConnection = create<ConnectionState>((set) => ({
  isConnected: false,
  isConnecting: false,
  accountInfo: null,
  error: null,
  
  connect: async () => {
    try {
      set({ isConnecting: true, error: null })
      
      const wallet = await getWallet()
      const accountInfo = await getAccountInfo(wallet.address)
      
      if (accountInfo.balance < 20) {
        console.warn('Balance XRP faible')
      }
      
      set({ 
        isConnected: true, 
        accountInfo,
        error: null 
      })
      
    } catch (error) {
      console.error('Erreur de connexion:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        isConnected: false,
        accountInfo: null
      })
    } finally {
      set({ isConnecting: false })
    }
  },

  disconnect: () => {
    set({
      isConnected: false,
      accountInfo: null,
      error: null
    })
  }
})) 