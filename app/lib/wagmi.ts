import { sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";

export const config = createConfig({
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
})