import { BASE_URL } from "@/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#0b101a",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={`${BASE_URL}/logo.svg`}
            alt="about.js logo"
            title="about.js"
          />
        </div>
      ),
    );
  } catch (e: any) {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
