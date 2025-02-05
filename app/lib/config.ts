'use client';

import { http, createStorage, cookieStorage } from 'wagmi'
import { sepolia, bscTestnet, blastSepolia, foundry } from 'wagmi/chains'
import { Chain, getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { injected } from "wagmi/connectors";
import {
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'WalletConnection',
    projectId: '7442e1f691dc87cdc3c15ba2a4cb5be9',
  }
);

const projectId = '7442e1f691dc87cdc3c15ba2a4cb5be9';

const supportedChains: Chain[] = [sepolia, foundry];

export const config = getDefaultConfig({
   appName: 'WalletConnection',
   projectId,
   chains: supportedChains as any,
   ssr: true,
   storage: createStorage({
    storage: cookieStorage,
   }),
  transports: supportedChains.reduce((obj, chain) => ({ ...obj, [chain.id]: http() }), {})
 });