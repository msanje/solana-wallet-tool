"use client";
import { Connection, Keypair } from "@solana/web3.js";
import { saveWallet, loadWallets, Wallet } from "./_lib/walletStore";
import { useEffect, useState } from "react";
import { del } from "idb-keyval";
import WalletCard from "./components/WalletCard";

export default function Home() {
  const connection = new Connection("http://localhost:8899");
  const [connected, setConnected] = useState<boolean>(false);
  const [wallets, setWallets] = useState<Wallet[] | undefined>(undefined);

  // Load wallets on mount
  useEffect(() => {
    const fetchWallets = async () => {
      const all = await loadWallets();
      setWallets(all);
    };

    fetchWallets();
  }, [wallets]);

  async function checkConnection() {
    try {
      const version = await connection.getVersion();
      console.log("Connected to Solana localnet: ", version);
      setConnected(true);
    } catch (error) {
      console.error("Connection failed: ", error);
    }
  }

  const handleSubmit = async () => {
    const wallet = Keypair.generate();

    console.log(wallet.publicKey.toBase58());
    console.log(Array.from(wallet.secretKey));

    const kp = Keypair.generate();
    await saveWallet("Test A", kp.publicKey.toBase58(), kp.secretKey);
    const all = await loadWallets();
    setWallets(all);

    console.log("all: ", all);
  };

  const handleDeleteAll = async () => {
    del("wallets");
  };

  const handleDelete = async (id: string) => {
    setWallets((prev) => (prev ? prev.filter((w) => w.id !== id) : []));
  };

  return (
    <div>
      <div>
        <h1 className="text-5xl font-bold flex justify-center my-4">
          Solana Wallet Tool
        </h1>
        <p className="flex justify-center">
          Create as many wallets as you want and persist their data on your
          local machine.
        </p>
      </div>
      <div className="flex flex-col items-center my-4">
        <h2 className="my-2">Start your localnet with this command: </h2>
        <p className="my-2">solana-test-validator</p>
        <p>
          Once it&apos;s running you can create as many wallets as you want.
        </p>
        <h3 className="text-3xl font-bold mt-4">Test Connection</h3>
        <button
          onClick={checkConnection}
          className="w-38 h-10 text-xl my-4 bg-orange-300 rounded-md cursor-pointer font-bold"
        >
          Test
        </button>
        {/* <p>Click on the button below.</p> */}
      </div>
      <div className="flex justify-center mt-48">
        <button
          className="cursor-pointer text-xl font-bold bg-blue-500 w-38 h-12 rounded-md"
          onClick={handleSubmit}
          disabled={!connected}
        >
          {connected ? "Create Wallet" : "Run Validator"}
        </button>

        <button
          className="cursor-pointer text-xl font-bold bg-red-500 w-38 h-12 rounded-md"
          onClick={handleDeleteAll}
        >
          Delete all
        </button>
      </div>
      <div>
        {wallets != null &&
          wallets.map((wallet: Wallet) => (
            <div key={wallet.id}>
              <WalletCard wallet={wallet} onDelete={handleDelete} />
            </div>
          ))}
      </div>
    </div>
  );
}
