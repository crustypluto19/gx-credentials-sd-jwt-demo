import { exportJWK, generateKeyPair } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // issuer, vcClaims, sdVCClaimsDisclosureFrame, payload
  const { algorithm } = await req.json();
  const { publicKey, privateKey } = await generateKeyPair(algorithm, {
    extractable: true,
  });
  const publicKeyJWK = await exportJWK(publicKey);
  const privateKeyJWK = await exportJWK(privateKey);
  return NextResponse.json({ publicKeyJWK, privateKeyJWK });
}
