"use client";

import { QRCodeSVG } from "qrcode.react";

// Renders the WhatsApp QR. The backend may return either a base64 image data
// URL (from the Evolution QRCODE_UPDATED event) or the raw QR payload string —
// we handle both.
export function QrImage({ value }: { value: string }) {
  const isImage = value.startsWith("data:image") || value.startsWith("http");
  return (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="QR Code" className="h-56 w-56" />
      ) : (
        <QRCodeSVG value={value} size={224} level="M" />
      )}
    </div>
  );
}
