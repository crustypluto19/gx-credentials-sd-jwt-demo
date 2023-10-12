import {
  Hasher,
  KeyBindingVerifier,
  base64encode,
  createDisclosureMap,
  createHashMapping,
  decodeJWT,
  decodeSDJWT,
  unpackClaims,
  verifySDJWT,
} from "@meeco/sd-jwt";
import {
  Verifier,
  defaultHashAlgorithm,
  supportedAlgorithm,
} from "@meeco/sd-jwt-vc";
import crypto, { createHash } from "crypto";
import { JWK, KeyLike, importJWK, jwtVerify } from "jose";

function verifierCallbackFn(publicKey: Uint8Array | KeyLike) {
  console.log(publicKey);
  return async (jwt: string): Promise<boolean> => {
    const verifiedKbJWT = await jwtVerify(jwt, publicKey);
    return !!verifiedKbJWT;
  };
}

function hasherCallbackFn(alg: string = defaultHashAlgorithm): Hasher {
  return (data: string): string => {
    const digest = createHash(alg).update(data).digest();
    return base64encode(digest);
  };
}

function kbVeriferCallbackFn(
  expectedAud: string,
  expectedNonce: string
): KeyBindingVerifier {
  return async (kbjwt: string, holderJWK: JWK) => {
    const { header, payload } = decodeJWT(kbjwt);

    if (expectedAud || expectedNonce) {
      if (payload.aud !== expectedAud) {
        throw new Error("aud mismatch");
      }
      if (payload.nonce !== expectedNonce) {
        throw new Error("nonce mismatch");
      }
    }

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
}

export const verifySDJWTVCwithKB = async (
  vcSDJWTWithkeyBindingJWT: string,
  nonce: string,
  issuerPubKey: string
) => {
  const verifier = new Verifier();
  const parsedIssuerPubKey = await importJWK(JSON.parse(issuerPubKey));
  const { keyBindingJWT } = decodeSDJWT(vcSDJWTWithkeyBindingJWT);
  const result = await verifier.verifyVCSDJWT(
    vcSDJWTWithkeyBindingJWT,
    verifierCallbackFn(parsedIssuerPubKey),
    hasherCallbackFn(defaultHashAlgorithm),
    kbVeriferCallbackFn("https://example.com/verifierUrl", nonce)
  );
  if (result) {
    // create SD Map
    const { sdMap, disclosureMap } = await createSDMap(
      vcSDJWTWithkeyBindingJWT
    );
    return { sdMap, disclosureMap, keyBindingJWT };
  }
  return result;
};

// without key binding (using issuer key)
export const verifySDJWTVC = async (
  sdJWT: string,
  issuerPubKey: KeyLike,
  signAlg: string
) => {
  try {
    const key = await importJWK(issuerPubKey, signAlg);
    
    const verifier = async () => {
      let result;
      const splitSDJWT = sdJWT.split("~");
      const compactSDJWT = splitSDJWT[0] || "";      
      result = await jwtVerify(compactSDJWT, key);
      return !!result;
    };

    const result = await verifySDJWT(sdJWT, verifier, getHasher);

    if (result) {
      // create SD Map and get KB JWT
      const { sdMap, disclosureMap } = await createSDMap(sdJWT);
      const { keyBindingJWT } = decodeSDJWT(sdJWT);
      return { payload: result, sdMap, disclosureMap, keyBindingJWT };
    }
    throw new Error("SD-JWT verification failed");
  } catch (e) {
    console.log("Could not verify SD-JWT", e);
    throw e;
  }
};

const getHasher = (hashAlg: string) => {
  let hasher;
  // Default: Hasher for SHA-256
  if (!hashAlg || hashAlg.toLowerCase() === "sha-256") {
    hasher = (data: crypto.BinaryLike) => {
      const digest = crypto.createHash("sha256").update(data).digest();
      return base64encode(digest);
    };
  }
  if (!hasher) {
    return Promise.reject(new Error(`Unsupported hash algorithm ${hashAlg}`));
  }
  return Promise.resolve(hasher);
};

// Adapted from https://github.com/Meeco/sd-jwt/blob/0abd2f8b7fa33fe46e9bcd76e70bdbb027dc7f7a/src/disclosure.ts#L5 as it is not released yet
export const createSDMap = async (sdjwt: string) => {
  const hasher = await getHasher("sha-256");
  const { unverifiedInputSdJwt: payload, disclosures } = decodeSDJWT(sdjwt);
  const disclosureMap = createDisclosureMap(disclosures, hasher);
  const map = createHashMapping(disclosures, hasher);
  const sdMap = unpackClaims(payload, map);

  return {
    sdMap,
    disclosureMap,
  };
};

export type DisclosureObjectMap = {
  [key: string]: DisclosureObject;
};

export type DisclosureObject = {
  disclosure: string;
  value: string;
  parentDisclosures: string[];
};
