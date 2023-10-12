import { KeyBindingVerifier, decodeJWT, type Disclosure } from "@meeco/sd-jwt";
import { Holder, SignerConfig, supportedAlgorithm } from "@meeco/sd-jwt-vc";
import { JWK, importJWK, jwtVerify } from "jose";
import { signerCallbackFn } from "./issue";

const keyBindingVerifierCallbackFn = function (): KeyBindingVerifier {
  return async (kbjwt: string, holderJWK: JWK) => {
    const { header } = decodeJWT(kbjwt);

    if (
      !Object.values(supportedAlgorithm).includes(
        header.alg as supportedAlgorithm
      )
    ) {
      throw new Error("unsupported algorithm");
    }

    const holderKey = await importJWK(holderJWK, header.alg);
    const verifiedKbJWT = await jwtVerify(kbjwt, holderKey);
    return !!verifiedKbJWT;
  };
};

export const presentVCSDJWTwithKB = async ({
  issuedSDJWT,
  disclosedList,
  signAlg,
  nonce,
  audience,
  holderPrivKey,
  holderSignAlg,
}: {
  issuedSDJWT: string;
  disclosedList: Disclosure[];
  signAlg: supportedAlgorithm;
  nonce: string;
  audience?: string;
  holderPrivKey: string;
  holderSignAlg?: supportedAlgorithm;
}) => {
  const parsedPrivKey = JSON.parse(holderPrivKey);
  const privKey = await importJWK(parsedPrivKey);

  const signer: SignerConfig = {
    alg: holderSignAlg ? holderSignAlg : signAlg,
    callback: signerCallbackFn(privKey),
  };
  const holder = new Holder(signer);

  const { vcSDJWTWithkeyBindingJWT } = await holder.presentVCSDJWT(
    issuedSDJWT,
    disclosedList,
    {
      nonce,
      audience: audience ? audience : "https://example.com/verifierUrl",
      keyBindingVerifyCallbackFn: keyBindingVerifierCallbackFn(),
    }
  );

  // remove duplicate '~' from vcSDJWTWithkeyBindingJWT
  const correctVCSDJWTWithkeyBindingJWT = vcSDJWTWithkeyBindingJWT.replace(
    /~{2}/g,
    "~"
  );
  return { vcSDJWTWithkeyBindingJWT: correctVCSDJWTWithkeyBindingJWT, nonce };
};
