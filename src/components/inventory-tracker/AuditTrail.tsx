import type { AuditEntry, Product } from "../../types/inventory"

type AuditTrailProps = {
  auditTrail: AuditEntry[]
  products: Product[]
}

export default function AuditTrail({ auditTrail, products }: AuditTrailProps) {
  const renderAuditEntry = (entry: AuditEntry) => {
    // Use stored product info from the audit entry if available
    const productId = entry.productId.split("-")[0]
    const product = products.find((p) => p.id === productId)

    // Product info to display (either from current products or from stored audit data)
    const productName = product?.name || entry.productName || "Unknown Product"
    const productCode = product?.code || entry.productCode || ""
    const productColor = product?.color || entry.productColor || "#888888"

    let content

    switch (entry.action) {
      case "move":
        content = (
          <>
            <p className="text-sm">
              <span className="font-semibold">{entry.userName}</span> moved{" "}
              <span style={{ color: productColor }}>
                {productName} ({productCode})
              </span>
            </p>
            <p className="text-sm">
              From: <span className="font-medium">{entry.fromColumn}</span>
            </p>
            <p className="text-sm">
              To: <span className="font-medium">{entry.toColumn}</span>
            </p>
          </>
        )
        break
      case "undo-move":
        content = (
          <>
            <p className="text-sm">
              <span className="font-semibold">{entry.userName}</span> undid move of{" "}
              <span style={{ color: productColor }}>
                {productName} ({productCode})
              </span>
            </p>
            <p className="text-sm">
              From: <span className="font-medium">{entry.fromColumn}</span>
            </p>
            <p className="text-sm">
              To: <span className="font-medium">{entry.toColumn}</span>
            </p>
          </>
        )
        break
      case "add-product":
        content = (
          <p className="text-sm">
            <span className="font-semibold">{entry.userName}</span> added new product{" "}
            <span style={{ color: productColor }}>
              {productName} ({productCode})
            </span>
          </p>
        )
        break
      case "delete-product":
        content = (
          <p className="text-sm">
            <span className="font-semibold">{entry.userName}</span> deleted product{" "}
            <span style={{ color: productColor }}>
              {productName} ({productCode})
            </span>
          </p>
        )
        break
      case "edit-product-details":
        content = (
          <p className="text-sm">
            <span className="font-semibold">{entry.userName}</span>{" "}
            <span style={{ color: productColor }}>{entry.details}</span>
          </p>
        )
        break
      case "update-items-per-palette":
      case "update-palettes":
        content = (
          <p className="text-sm">
            <span className="font-semibold">{entry.userName}</span> updated{" "}
            <span style={{ color: productColor }}>
              {productName} ({productCode})
            </span>
          </p>
        )
        break
      default:
        content = (
          <p className="text-sm">
            <span className="font-semibold">{entry.userName}</span> performed action on{" "}
            <span style={{ color: productColor }}>
              {productName} ({productCode})
            </span>
          </p>
        )
    }

    return (
      <li key={entry.id} className="border-b pb-2">
        {content}
        {entry.action !== "edit-product-details" && entry.details && (
          <p className="text-sm text-gray-700">{entry.details}</p>
        )}
        <p className="text-xs text-gray-500">{entry.timestamp.toLocaleString()}</p>
      </li>
    )
  }

  return (
    <div className="w-full bg-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Audit Trail</h2>
      {auditTrail.length === 0 ? (
        <p>No activities recorded yet.</p>
      ) : (
        <ul className="space-y-2">{auditTrail.map(renderAuditEntry)}</ul>
      )}
    </div>
  )
}

