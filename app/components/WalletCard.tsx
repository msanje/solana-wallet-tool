import { useEffect, useState } from "react";
import { connection, deleteWalletById, Wallet } from "../_lib/walletStore";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Coins, DollarSign, Trash2, Trash2Icon, X } from "lucide-react";

export default function WalletCard({
  wallet,
  onDelete,
}: {
  wallet: Wallet;
  onDelete?: (id: string) => void;
}) {
  const [balance, setBalance] = useState(0);
  const [airdropping, setAirdropping] = useState(false);
  const [sol, setSol] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  }, [copied]);

  const handleAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setAirdropping(true);
      const pubkey = new PublicKey(wallet.pub);

      const sig = await connection.requestAirdrop(
        pubkey,
        sol * LAMPORTS_PER_SOL
      );

      // confirm
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      // refresh balance
      const lamports = await connection.getBalance(pubkey, "confirmed");
      setBalance(lamports / LAMPORTS_PER_SOL);
      console.log("Airdrop OK: ", sig);
    } catch (error) {
      console.error("Airdrop failed:", error);
    } finally {
      setAirdropping(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const lamports = await connection.getBalance(new PublicKey(wallet.pub));
      const sol = lamports / LAMPORTS_PER_SOL;
      setBalance(sol);
    };

    fetchBalance();
  }, [wallet.pub]);

  const handleDelete = async () => {
    await deleteWalletById(wallet.id);
    onDelete?.(wallet.id);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      console.log("copied: ", text);
    } catch (error) {
      console.error("copy failed: ", error);
    }
  };

  return (
    <div
      key={wallet.id}
      className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm mx-12"
    >
      <div className="w-full flex justify-end">
        <button
          onClick={() => handleDelete()}
          className="group flex justify-end cursor-pointer text-gray-500"
        >
          <Trash2Icon />
          {/* <X />
          <span className="ml-2 hidden group-hover:inline text-sm text-gray-500">
            Delete
          </span> */}
        </button>
      </div>
      <div className="px-4 pb-2">
        <p className="text-sm font-semibold text-gray-700">{wallet.label}</p>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p>
            <span className="font-medium ">Public: </span>
            <span
              className="font-mono break-all
          hover:bg-blue-200 cursor-pointer
          "
              onClick={() => handleCopy(wallet.pub)}
            >
              {wallet.pub}
            </span>
            {copied && (
              // <span className="absolute -top-5 left-0 text-9xl text-red-500">
              <span className="fixed inset-0 flex items-center justify-center text-3xl text-green-500 bg-black bg-opacity-50 z-50">
                Copied!
              </span>
            )}
          </p>
          <a
            href={`https://explorer.solana.com/address/${wallet.pub}?cluster=custom&customUrl=http://localhost:8899`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:bg-blue-200 cursor-pointer"
          >
            Solana Explorer
          </a>
          <p>
            <span className="font-medium">Secret: </span>
            <span
              className="font-mono break-all
          hover:bg-blue-200 cursor-pointer 
          "
              onClick={() => handleCopy(String(wallet.secret))}
            >
              {wallet.secret}
            </span>
          </p>
          <p className="text-[10px] text-gray-400">
            <span className="font-medium">ID: </span>
            <span className="hover:bg-blue-200 cursor-pointer">
              {wallet.id}
            </span>
          </p>
          <div className="flex flex-row">
            <h3 className="text-xl font-bold mr-4">Balance: </h3>
            <p className="text-xl">{balance}</p>
          </div>
          <form className="flex flex-row">
            <button
              onClick={handleAirdrop}
              disabled={airdropping}
              className={`text-white flex flex-row justify-center items-center h-12 w-full rounded-md text-xl font-bold  ${
                airdropping ? "bg-gray-400" : "bg-black cursor-pointer"
              }`}
            >
              {airdropping ? (
                "Airdropping...."
              ) : (
                <>
                  <Coins />
                  <span className="ml-2">Confirm Airdrop ${sol}</span>
                </>
              )}
            </button>
            <input
              type="number"
              min={1}
              step={1}
              max={10}
              className="rounded-md ml-4 border-2 border-gray-400 w-18 pl-6 text-2xl"
              placeholder="Amount"
              value={sol}
              onChange={(e) => setSol(Number(e.target.value))}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
