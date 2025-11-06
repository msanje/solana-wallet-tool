"use client";
import { set, get, update } from "idb-keyval";

export type Wallet = {
  id: string;
  label: string;
  pub: string;
  secrete: number[];
};

export async function deleteWalletById(id: string) {
  const wallets = (await get("wallets")) ?? [];
  const filtered = wallets.filter((wallet: Wallet) => wallet.id !== id);
  await set("wallets", filtered);
}

// Save (append) a wallet
export async function saveWallet(
  label: string,
  pub: string,
  secrete: Uint8Array
) {
  await update("wallets", (arr: Wallet[] = []) => [
    ...arr,
    { id: crypto.randomUUID(), label, pub, secrete: Array.from(secrete) },
  ]);
}

// Load all wallets
export async function loadWallets() {
  return (await get("wallets")) ?? [];
}
