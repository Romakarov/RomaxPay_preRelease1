import TronWeb from 'tronweb';
import * as bip39 from 'bip39';
import { db } from '../db';
import { userTronAddresses } from '@shared/schema';
import { eq } from 'drizzle-orm';

const TRON_DERIVATION_PATH = "m/44'/195'/0'/0";

function deriveTronAddressFromMnemonic(mnemonic: string, index: number): { address: string; privateKey: string } {
  // @ts-expect-error - TronWeb.fromMnemonic exists but TypeScript types don't reflect it
  const wallet = TronWeb.fromMnemonic(
    mnemonic,
    `${TRON_DERIVATION_PATH}/${index}`
  );
  
  return {
    address: wallet.address.base58,
    privateKey: wallet.privateKey,
  };
}

export async function getOrCreateUserAddress(userId: string): Promise<string> {
  try {
    const existingAddress = await db.query.userTronAddresses.findFirst({
      where: eq(userTronAddresses.userId, userId),
    });

    if (existingAddress) {
      return existingAddress.tronAddress;
    }

    const mnemonic = process.env.TRON_MNEMONIC;
    if (!mnemonic) {
      throw new Error('TRON_MNEMONIC environment variable is not set');
    }

    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid TRON_MNEMONIC');
    }

    const allAddresses = await db.query.userTronAddresses.findMany({
      orderBy: (addresses, { desc }) => [desc(addresses.derivationIndex)],
      limit: 1,
    });

    const nextIndex = allAddresses.length > 0 ? allAddresses[0].derivationIndex + 1 : 0;

    const { address } = deriveTronAddressFromMnemonic(mnemonic, nextIndex);

    await db.insert(userTronAddresses).values({
      userId,
      tronAddress: address,
      derivationIndex: nextIndex,
    });

    console.log(`Generated new Tron address for user ${userId}: ${address} (index: ${nextIndex})`);

    return address;
  } catch (error) {
    console.error('Error in getOrCreateUserAddress:', error);
    throw error;
  }
}

export function getPrivateKeyForAddress(derivationIndex: number): string {
  const mnemonic = process.env.TRON_MNEMONIC;
  if (!mnemonic) {
    throw new Error('TRON_MNEMONIC environment variable is not set');
  }

  const { privateKey } = deriveTronAddressFromMnemonic(mnemonic, derivationIndex);
  return privateKey;
}

export async function getUserAddressInfo(userId: string): Promise<{ address: string; derivationIndex: number } | null> {
  try {
    const addressInfo = await db.query.userTronAddresses.findFirst({
      where: eq(userTronAddresses.userId, userId),
    });

    if (!addressInfo) {
      return null;
    }

    return {
      address: addressInfo.tronAddress,
      derivationIndex: addressInfo.derivationIndex,
    };
  } catch (error) {
    console.error('Error in getUserAddressInfo:', error);
    throw error;
  }
}
