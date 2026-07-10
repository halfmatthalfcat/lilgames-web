import { ImageResponse } from "next/og";

export const alt = "Lil Games";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ fontSize: 160 }}>🤏</div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#18181b" }}>
          Lil Games
        </div>
        <div style={{ fontSize: 32, color: "#52525b" }}>
          A new game studio located in Chicago, IL
        </div>
      </div>
    ),
    {
      ...size,
      emoji: "noto",
    }
  );
}
