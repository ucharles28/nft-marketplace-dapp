'use client'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { pinata } from "../../lib/utils"
import { useWriteContract, useWaitForTransactionReceipt, BaseError, useAccount } from 'wagmi'
import {
    useConnectModal,
} from "@rainbow-me/rainbowkit";
import { contractAddress, abi } from '@/lib/contract'
import { parseEther } from 'viem'
import ButtonLoader from './ButtonLoader';


const CreateNft = () => {
    const { openConnectModal } = useConnectModal();
    const { address } = useAccount();
    const [fileBase64, setFileBase64] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [imageFile, setImageFile] = useState<File | null>()
    const [formInput, updateFormInput] = useState({ price: '0', name: '', description: '' })

    const { data: hash, error, isPending, writeContract } = useWriteContract()
    const { isSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    useEffect(() => {
        if (isSuccess) {
            setIsLoading(false)
            // success notif
            alert("Transaction successfully")
            return
        }
    }, [isSuccess])

    useEffect(() => {
        if (error) {
            setIsLoading(false)
            // success notif
            // alert("Transaction successfully")
            return
        }
    }, [error])

    async function onChange(e: ChangeEvent<HTMLInputElement>) {

        if (!e.target.files) {
            return;
        }
        const file = e.target.files[0]
        toBase64(file)
    }

    async function listNFTForSale() {
        if (!address && openConnectModal) {
            openConnectModal()
        }
        setIsLoading(true)
        const url = await uploadToIPFS()

        if (!url) return;

        await writeContract({
            abi,
            address: contractAddress,
            functionName: 'createToken',
            args: [
                url,
                parseEther(formInput.price),
            ],
            value: parseEther('0.0001'),
        })

    }

    async function uploadToIPFS() {
        if (!imageFile) return;

        const upload = await pinata.upload.file(imageFile)

        const imageUrl = await pinata.gateways.convert(upload.IpfsHash)
        const jsonUpload = await pinata.upload.json({
            name: formInput.name,
            description: formInput.description,
            image: imageUrl
        })


        const ipfsUrl = await pinata.gateways.convert(jsonUpload.IpfsHash)
        return ipfsUrl;
    }

    function toBase64(file: File) {
        setImageFile(file)
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setFileBase64(String(reader.result));
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12 text-black">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    type='number'
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                />
                {
                    fileBase64 && (
                        <img className="rounded mt-4" width="350" src={fileBase64} />
                    )
                }
                <button disabled={!formInput.description || !formInput.name || !formInput.price || !fileBase64} onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg text-center flex justify-center">
                    {isLoading ? <ButtonLoader /> : 'Mint'}
                </button>
                {/* {hash && <div className='text-white'>Transaction Hash: {hash}</div>} */}
                {/* {isConfirming && <div className='text-white'>Waiting for confirmation...</div>} */}
                {/* {isSuccess && <div className='text-white'>Transaction confirmed.</div>} */}
                {/* {error && (
                    <div className='text-white'>Error: {error.name}</div>
                )} */}
            </div>
        </div>
    )
}

export default CreateNft
