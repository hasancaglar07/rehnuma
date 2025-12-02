import { ImageResponse } from "next/og";

export const runtime = "edge";

// Construct OG image for social previews.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Rehnüma Kadın Dergisi";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #FDF2F8 0%, #B76E79 100%)",
          color: "#20141c",
          fontSize: 60,
          fontFamily: "serif"
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 16 }}>Rehnüma Kadın Dergisi</div>
        <div style={{ maxWidth: "900px", lineHeight: 1.1 }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
