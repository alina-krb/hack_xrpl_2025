import { Client, convertStringToHex, Wallet, xrpToDrops } from "xrpl"

export const connectClient = async () => {
  const client = new Client("wss://s.altnet.rippletest.net:51233") // testnet XRPL
  await client.connect()
  return client
}

export const getWallet = (seed: string) => {
  return Wallet.fromSeed(seed)
}

export const getBalance = async (address: string) => {
  const client = await connectClient()
  const accountInfo = await client.getXrpBalance(address)
  await client.disconnect()
  return accountInfo
}

export const mintMasterclassNFT = async (masterclass: {
  id: number
  gatewayUrl: string
}) => {
  const seed = process.env.NEXT_PUBLIC_XRPL_SEED!
  const wallet = getWallet(seed)
  const client = await connectClient()

  const tx = {
    TransactionType: "NFTokenMint" as const,
    Account: wallet.classicAddress,
    URI: convertStringToHex(masterclass.gatewayUrl),
    Flags: 8, // transferrable
    NFTokenTaxon: masterclass.id
  }

  const prepared = await client.autofill(tx)
  const signed = wallet.sign(prepared)
  const result = await client.submitAndWait(signed.tx_blob)

  await client.disconnect()
  return result
}

export const createNftSellOffer = async (nftId: string, priceXrp: number) => {
  try {
    const seed = process.env.NEXT_PUBLIC_XRPL_SEED!
    const wallet = Wallet.fromSeed(seed)
    const client = await connectClient()
    const salePriceDrops = xrpToDrops(priceXrp.toString())
    const sellOfferTx = {
      TransactionType: 'NFTokenCreateOffer' as const,
      Account: wallet.classicAddress,
      NFTokenID: nftId,
      Amount: salePriceDrops,
      Flags: 1
    }
    const prepared = await client.autofill(sellOfferTx)
    const signed = wallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    let offerId
    const meta = result.result.meta
    if (meta && typeof meta !== 'string' && meta.AffectedNodes) {
      for (const node of meta.AffectedNodes) {
        if ('CreatedNode' in node && node.CreatedNode.LedgerEntryType === 'NFTokenOffer') {
          offerId = node.CreatedNode.LedgerIndex
          break
        }
      }
    }
    await client.disconnect()
    return { offerId, tx: result }
  } catch (error) {
    return { error: error instanceof Error ? error.message : error }
  }
}
