import { useEffect, useState } from "react";
import { connection, deleteWalletById, Wallet } from "../_lib/walletStore";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export default function WalletCard({
  wallet,
  onDelete,
}: {
  wallet: Wallet;
  onDelete?: (id: string) => void;
}) {
  const [balance, setBalance] = useState(0);
  const [airdropping, setAirdropping] = useState(false);

  const handleAirdrop = async () => {
    try {
      setAirdropping(true);
      const pubkey = new PublicKey(wallet.pub);

      const sig = await connection.requestAirdrop(pubkey, 1 * LAMPORTS_PER_SOL);

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
      console.log("copied: ", text);
    } catch (error) {
      console.error("copy failed: ", error);
    }
  };

  return (
    <div
      key={wallet.id}
      className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    >
      <button
        onClick={() => handleDelete()}
        className="flex justify-end w-full cursor-pointer text-black
                "
      >
        X
      </button>
      <div>
        <p className="text-sm font-semibold text-gray-700">{wallet.label}</p>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p>
            <span className="font-medium ">Public: </span>
            <span
              className="font-mono
          hover:bg-blue-200 cursor-pointer
          "
              onClick={() => handleCopy(wallet.pub)}
            >
              {wallet.pub}
            </span>
          </p>
          <p>
            <span className="font-medium">Secret: </span>
            <span
              className="font-mono
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

          <div>
            <button
              onClick={handleAirdrop}
              disabled={airdropping}
              className={`text-white h-12 w-full rounded-md text-xl font-bold  ${
                airdropping ? "bg-gray-400" : "bg-black cursor-pointer"
              }`}
            >
              {airdropping ? "Airdropping...." : "Airdrop 1 SOL"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
