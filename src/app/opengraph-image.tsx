import { BASE_URL } from "@/config";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function Image() {
  const latoItalic = fetch(
    new URL("/public/Lato-LightItalic.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());
  const latoBoldItalic = fetch(
    new URL("/public/Lato-BoldItalic.ttf", import.meta.url),
  ).then((res) => res.arrayBuffer());

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "60px",
            padding: "0 40px",
            background: "linear-gradient(to bottom, #141e30, #243b55, #243b55)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <img
              src={`${BASE_URL}/logo.svg`}
              alt="about.js logo"
              title="about.js"
            />
            <p style={{ marginTop: "-12px", paddingRight: "40px" }}>
              by{" "}
              <span
                style={{ marginLeft: "12px", fontFamily: "Lato-BoldItalic" }}
              >
                Grzegorz Dubiel
              </span>
            </p>
          </div>
        </div>
      ),
      {
        fonts: [
          {
            name: "Lato",
            data: await latoItalic,
            style: "normal",
            weight: 200, // should be thin
          },
          {
            name: "Lato-BoldItalic",
            data: await latoBoldItalic,
            style: "normal",
            weight: 400,
          },
        ],
      },
    );
  } catch (e: any) {
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
