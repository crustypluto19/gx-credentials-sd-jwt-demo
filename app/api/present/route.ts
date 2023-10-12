import { presentVCSDJWTwithKB } from "@/lib/sd-jwt/present";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      sdJWT,
      signAlg,
      disclosedList,
      nonce,
      audience,
      holderPrivKey,
      holderSignAlg,
    } = await req.json();

    const { vcSDJWTWithkeyBindingJWT, nonce: returnedNonce } =
      await presentVCSDJWTwithKB({
        issuedSDJWT: sdJWT,
        disclosedList,
        signAlg,
        nonce,
        audience,
        holderPrivKey,
        holderSignAlg,
      });

    return NextResponse.json({
      vcSDJWTWithkeyBindingJWT,
      nonce: returnedNonce,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      error: e,
    }, {
        status: 400,
        statusText: 'Bad Request'
    });
  }
}
