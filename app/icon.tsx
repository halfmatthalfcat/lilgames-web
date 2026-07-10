import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  const notoEmoji = await readFile(
    join(process.cwd(), "assets/NotoEmoji-PinchingHand.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Noto Emoji",
          fontSize: 28,
          color: "#000000",
        }}
      >
        🤏
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Emoji",
          data: notoEmoji,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
