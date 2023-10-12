import type { Disclosure, DisclosureMap } from "@meeco/sd-jwt";
import { randomBytes } from "crypto";
import { createContext, useContext, useState } from "react";

type GlobalContextProps = {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  payload: string;
  setPayload: React.Dispatch<React.SetStateAction<string>>;
  signAlg: string;
  setSignAlg: React.Dispatch<React.SetStateAction<string>>;
  pubKey: string;
  setPubKey: React.Dispatch<React.SetStateAction<string>>;
  privKey: string;
  setPrivKey: React.Dispatch<React.SetStateAction<string>>;
  disclosures: string;
  setDisclosures: React.Dispatch<React.SetStateAction<string>>;
  sdMap: string;
  setSDMap: React.Dispatch<React.SetStateAction<string>>;
  disclosureMap: DisclosureMap;
  setDisclosureMap: React.Dispatch<React.SetStateAction<DisclosureMap>>;
  verified: boolean;
  setVerified: React.Dispatch<React.SetStateAction<boolean>>;
  holderPubKey: string;
  setHolderPubKey: React.Dispatch<React.SetStateAction<string>>;
  holderPrivKey: string;
  setHolderPrivKey: React.Dispatch<React.SetStateAction<string>>;
  nonce: string;
  setNonce: React.Dispatch<React.SetStateAction<string>>;
  includedDisclosures: Disclosure[];
  setIncludedDisclosures: React.Dispatch<React.SetStateAction<Disclosure[]>>;
};

export const GlobalContext = createContext<GlobalContextProps>({
  token: "",
  setToken: () => {},
  payload: "",
  setPayload: () => {},
  signAlg: "",
  setSignAlg: () => {},
  pubKey: "",
  setPubKey: () => {},
  privKey: "",
  setPrivKey: () => {},
  disclosures: "",
  setDisclosures: () => {},
  sdMap: "",
  setSDMap: () => {},
  disclosureMap: {},
  setDisclosureMap: () => {},
  verified: false,
  setVerified: () => {},
  holderPubKey: "",
  setHolderPubKey: () => {},
  holderPrivKey: "",
  setHolderPrivKey: () => {},
  nonce: "",
  setNonce: () => {},
  includedDisclosures: [],
  setIncludedDisclosures: () => {},
});

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string>("");
  const [signAlg, setSignAlg] = useState<string>("");
  const [payload, setPayload] = useState<string>("");
  const [pubKey, setPubKey] = useState<string>("");
  const [privKey, setPrivKey] = useState<string>("");
  const [disclosures, setDisclosures] = useState<string>("");
  const [sdMap, setSDMap] = useState<string>("");
  const [disclosureMap, setDisclosureMap] = useState<DisclosureMap>({});
  const [verified, setVerified] = useState<boolean>(false);
  const [holderPubKey, setHolderPubKey] = useState<string>("");
  const [holderPrivKey, setHolderPrivKey] = useState<string>("");
  const [nonce, setNonce] = useState<string>(
    randomBytes(16).toString("base64")
  );
  const [includedDisclosures, setIncludedDisclosures] = useState<Disclosure[]>(
    []
  );
  return (
    <GlobalContext.Provider
      value={{
        token,
        setToken,
        payload,
        setPayload,
        signAlg,
        setSignAlg,
        pubKey,
        setPubKey,
        privKey,
        setPrivKey,
        disclosures,
        setDisclosures,
        sdMap,
        setSDMap,
        disclosureMap,
        setDisclosureMap,
        verified,
        setVerified,
        holderPubKey,
        setHolderPubKey,
        holderPrivKey,
        setHolderPrivKey,
        nonce,
        setNonce,
        includedDisclosures,
        setIncludedDisclosures,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
