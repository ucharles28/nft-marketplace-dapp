import ResellNft from '@/app/components/ResellNft';
import React from 'react'

export default async function ResellNftPage({
    params
}: {
    params: Promise<{ id: string }>
}) {

    const { id } = await params;

    return (
        <ResellNft id={id} />
    )
}
