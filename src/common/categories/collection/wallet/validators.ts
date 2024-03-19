import { PublicKey } from '@solana/web3.js';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';

export const isEthereumAddress = (walletId: string) =>
  /^0x[a-fA-F0-9]{40}$/.test(walletId);
export const isSolanaAddress = (walletId: string) => {
  try {
    return new PublicKey(walletId);
  } catch (err) {
    return false;
  }
};
export const isTerraAddress = (walletId: string) =>
  /^(terra1[a-z0-9]{38})$/.test(walletId);
export const isBitcoinAddress = (walletId: string) =>
  /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(walletId);
export const isCosmosAddress = (walletId: string) =>
  /^(cosmos1[a-z0-9]{38})$/.test(walletId);
export const isSubstrateAddress = (walletId: string) => {
  try {
    encodeAddress(decodeAddress(walletId));
    return true;
  } catch (error) {
    return false;
  }
};

export const isSupportedAddress = (walletId: string) =>
  isEthereumAddress(walletId) ||
  isSolanaAddress(walletId) ||
  isTerraAddress(walletId) ||
  isBitcoinAddress(walletId) ||
  isCosmosAddress(walletId) ||
  isSubstrateAddress(walletId);

export const normalizeWalletId = (walletId: string) =>
  isEthereumAddress(walletId) || isTerraAddress(walletId)
    ? walletId.toLowerCase()
    : walletId;
