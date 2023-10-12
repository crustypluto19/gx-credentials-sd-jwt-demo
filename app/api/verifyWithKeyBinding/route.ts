import { verifySDJWTVC, verifySDJWTVCwithKB } from "@/lib/sd-jwt/verify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { vcSDJWTWithkeyBindingJWT, issuerPubKey, nonce } = await req.json();

    const result = await verifySDJWTVCwithKB(
      vcSDJWTWithkeyBindingJWT,
      nonce,
      issuerPubKey
    );
    return NextResponse.json({ ...result });
  } catch (e) {
    console.log(e);
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

// const sampleHolder =
// es384
// {"kty":"EC","x":"jHrNSsL_uZLiPeW-vIfqA64PmushLnhgPyOaieTaEqsK-eVpL1m1QiHQZuc8NmNS","y":"ZfU5cIRwYWodWq5-aiaKhhtgVLjn5gLYzol_n-l6xNEMMVjVvuMweVpHkSHqiJtp","crv":"P-384"}
// {"kty":"EC","x":"jHrNSsL_uZLiPeW-vIfqA64PmushLnhgPyOaieTaEqsK-eVpL1m1QiHQZuc8NmNS","y":"ZfU5cIRwYWodWq5-aiaKhhtgVLjn5gLYzol_n-l6xNEMMVjVvuMweVpHkSHqiJtp","crv":"P-384","d":"nvSPwJzAY9ZZGxSy3cPOWST0qQcvs2KtG96F_1xA1FdV_vqTkWrImZD5pTq4bQrI"}
