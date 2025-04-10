'use client'
import React, { useEffect, useState } from 'react'
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { contractAddress, abi } from '../lib/contract'
import { formatEther, parseEther } from "viem";
import { readContract } from '@wagmi/core'
    import { config } from '@/app/lib/wagmi';
import { NftItem } from '@/app/lib/models';
import PageLoader from './PageLoader';


const Home = () => {
    const { data: hash, error, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    const [nftItems, setNftItems] = useState<NftItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { data, isPending } = useReadContract({
        abi,
        address: contractAddress,
        functionName: 'fetchMarketItems',
        config
    })

    async function load() {
        const result = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'fetchMarketItems',
        })

        loadNfts(result as any[])
    }

    useEffect(() => {
        if (data) {
            loadNfts(data as any[])
        }
    }, [data])

    useEffect(() => {
        if (isSuccess) {
            alert('Confirmed!');
            load();
        }
    }, [isSuccess])

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

    async function buyNft(nftItem: NftItem) {
        await writeContract({
            abi,
            address: contractAddress,
            functionName: 'createMarketSale',
            args: [
                nftItem.tokenId,
            ],
            value: parseEther(nftItem.price),
            chainId: 11155111
        })
    }

    if (isLoading) return (<PageLoader />)

    if (nftItems.length < 1 && !isLoading) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)

    return (
        <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: '1600px' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nftItems.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} />
                                <div className="p-4">
                                    <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                                    <div style={{ height: '70px', overflow: 'hidden' }}>
                                        <p className="text-gray-400">{nft.description}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                                    <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Home
