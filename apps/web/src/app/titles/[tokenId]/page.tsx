"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { titlesApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface LandTitle {
  id: string;
  tokenId: string;
  parcelId: string;
  applicationId: string;
  ownerAddress: string;
  txHash: string;
  blockNumber?: string;
  tokenUri?: string;
  isRevoked: boolean;
  revocationGround?: string;
  revokedByAddress?: string;
  issuedAt: string;
  revokedAt?: string;
}

export default function TitleDetailPage() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [title, setTitle] = useState<LandTitle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    titlesApi.getOne(tokenId)
      .then((r) => setTitle(r.data))
      .catch(() => setError("Title not found or not yet issued."))
      .finally(() => setLoading(false));
  }, [tokenId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex justify-center pt-32"><LoadingSpinner size="lg" /></div>
    </div>
  );

  if (error || !title) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card text-red-600">{error ?? "Not found."}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Land Title NFT</h1>
            <p className="text-lg text-primary font-bold mt-1">Token #{title.tokenId}</p>
          </div>
          <StatusBadge status={title.isRevoked ? "REVOKED" : "NFT_ISSUED"} />
        </div>

        {title.isRevoked && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-800 text-sm space-y-1">
            <p className="font-semibold">🔴 This title has been statutorily revoked</p>
            <p>Ground: {title.revocationGround?.replace(/_/g, " ")}</p>
            <p>Revoked by: <span className="font-mono">{title.revokedByAddress}</span></p>
            <p>Date: {title.revokedAt ? new Date(title.revokedAt).toLocaleString() : "—"}</p>
            <p className="text-xs text-red-600 mt-2">
              Statutory basis: Nigeria Land Use Act (1978), Section 28.
              Revocation recorded as an immutable on-chain event.
            </p>
          </div>
        )}

        <div className="card">
          <h2 className="text-base font-semibold mb-4 text-gray-800">Title Details</h2>
          <dl className="space-y-3 text-sm">
            {[
              ["Token ID",        title.tokenId],
              ["Parcel ID",       title.parcelId],
              ["Application ID",  title.applicationId],
              ["Owner Address",   title.ownerAddress],
              ["Tx Hash",         title.txHash],
              ["Block Number",    title.blockNumber ?? "—"],
              ["Token URI",       title.tokenUri ?? "—"],
              ["Issued At",       new Date(title.issuedAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-4 border-b border-gray-50 pb-2">
                <dt className="w-36 shrink-0 text-gray-500 font-medium">{label}</dt>
                <dd className="text-gray-800 font-mono text-xs break-all">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* On-chain verification link */}
        <div className="card bg-primary/5 border border-primary/20">
          <h2 className="text-sm font-semibold text-primary mb-2">🔗 Blockchain Verification</h2>
          <p className="text-xs text-gray-600">
            This title is recorded on the Anagu Hyperledger Besu network (chain ID 1337).
            The <code className="bg-gray-100 px-1 rounded">TitleIssued</code> event is permanently
            encoded in block {title.blockNumber ?? "—"}.
          </p>
          {title.tokenUri && (
            <a
              href={title.tokenUri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs underline mt-2 block"
            >
              View token metadata →
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
