"use client";
import {
  useCreateSDJWTVC,
  useGenerateIssuerKeyPair,
} from "@/api_queries/issue";
import { useCreateSDMap } from "@/api_queries/present";
import CreateTab from "@/components/tabs/createTab";
import VerifyTab from "@/components/tabs/verifyTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalContext } from "@/context/globalContext";
import { sampleDisclosures, samplePayload } from "@/sample/sample";
import { supportedAlgorithm } from "@meeco/sd-jwt-vc";
import { useEffect } from "react";

export default function Home() {
  const {
    token,
    payload,
    disclosures,
    signAlg,
    pubKey,
    privKey,
    holderPubKey,
    setToken,
    setPayload,
    setSignAlg,
    setPubKey,
    setPrivKey,
    setDisclosures,
    setSDMap,
    setDisclosureMap,
  } = useGlobalContext();
  const { mutateAsync: generateIssuerKeyPair } = useGenerateIssuerKeyPair();
  const { mutateAsync: createSDJWTVC } = useCreateSDJWTVC();
  const { mutateAsync: createSDMap } = useCreateSDMap();

  const handleGenerateKeys = async (alg: string) => {
    generateIssuerKeyPair(alg).then((data) => {
      if (data) {
        setPubKey(JSON.stringify(data.publicKeyJWK));
        setPrivKey(JSON.stringify(data.privateKeyJWK));
      }
    });
  };

  const generateSDJWT = async () => {
    createSDJWTVC({
      claims: payload,
      signAlg,
      pubKey,
      privKey,
      disclosures,
      holderPubKey,
    }).then(({ sdJWT, sdMap, disclosureMap }) => {
      setToken(sdJWT);
      setSDMap(JSON.stringify(sdMap, undefined, 4));
      setDisclosureMap(disclosureMap);
    });
  };

  useEffect(() => {
    if (payload && signAlg && disclosures && pubKey && privKey) {
      console.log("top level component change triggered");
      generateSDJWT().then(() => {
        // set SD claims
        if (token) {
          createSDMap({
            sdJWT: token,
            signAlg,
          }).then((res) => {
            console.log(res);
          });
        }
      });
    }
  }, [payload, disclosures, pubKey, privKey]);

  return (
    <main className="flex flex-col py-12 px-20 gap-y-4">
      <section className="flex flex-col items-center">
        <h1 className="text-5xl font-semibold pb-2">SD-JWT VC Demo</h1>
        <p className="py-4 text-center max-w-[70vh]">
          Create, Decode, and Verify IETF SD-JWT Verifiable Credentials based on
          the GX-Credentials Employee Schema
        </p>
      </section>
      <div className="flex justify-center items-center">
        <Tabs
          defaultValue="create"
          className="flex flex-col items-center w-full"
        >
          <TabsList className="w-1/3">
            <TabsTrigger value="create" className="w-1/2">
              Create
            </TabsTrigger>
            <TabsTrigger value="verify" className="w-1/2">
              Verify
            </TabsTrigger>
          </TabsList>
          <div className="flex justify-center items-center pt-4">
            <Select
              onValueChange={async (value) => {
                setSignAlg(value);
                if (!payload)
                  setPayload(JSON.stringify(samplePayload, undefined, 4));
                if (!disclosures)
                  setDisclosures(
                    JSON.stringify(sampleDisclosures, undefined, 4)
                  );
                await handleGenerateKeys(value);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Signing Algorithm" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(supportedAlgorithm).map((alg) => {
                  return (
                    <SelectItem key={alg} value={alg}>
                      {alg}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <TabsContent value="create" className="w-full">
            <CreateTab />
          </TabsContent>
          <TabsContent value="verify" className="w-full">
            <VerifyTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
