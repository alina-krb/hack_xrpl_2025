import { Client, Wallet, NFTokenMint, NFTokenMintFlags } from 'xrpl'
import { promises as fs } from 'fs'
import path from 'path'

// Types
export interface XRPLWallet {
  address: string
  classicAddress: string
  publicKey: string
  privateKey: string
  seed: string
}

export interface AccountInfo {
  address: string
  balance: number
}

export interface MintResult {
  success: boolean
  nftokenID?: string
  hash?: string
  error?: string
  wallet?: Wallet
}

interface NFTokenMintResponse {
  result: {
    meta: {
      AffectedNodes?: Array<{
        CreatedNode?: {
          LedgerEntryType: string
          NewFields?: {
            NFTokens?: Array<{
              NFToken: {
                NFTokenID: string
              }
            }>
          }
        }
      }>
    }
  }
}

// Configuration
const XRPL_NODE = process.env.XRPL_NODE || 'wss://s.altnet.rippletest.net:51233'
const DEFAULT_WALLET = {
  seed: "sEdVaKKWidsQnVMV1QXERLHm4UEZrhC",
  address: "rpnJpf3MGxFYy3TL7v6jhvTY4hCrwfFM5q"
}

// Client singleton
let client: Client | null = null

// Core XRPL functions
export async function getClient(): Promise<Client> {
  if (!client || !client.isConnected()) {
    client = new Client(XRPL_NODE, {
      connectionTimeout: 20000,
      timeout: 20000
    })
    await client.connect()
  }
  return client
}

export async function getWallet(seed?: string): Promise<Wallet> {
  try {
    if (seed) {
      return Wallet.fromSeed(seed)
    }
    
    // Utiliser le wallet par défaut
    return Wallet.fromSeed(DEFAULT_WALLET.seed)
  } catch (error) {
    console.error('Erreur lors de la création du wallet:', error)
    throw new Error('Impossible de créer le wallet')
  }
}

export async function getAccountInfo(address: string): Promise<AccountInfo> {
  const client = await getClient()
  const response = await client.request({
    command: 'account_info',
    account: address,
    ledger_index: 'validated'
  })
  
  return {
    address,
    balance: Number(response.result.account_data.Balance) / 1000000
  }
}

export async function mintNFT(uri: string, walletKey?: string): Promise<MintResult> {
  try {
    const client = await getClient()
    
    // Utiliser le wallet par défaut
    const wallet = await getWallet()

    console.log('=== Début du minting ===')
    console.log('URI:', uri)
    console.log('Wallet:', wallet.classicAddress)

    const nftMintTx: NFTokenMint = {
      TransactionType: "NFTokenMint",
      Account: wallet.classicAddress,
      URI: Buffer.from(uri).toString('hex').toUpperCase(),
      Flags: NFTokenMintFlags.tfBurnable + NFTokenMintFlags.tfTransferable,
      NFTokenTaxon: 0
    }

    console.log('Transaction préparée:', nftMintTx)

    const prepared = await client.autofill(nftMintTx)
    const signed = wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob) as NFTokenMintResponse

    console.log('Résultat de la transaction:', result)
    console.log('Meta:', JSON.stringify(result.result.meta, null, 2))
    console.log('AffectedNodes:', JSON.stringify(result.result.meta?.AffectedNodes, null, 2))

    let nftokenID: string | undefined

    // Nouvelle logique pour extraire le NFTokenID
    if (result.result.meta) {
      const meta = result.result.meta as any
      if (meta.AffectedNodes) {
        console.log('Nombre de nodes affectés:', meta.AffectedNodes.length)
        for (const node of meta.AffectedNodes) {
          console.log('Node type:', 
            node.CreatedNode ? 'CreatedNode' : 
            node.ModifiedNode ? 'ModifiedNode' : 
            node.DeletedNode ? 'DeletedNode' : 'Unknown'
          )
          console.log('LedgerEntryType:', 
            node.CreatedNode?.LedgerEntryType || 
            node.ModifiedNode?.LedgerEntryType || 
            node.DeletedNode?.LedgerEntryType
          )
          
          if (node.CreatedNode?.LedgerEntryType === 'NFTokenPage') {
            console.log('CreatedNode NFTokenPage trouvé:', node.CreatedNode)
            const tokens = node.CreatedNode.NewFields?.NFTokens
            if (tokens && tokens.length > 0) {
              nftokenID = tokens[0].NFToken.NFTokenID
              console.log('NFT ID trouvé dans CreatedNode:', nftokenID)
              break
            }
          } else if (node.ModifiedNode?.LedgerEntryType === 'NFTokenPage') {
            console.log('ModifiedNode NFTokenPage trouvé:', node.ModifiedNode)
            const tokens = node.ModifiedNode.FinalFields?.NFTokens
            if (tokens && tokens.length > 0) {
              nftokenID = tokens[tokens.length - 1].NFToken.NFTokenID
              console.log('NFT ID trouvé dans ModifiedNode:', nftokenID)
              break
            }
          }
        }
      }
    }

    console.log('NFT ID final:', nftokenID)

    return {
      success: true,
      nftokenID,
      hash: signed.hash,
      wallet
    }

  } catch (error) {
    console.error('Erreur lors du minting:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function closeClient() {
  if (client?.isConnected()) {
    await client.disconnect()
    client = null
  }
}

export async function verifyOwnership(nftokenID: string): Promise<boolean> {
  const client = await getClient()
  await client.connect()
  
  try {
    const wallet = await getWallet()
    const nfts = await client.request({
      command: "account_nfts",
      account: wallet.address
    })
    
    return nfts.result.account_nfts.some(nft => nft.NFTokenID === nftokenID)
  } finally {
    await client.disconnect()
  }
}

export async function getNFTMetadata(nftokenID: string) {
  const client = await getClient()
  await client.connect()
  
  try {
    const nftInfo = await client.request({
      command: "nft_info",
      nft_id: nftokenID
    })
    
    if (nftInfo.result.uri) {
      const uri = Buffer.from(nftInfo.result.uri, 'hex').toString('ascii')
      return uri
    }
    return null
  } finally {
    await client.disconnect()
  }
} 