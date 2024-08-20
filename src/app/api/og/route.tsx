import { BASE_URL } from "@/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div tw="flex items-center justify-center w-full h-full bg-[#0b101a]">
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
