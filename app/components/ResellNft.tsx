'use client'
import { abi, contractAddress } from '@/lib/contract'
import { config } from '@/lib/wagmi'
import { readContract } from '@wagmi/core'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { parseEther } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

const ResellNft = ({ id, imageUri }: { id: string, imageUri: string }) => {
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
        if (!imageUri) return
        // const response = await fetch(imageUri)
        // const meta = await response.json()
        updateFormInput(state => ({ ...state, image: imageUri }))
    }

    async function listNFTForSale() {
        if (!price) return

        // Get listing price
        const listingPrice = await readContract(config, {
            address: contractAddress,
            abi,
            functionName: 'getListingPrice',
        })

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
