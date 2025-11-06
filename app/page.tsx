"use client";
import { Connection, Keypair } from "@solana/web3.js";
import { saveWallet, loadWallets, Wallet } from "./_lib/walletStore";
import { useEffect, useState } from "react";
import { del } from "idb-keyval";
import WalletCard from "./components/WalletCard";
import Image from "next/image";
import { Github, Trash2 } from "lucide-react";

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
    await del("wallets");
    setWallets([]);
  };

  const handleDelete = async (id: string) => {
    setWallets((prev) => (prev ? prev.filter((w) => w.id !== id) : []));
  };

  return (
    <div>
      <div>
        <div className="flex flex-row justify-between mx-12">
          <div className="flex flex-row">
            <Image
              src={"./solanaLogo.svg"}
              width={200}
              height={200}
              alt="solana logo"
              className="mr-4"
            />
            <h1 className="text-4xl font-bold flex justify-center my-4 font-sans text-white">
              Wallet Tool
            </h1>
          </div>

          <div className="flex flex-row p-4 mt-2">
            <a
              className="flex flex-row"
              href="https://github.com/msanje/solana-wallet-tool"
            >
              <Github />
              <span className="ml-1">Github</span>
            </a>
          </div>
        </div>
        <p className="flex justify-center">
          Create as many ephemeral wallets as you want and persist their data on
          your local machine.
        </p>
      </div>
      <div className="flex flex-col items-center my-4">
        <h2 className="my-2">
          Start your localnet with this command on your terminal:{" "}
        </h2>
        <p className="my-2">solana-test-validator</p>
        <div className="flex flex-row items-center gap-x-2">
          <p>For more info </p>
          <a
            className="text-blue-300 hover:text-blue-600 hover:underline"
            href="http://solana.com/developers/guides/getstarted/solana-test-validator"
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here.
          </a>
        </div>
        <p>
          Once it&apos;s running you can create as many wallets as you want.
        </p>
        <h3 className="text-3xl font-bold mt-4">Connect to local validator</h3>
        <button
          onClick={checkConnection}
          className="w-38 h-10 text-xl my-4 bg-orange-300 rounded-md cursor-pointer font-bold"
        >
          {connected ? "Connected" : "Connect"}
        </button>
        {/* <p>Click on the button below.</p> */}
      </div>
      <div className="w-full">
        <div className="flex justify-center mb-8 w-96 mx-auto">
          {connected && (
            <button
              className="cursor-pointer text-xl font-bold bg-blue-500 w-38 h-12 rounded-md"
              onClick={handleSubmit}
              disabled={!connected}
            >
              Create Wallet
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="flex flex-row justify-between items-center mb-4 mx-12 px-2">
          <span className="text-gray-400">
            Number of wallets: {wallets?.length}
          </span>

          {wallets !== undefined && wallets?.length > 0 && (
            <button
              // className="cursor-pointer text-sm font-bold bg-red-500 w-24 h-10 rounded-md"
              className="cursor-pointer text-sm font-bold bg-red-500 px-4 py-2 rounded-md"
              onClick={handleDeleteAll}
            >
              Delete All
            </button>
          )}
        </div>
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
