'use client'

import { useEffect, useState } from 'react'
import { Client } from 'xrpl'
import { Badge } from '@/components/ui/badge'

export function XRPLStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [networkLatency, setNetworkLatency] = useState<number | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      const client = new Client('wss://testnet.xrpl.org:51233')
      try {
        const startTime = Date.now()
        await client.connect()
        const endTime = Date.now()
        setNetworkLatency(endTime - startTime)
        setIsConnected(true)
        
        const serverInfo = await client.request({
          command: 'server_info'
        })
        console.log('XRPL Server Info:', serverInfo)
        
      } catch (error) {
        console.error('XRPL Connection Error:', error)
        setIsConnected(false)
      } finally {
        if (client.isConnected()) {
          await client.disconnect()
        }
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "success" : "destructive"}>
        {isConnected ? 'XRPL Connected' : 'XRPL Disconnected'}
      </Badge>
      {networkLatency && (
        <span className="text-sm text-muted-foreground">
          {networkLatency}ms
        </span>
      )}
    </div>
  )
} 