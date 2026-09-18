/**
 * StatusBadge — coloured pill showing an application or title status.
 */
const STATUS_STYLES: Record<string, string> = {
  SUBMITTED:             "bg-blue-100 text-blue-700",
  SPATIAL_VERIFIED:      "bg-cyan-100 text-cyan-700",
  OWNERSHIP_VERIFIED:    "bg-teal-100 text-teal-700",
  LEGAL_VERIFIED:        "bg-indigo-100 text-indigo-700",
  APPROVED:              "bg-green-100 text-green-700",
  BLOCKCHAIN_REGISTERED: "bg-purple-100 text-purple-700",
  NFT_ISSUED:            "bg-violet-100 text-violet-700",
  COMPLETED:             "bg-emerald-100 text-emerald-700",
  REJECTED:              "bg-red-100 text-red-700",
  CANCELLED:             "bg-gray-100 text-gray-600",
  REVOKED:               "bg-orange-100 text-orange-700",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`status-badge ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
