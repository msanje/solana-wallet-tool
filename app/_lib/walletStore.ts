"use client";
import { Connection } from "@solana/web3.js";
import { set, get, update } from "idb-keyval";

export const connection = new Connection("http://localhost:8899");

export type Wallet = {
  id: string;
  label: string;
  pub: string;
  secret: number[];
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
  secret: Uint8Array
) {
  await update("wallets", (arr: Wallet[] = []) => [
    ...arr,
    { id: crypto.randomUUID(), label, pub, secret: Array.from(secret) },
  ]);
}

// Load all wallets
export async function loadWallets() {
  return (await get("wallets")) ?? [];
}
