'use client'
import { abi, contractAddress } from '@/lib/contract';
import { NftItem } from '@/lib/models';
import { config } from '@/lib/wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { readContract } from '@wagmi/core';
import React, { useEffect, useState } from 'react'
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';

const Dashboard = () => {
    const { openConnectModal } = useConnectModal();
    const { address } = useAccount();

    const [nftItems, setNftItems] = useState<NftItem[]>([])
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
            functionName: 'fetchItemsListed',
            account: address
        })

        loadNfts(result)
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
    }
    return (
        <div>
            <div className="p-4">
                <h2 className="text-2xl py-2">Items Listed</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nftItems.map((nftItem, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nftItem.image} className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nftItem.price} Eth</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Dashboard
