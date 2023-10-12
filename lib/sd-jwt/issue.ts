import { DisclosureFrame, Hasher, Signer, base64encode } from "@meeco/sd-jwt";
import {
  CreateSDJWTPayload,
  HasherConfig,
  Issuer,
  SignerConfig,
  VCClaims,
  defaultHashAlgorithm,
  supportedAlgorithm,
} from "@meeco/sd-jwt-vc";
import { createHash } from "crypto";
import {
  JWTHeaderParameters,
  JWTPayload,
  KeyLike,
  SignJWT,
  importJWK,
} from "jose";

type IssueProps = {
  vcClaims: VCClaims;
  sdVCClaimsDisclosureFrame: DisclosureFrame;
  signAlg: supportedAlgorithm;
  pubKey: string;
  privKey: string;
  holderPubKey?: string;
};

export const issueSDJWTVC = async ({
  vcClaims,
  sdVCClaimsDisclosureFrame,
  signAlg,
  pubKey,
  privKey,
  holderPubKey,
}: IssueProps) => {
  const parsedPubKey = JSON.parse(pubKey);
  const parsedPrivKey = JSON.parse(privKey);
  let parsedHolderPubKey;
  if (holderPubKey) {
    parsedHolderPubKey = JSON.parse(holderPubKey);
  }

  const sdMetadata: CreateSDJWTPayload = {
    iat: Date.now(),
    cnf: {
      jwk: holderPubKey ? parsedHolderPubKey : parsedPubKey,
    },
    iss: "https://example.com/issuer",
  };

  const importedPrivKey = await importJWK(parsedPrivKey, signAlg);
  const signer: SignerConfig = {
    alg: signAlg,
    callback: signerCallbackFn(importedPrivKey),
  };
  // config used to hash disclosed claims
  const hasher: HasherConfig = {
    alg: "sha256",
    callback: hasherCallbackFn("sha256"),
  };
  const issuer = new Issuer(signer, hasher);
  const result = await issuer.createVCSDJWT(
    vcClaims,
    sdMetadata,
    sdVCClaimsDisclosureFrame
  );
  return result;
};

export const hasherCallbackFn = function (
  alg: string = defaultHashAlgorithm
): Hasher {
  return (data: string): string => {
    const digest = createHash(alg).update(data).digest();
    return base64encode(digest);
  };
};

export const signerCallbackFn = function (
  privateKey: Uint8Array | KeyLike
): Signer {
  return (
    protectedHeader: JWTHeaderParameters,
    payload: JWTPayload
  ): Promise<string> => {
    return new SignJWT(payload)
      .setProtectedHeader(protectedHeader)
      .sign(privateKey);
  };
};
