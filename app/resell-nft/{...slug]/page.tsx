import ResellNft from '@/app/components/ResellNft';
import React from 'react'

export default async function ResellNftPage({
    params
}: {
    params: Promise<{ slug: string[] }>
}) {

    const { slug } = await params;

    return (
        <ResellNft id={slug[0]} imageUri={slug[1]} />
    )
}
