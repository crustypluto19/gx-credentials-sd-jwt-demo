import { issueSDJWTVC } from "@/lib/sd-jwt/issue";
import { createSDMap } from "@/lib/sd-jwt/verify";
import { DisclosureFrame } from "@meeco/sd-jwt";
import { VCClaims, supportedAlgorithm } from "@meeco/sd-jwt-vc";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { claims, signAlg, pubKey, privKey, disclosures, holderPubKey } =
      await req.json();

    const sdVCClaimsDisclosureFrame: DisclosureFrame = disclosures
      ? JSON.parse(disclosures)
      : {};

    const vcClaims: VCClaims = JSON.parse(claims);
    const result = await issueSDJWTVC({
      vcClaims: vcClaims,
      sdVCClaimsDisclosureFrame,
      signAlg: signAlg as supportedAlgorithm,
      pubKey,
      privKey,
      holderPubKey,
    });

    // remove duplicate payload from issuing SD-JWT VC, library bug?
    const resultWithNoDuplicatePayload = result.split(".").slice(2).join(".");
    // create SD Map
    const { sdMap, disclosureMap } = await createSDMap(
      resultWithNoDuplicatePayload
    );
    return NextResponse.json({
      sdJWT: resultWithNoDuplicatePayload,
      sdMap,
      disclosureMap,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error: e,
      },
      {
        status: 400,
        statusText: "Bad Request",
      }
    );
  }
}
