import { sepolia, mainnet } from "viem/chains";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    rainbowWallet,
    walletConnectWallet,
    metaMaskWallet,
    phantomWallet,
    trustWallet,
    okxWallet
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                rainbowWallet, 
                metaMaskWallet, 
                phantomWallet, 
                trustWallet, 
                okxWallet,
                walletConnectWallet, 
            ],
        },
    ],
    {
        appName: 'WalletConnection',
        projectId: '7442e1f691dc87cdc3c15ba2a4cb5be9',
    }
);

// const supportedChains: Chain[] = [sepolia,];

export const config = createConfig({
    connectors,
    chains: [sepolia],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    transports: {
        [sepolia.id]: http(),
        // [mainnet.id]: http(),
    },
})