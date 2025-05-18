import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Type adapté à la structure Prisma
export interface Masterclass {
  id: number
  title: string
  description: string
  image: string
  instructor: string
  duration: string
  price: string
  category: string
  collectionNFTs?: { id: number; tokenId: string }[]
  nftTokenIds?: string[]
}

const getImagePath = (imagePath: string) => {
  return imagePath && imagePath !== '' ? imagePath : '/placeholder.svg'
}

export function ExplorerCard({ masterclass }: { masterclass: Masterclass }) {
  return (
    <Card className='overflow-hidden flex flex-col h-full shadow-sm'>
      <div className='relative'>
        <img
          src={getImagePath(masterclass.image)}
          alt={masterclass.title}
          className='w-full h-48 object-cover'
        />
        <Badge className='absolute top-3 right-3 bg-secondary text-secondary-foreground'>
          {masterclass.category}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle>{masterclass.title}</CardTitle>
        <CardDescription>
          By {masterclass.instructor} • {masterclass.duration}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-grow'>
        <p className='text-muted-foreground mb-2'>{masterclass.description}</p>
        <div className='flex flex-wrap gap-2'>
          <span className='text-sm text-muted-foreground'>ID: {masterclass.id}</span>
          <span className='text-sm text-muted-foreground'>Category: {masterclass.category}</span>
        </div>
      </CardContent>
      <CardFooter className='flex justify-between items-center gap-2'>
        <p className='font-medium'>{masterclass.price}</p>
        <Badge
          variant='secondary'
          className='mx-2'
          aria-label={`NFTs minted for ${masterclass.title}`}
        >
          {(masterclass.nftTokenIds?.length ?? 0)} NFT minted
        </Badge>
        <Link href={`/view/${masterclass.id}`} tabIndex={0} aria-label={`View details for ${masterclass.title}`}>
          <Button variant='outline'>View details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 