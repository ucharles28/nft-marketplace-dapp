import { PinataSDK } from "pinata-web3"

export const pinata = new PinataSDK({
  pinataJwt: `${process.env.NEXT_PUBLIC_PINATA_JWT}`,
  pinataGateway: `${process.env.NEXT_PUBLIC_GATEWAY_URL}`
})

export const middleEllipsis = (str: string, len: number) => {
    if (!str) {
      return '';
    }
  
    return `${str.substring(0, len)}...${str.substring(str.length - len, str.length)}`;
  };