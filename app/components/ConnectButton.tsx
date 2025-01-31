"use client";

import { useEffect, useRef } from "react";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useWriteContract } from "wagmi";
import { emojiAvatarForAddress } from "@/app/lib/emojiAvatarForAddress";
import { middleEllipsis } from "@/app/lib/utils";

export const ConnectBtn = () => {
  const { isConnecting, address, isConnected, chain } = useAccount();
  const { color: backgroundColor, emoji } = emojiAvatarForAddress(
    address ?? ""
  );

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { disconnect } = useDisconnect();

  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  if (!isConnected) {
    return (
      <button
        className="btn"
        onClick={openConnectModal}
        disabled={isConnecting}
      >
        {isConnecting ? 'Connecting...' : 'Connect your wallet'}
      </button>
    );
  }

  if (isConnected && !chain) {
    return (
      <button className="btn text-white" onClick={openChainModal}>
        Wrong network
      </button>
    );
  }

  return (
    <div className="flex gap-4 items-center justify-between">
      <div
        className="flex justify-center items-center px-4 py-2 border border-neutral-700 bg-neutral-800/30 rounded-xl font-mono font-bold gap-x-2 cursor-pointer"
        onClick={async () => openAccountModal?.()}
      >
        <div
          role="button"
          tabIndex={1}
          className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{
            backgroundColor,
            boxShadow: "0px 2px 2px 0px rgba(81, 98, 255, 0.20)",
          }}
        >
          {emoji}
        </div>
        <p>{middleEllipsis(address as string, 4) || ""}</p>
      </div>
      <button className="btn" onClick={openChainModal}>
        Switch Networks
      </button>
    </div>
  );
};