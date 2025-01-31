'use client'
import React, { useEffect, useState } from 'react'
import { readContract } from '@wagmi/core'
import { config } from '@/app/lib/wagmi'
import { abi, contractAddress } from '@/app/lib/contract'
import { NftItem } from '@/app/lib/models'
import { formatEther } from 'viem'
import { useRouter } from 'next/navigation'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import PageLoader from './PageLoader'

const MyNfts = () => {
    const { openConnectModal } = useConnectModal();
    const { address } = useAccount();
    const router = useRouter()
    const [nftItems, setNftItems] = useState<NftItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!address && openConnectModal) {
            openConnectModal()
        }
        fetchMyNfts();
    }, [address])

    async function fetchMyNfts() {
        const result = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'fetchMyNFTs',
            account: address
        })

        loadNfts(result as any[])
    }

    async function loadNfts(nftItems: any[]) {
        const items = await Promise.all(nftItems.map(async i => {
            const tokenUri = await readContract(config, {
                address: contractAddress,
                abi,
                functionName: 'tokenURI',
                args: [i.tokenId],
            })

            // Get metadata
            const response = await fetch(tokenUri)
            const meta = await response.json()

            let item: NftItem = {
                price: formatEther(i.price),
                tokenId: i.tokenId,
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
                tokenURI: tokenUri
            }
            return item
        }))

        setNftItems(items);
        setIsLoading(false)
    }

    function listNFT(nft: NftItem) {
        router.push(`/resell-nft/${nft.tokenId}`)
    }

    if (isLoading) return (<PageLoader />)

    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nftItems.map((nftItem, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nftItem.image} className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nftItem.price} Eth</p>
                                    <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nftItem)}>List</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default MyNfts
