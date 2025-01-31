'use client'
import { abi, contractAddress } from '@/app/lib/contract'
import { config } from '@/app/lib/wagmi'
import { readContract } from '@wagmi/core'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { parseEther } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

const ResellNft = ({ id }: { id: string }) => {
    const router = useRouter()
    const { data: hash, error, isPending, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({
        hash,
    })
    const [formInput, updateFormInput] = useState({ price: '', image: '' })
    const { image, price } = formInput

    useEffect(() => {
        fetchNFT()
    }, [id])

    useEffect(() => {
        if (isSuccess) {
            alert('Listed')
            router.push('/')
        }
    }, [isSuccess])

    async function fetchNFT() {
        const tokenUri = await readContract(config, {
            address: contractAddress,
            abi,
            functionName: 'tokenURI',
            args: [BigInt(id)],
        })


        const response = await fetch(tokenUri)
        const meta = await response.json()
        updateFormInput(state => ({ ...state, image: meta.image }))
    }

    async function listNFTForSale() {
        if (!price) return

        // Get listing price
        const listingPrice = await readContract(config, {
            address: contractAddress,
            abi,
            functionName: 'getListingPrice',
        })
        console.log('Listing price ', listingPrice)

        await writeContract({
            abi,
            address: contractAddress,
            functionName: 'resellToken',
            args: [
                BigInt(id),
                parseEther(price),
            ],
            value: listingPrice,
            // chainId: 11155111
        })


    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                {
                    image && (
                        <img className="rounded mt-4" width="350" src={image} />
                    )
                }
                <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    List NFT
                </button>
            </div>
        </div>
    )
}

export default ResellNft
