import { ImageResponse } from "next/og";

export const runtime = "edge";

// Construct OG image for social previews.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Rehnüma Kadın Dergisi";
  const type = searchParams.get("type") || "article";
  const subtitle = searchParams.get("subtitle") || (type === "issue" ? "Dijital Dergi" : "Rehnüma Kadın Dergisi");

  const palette =
    type === "issue"
      ? { background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", fg: "#e2e8f0" }
      : { background: "linear-gradient(135deg, #FDF2F8 0%, #B76E79 100%)", fg: "#20141c" };

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
          background: palette.background,
          color: palette.fg,
          fontSize: 58,
          fontFamily: "serif",
          letterSpacing: "-0.02em"
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 16 }}>{subtitle}</div>
        <div style={{ maxWidth: "900px", lineHeight: 1.1 }}>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
