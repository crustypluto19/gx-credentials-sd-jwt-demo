import { verifySDJWTVC } from "@/lib/sd-jwt/verify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { sdJWT, signAlg, issuerPubKey } = await req.json();

    const parsedPubKey = JSON.parse(issuerPubKey);

    const result = await verifySDJWTVC(sdJWT, parsedPubKey, signAlg);
    return NextResponse.json({ ...result });
  } catch (e) {
    return NextResponse.json(e, {
      status: 400,
      statusText: "Bad Request",
    });
  }
}
