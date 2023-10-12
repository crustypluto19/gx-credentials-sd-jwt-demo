import { createSDMap } from "@/lib/sd-jwt/verify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sdJWT, signAlg } = await req.json();
    console.log("sdJWT", sdJWT)
    console.log("signAlg", signAlg)
    const { sdMap, disclosureMap } = await createSDMap(sdJWT);

    return NextResponse.json({
      sdMap,
      disclosureMap,
    });
  } catch (e) {
    console.log(e)
    return NextResponse.json({
      status: 400,
      statusText: "Bad Request",
      message: e,
      success: false,
    });
  }
}
