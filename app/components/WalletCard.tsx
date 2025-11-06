import { useState } from "react";
import { deleteWalletById, Wallet } from "../_lib/walletStore";
import { tryLoadManifestWithRetries } from "next/dist/server/load-components";

export default function WalletCard({
  wallet,
  onDelete,
}: {
  wallet: Wallet;
  onDelete?: (id: string) => void;
}) {
  const handleDelete = async () => {
    await deleteWalletById(wallet.id);
    onDelete?.(wallet.id);
  };
  const solscanUrl = `https://solscan.io/account/${wallet.pub}?cluster=localnet`;

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
      <p className="text-sm font-semibold text-gray-700">{wallet.label}</p>
      <div className="mt-2 space-y-1 text-xs text-gray-600">
        <p>
          <span className="font-medium">Public: </span>
          <span className="font-mono">{wallet.pub}</span>
          {/* <a
            href={`https://solscan.io/account/${wallet.pub}?cluster=localnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 underline"
          >
            View on Solscan
          </a> */}
        </p>
        <p>
          <span className="font-medium">Secret: </span>
          <span className="font-mono">{wallet.secrete}</span>
        </p>
        <p className="text-[10px] text-gray-400">
          <span className="font-medium">ID: </span>
          {wallet.id}
        </p>
      </div>
    </div>
  );
}
