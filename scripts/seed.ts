import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Nettoyage des tables...')
  await prisma.masterclass.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Création des utilisateurs')
  await prisma.user.createMany({
    data: [
      {
        id: 1,
        email: "michael@snowledge.xyz",
        wallet: "rWALLET1",
        role: "creator",
        web3Provider: "web3auth"
      },
      {
        id: 2,
        email: "marie@snowledge.xyz",
        wallet: "rWALLET2",
        role: "creator",
        web3Provider: "web3auth"
      },
      {
        id: 3,
        email: "thomas@snowledge.xyz",
        wallet: "rWALLET3",
        role: "creator",
        web3Provider: "web3auth"
      }
    ]
  })

  const masterclasses = [
    {
      title: 'Instagram : Créer plus avec moins',
      instructor: 'Michäel Boudot',
      description: 'Une masterclass pour apprendre à créer du contenu efficace : objectifs clairs, stratégie cohérente, et outils concrets comme Canva pour booster ta présence en ligne.',
      image: '/1_Canva_Masterclass/image_ID_1.png',
      price: '10 XRP',
      volume: 10,
      category: 'Productivité',
      duration: '1h30',
      ipfsUri: 'ipfs://bafkreiekondr4g2nmyaa5pz2usbfa5exnrs3ws7mwzgoh67b3q4o4ig4nq',
      gatewayUrl: 'https://gray-selected-puma-146.mypinata.cloud/ipfs/bafkreiekondr4g2nmyaa5pz2usbfa5exnrs3ws7mwzgoh67b3q4o4ig4nq',
      creatorId: 1,
      modules: [
        "Définir ses objectifs",
        "Structurer sa stratégie de contenu",
        "Découvrir les outils Canva",
        "Créer des visuels impactants",
        "Optimiser sa présence sur Instagram"
      ],
      resources: [
        "Guide PDF Canva",
        "Templates Instagram",
        "Checklist stratégie contenu"
      ],
      nftTokenIds: [
        "000900000BC7FF15F8298EBD121CE5B9C8E829CEBE8B581DFCB4015B007037C0"
      ]
    },
    {
      title: 'NFT Art & Design',
      instructor: 'Marie Laurent',
      description: 'Learn how to create, design, and sell your art as NFTs on major platforms.',
      image: '/placeholder.svg?height=200&width=350',
      price: '15 XRP',
      volume: 10,
      category: 'Art & Design',
      duration: '3h15',
      ipfsUri: 'ipfs://bafkreigzpb4uavo7ufbfyhn25yyosjn25apvmb7l3orck4oncud4i4sv4e',
      gatewayUrl: 'https://gray-selected-puma-146.mypinata.cloud/ipfs/bafkreigzpb4uavo7ufbfyhn25yyosjn25apvmb7l3orck4oncud4i4sv4e',
      creatorId: 2,
      modules: [
        "Introduction to Artistic NFTs",
        "Digital Creation Tools",
        "Metadata Preparation",
        "Minting and Sales Platforms",
        "Marketing and Community"
      ],
      resources: [
        "Metadata Templates",
        "NFT Platform Guide",
        "Graphic Resources",
        "Pricing Strategies"
      ],
      nftTokenIds: []
    },
    {
      title: 'DeFi Masterclass',
      instructor: 'Thomas Mercier',
      description: 'Everything you need to know about decentralized finance, protocols, and investment strategies.',
      image: '/placeholder.svg?height=200&width=350',
      price: '15 XRP',
      volume: 10,
      category: 'Finance',
      duration: '5h45',
      ipfsUri: 'ipfs://bafkreidkdwsipnmtqa3nimtr7wsxlnngcc3q3vyfkadobdu4rs633osb7i',
      gatewayUrl: 'https://gray-selected-puma-146.mypinata.cloud/ipfs/bafkreidkdwsipnmtqa3nimtr7wsxlnngcc3q3vyfkadobdu4rs633osb7i',
      creatorId: 3,
      modules: [
        "Introduction to DeFi",
        "Lending and Borrowing Protocols",
        "Decentralized Exchanges",
        "Yield Farming and Staking",
        "Risk Management"
      ],
      resources: [
        "Comparison of DeFi Protocols",
        "Yield Calculators",
        "Security Guide",
        "Analysis Resources"
      ],
      nftTokenIds: []
    }
  ]

  for (const mc of masterclasses) {
    await prisma.masterclass.create({
      data: {
        title: mc.title,
        instructor: mc.instructor,
        description: mc.description,
        image: mc.image,
        price: mc.price,
        volume: mc.volume,
        category: mc.category,
        duration: mc.duration,
        ipfsUri: mc.ipfsUri,
        gatewayUrl: mc.gatewayUrl,
        creatorId: mc.creatorId,
        modules: JSON.parse(JSON.stringify(mc.modules)),
        resources: JSON.parse(JSON.stringify(mc.resources)),
        nftTokenIds: JSON.parse(JSON.stringify(mc.nftTokenIds))
      }
    })
  }

  console.log('✅ Données insérées avec succès !')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })