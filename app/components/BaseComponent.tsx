import Link from "next/link";
import { ConnectBtn } from "./ConnectButton";

export default function BaseComponent({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <nav className="border-b p-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-0 w-full justify-between">
                    <div>
                        <p className="text-4xl font-bold">Metaverse Marketplace</p>
                        <div className="flex mt-4">
                            <Link href="/" legacyBehavior>
                                <a className="mr-4 text-pink-500">
                                    Home
                                </a>
                            </Link>
                            <Link href="/create-nft" legacyBehavior>
                                <a className="mr-6 text-pink-500">
                                    Sell NFT
                                </a>
                            </Link>
                            <Link href="/my-nfts" legacyBehavior>
                                <a className="mr-6 text-pink-500">
                                    My NFTs
                                </a>
                            </Link>
                            <Link href="/dashboard" legacyBehavior>
                                <a className="mr-6 text-pink-500">
                                    Dashboard
                                </a>
                            </Link>
                        </div>
                    </div>
                    <ConnectBtn />
                </div>
            </nav>
            {children}
        </div>
    )
}