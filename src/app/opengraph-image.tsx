import { ImageResponse } from "next/og";

export const dynamic = "force-static"; // generated once at build time for the static export
export const alt = "Egu Studio, photo et vidéo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link preview for WhatsApp, Instagram and Facebook shares, in the logo's colours. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffc400",
          color: "#0e0e0e",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, color: "#ffffff", fontStyle: "italic", marginBottom: -40, marginLeft: 8 }}>egu</div>
          <div style={{ fontSize: 200, fontWeight: 800, letterSpacing: -8 }}>studio.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 34 }}>
          <span>Photo et vidéo</span>
          <span>Cérémonies, événements, portraits</span>
        </div>
      </div>
    ),
    size,
  );
}
