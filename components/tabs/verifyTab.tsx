import {
  useVerifySDJWTVC,
  useVerifySDJWTVCwithKBJWT,
} from "@/api_queries/verify";
import { useGlobalContext } from "@/context/globalContext";
import { decodeHeader, decodeKBJWT, decodePayload } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

const VerifyTab = () => {
  const {
    token,
    signAlg,
    pubKey,
    privKey,
    verified,
    sdMap,
    holderPubKey,
    holderPrivKey,
    nonce,
    includedDisclosures,
    setSDMap,
    setVerified,
    setToken,
  } = useGlobalContext();
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedPayload, setDecodedPayload] = useState("");
  const [keyBindingJWT, setKeyBindingJWT] = useState("");
  const [decodedKBJWTHeader, setDecodedKBJWTHeader] = useState("");
  const [decodedKBJWTPayload, setDecodedKBJWTPayload] = useState("");
  const [isHolderKB, _] = useState(holderPubKey && holderPubKey !== pubKey);

  const { mutateAsync: verifySDJWTVC } = useVerifySDJWTVC();
  const { mutateAsync: verifySDJWTVCwithKB } = useVerifySDJWTVCwithKBJWT();

  useEffect(() => {
    if (token) {
      setDecodedHeader(decodeHeader(token));
      setDecodedPayload(decodePayload(token));
    }
    handleVerify();
  }, [token]);

  useEffect(() => {
    if (keyBindingJWT) {
      console.log(keyBindingJWT);
      console.log("triggered");
      const decodedKBJWT = decodeKBJWT(keyBindingJWT);
      console.log(decodedKBJWT.header!);
      console.log(decodedKBJWT.payload!);
      setDecodedKBJWTHeader(decodedKBJWT.header!);
      setDecodedKBJWTPayload(decodedKBJWT.payload!);
    }
  }, [keyBindingJWT]);

  const handleVerify = async () => {
    // verify SD JWT with key binding
    if (isHolderKB) {
      verifySDJWTVCwithKB({
        vcSDJWTWithkeyBindingJWT: token,
        issuerPubKey: pubKey,
        nonce,
      }).then((data) => {
        if (data) processVerifyResponse(data);
      });
    } else {
      verifySDJWTVC({
        sdJWT: token,
        signAlg,
        issuerPubKey: pubKey,
      }).then((data) => {
        if (data) processVerifyResponse(data);
      });
    }
  };
  const processVerifyResponse = (data: any) => {
    if (data) {
      setVerified(!!data);
      try {
        const { sdMap, keyBindingJWT } = data;
        setSDMap(JSON.stringify(sdMap, undefined, 4));
        setKeyBindingJWT(keyBindingJWT);
      } catch (err) {
        setVerified(false);
      }
    } else setVerified(false);
  };

  return (
    <div className="grid grid-cols-2 content-center gap-x-4 py-4">
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-baseline space-x-2">
              <CardTitle className="text-3xl">Encoded</CardTitle>
              <CardDescription>Encoded SD-JWT VC.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste SD-JWT VC here or create one using the Create tab."
              className="h-[45vh]"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            {isHolderKB ? (
              <CardTitle>Holder Key Binding JWT</CardTitle>
            ) : keyBindingJWT ? (
              <CardTitle>Issuer Key Binding JWT</CardTitle>
            ) : (
              <CardTitle>Issuer Key Pair</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {keyBindingJWT ? (
              <div className="flex flex-col space-y-4">
                <div>
                  <Label htmlFor="decodedKBJWTHeader">
                    Key Binding JWT Header
                  </Label>
                  <Textarea
                    id="decodedKBJWTHeader"
                    className="h-28"
                    value={decodedKBJWTHeader}
                    readOnly
                  />
                </div>
                <Label htmlFor="decodedKBJWTPayload">
                  Key Binding JWT Payload
                </Label>
                <Textarea
                  id="decodedKBJWTPayload"
                  className="h-32"
                  value={decodedKBJWTPayload}
                  readOnly
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="pubKey" className="pl-1">
                    Public Key
                  </Label>
                  <Textarea
                    id="holderPrivKey"
                    placeholder="Holder Private Key"
                    value={!holderPubKey ? pubKey : holderPubKey}
                    className="h-26"
                    disabled={!holderPubKey}
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="pubKey" className="pl-1">
                    Private Key
                  </Label>
                  <Textarea
                    id="holderPrivKey"
                    placeholder="Holder Private Key"
                    value={!holderPrivKey ? privKey : holderPrivKey}
                    className="h-26"
                    disabled={!holderPrivKey}
                    readOnly
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader className="grid grid-cols-2">
            <div>
              <CardTitle className="text-3xl">Decoded</CardTitle>
              <p className="text-sm text-gray-600">
                {keyBindingJWT ? (
                  <>
                    with {isHolderKB ? <b>holder</b> : <b>issuer</b>} key
                    binding
                  </>
                ) : (
                  <>
                    <b>without</b> key binding
                  </>
                )}
              </p>
            </div>
            <div className="flex justify-end">
              {verified && token ? (
                <p className="text-xl font-semibold text-green-600">✅ Valid</p>
              ) : (
                <p className="text-xl font-semibold text-red-700">❌ Invalid</p>
              )}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-baseline space-x-2">
              <CardTitle>Header</CardTitle>
              <CardDescription>Header of the SD-JWT VC</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea className="h-28" value={decodedHeader} />
          </CardContent>
        </Card>
        <Tabs defaultValue="payload" className="flex flex-col w-full">
          <TabsList>
            <TabsTrigger value="payload" className="w-full">
              Payload
            </TabsTrigger>
            <TabsTrigger value="sdclaims" className="w-full">
              SD Claims
            </TabsTrigger>
            <TabsTrigger value="disclosures" className="w-full">
              Disclosures
            </TabsTrigger>
          </TabsList>
          <TabsContent value="payload">
            <Card>
              <CardHeader>
                <div className="flex items-baseline space-x-2">
                  <CardTitle>Payload</CardTitle>
                  <CardDescription>The entire SD-JWT Payload</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Select a signing algorithm to create an SD-JWT VC."
                  className="min-h-[55vh]"
                  value={decodedPayload}
                  readOnly
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sdclaims">
            <Card>
              <CardHeader>
                <div className="flex items-baseline space-x-2">
                  <CardTitle>SD Claims</CardTitle>
                  <CardDescription>
                    Selectively (un)disclosable claims from the payload
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Select a signing algorithm to create an SD-JWT VC."
                  className="h-72"
                  value={sdMap}
                  readOnly
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="disclosures">
            <Card>
              <CardHeader>
                <CardTitle>Included Disclosures</CardTitle>
                <CardDescription>
                  All disclosed claims from the VC or VP issued by issuer or
                  holder.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="max-h-72">
                  {includedDisclosures.length > 0 ? (
                    includedDisclosures.map(({ disclosure, value }) => {
                      return (
                        <div
                          key={disclosure}
                          className="flex items-center space-x-4 rounded-md border p-4 mb-2 mr-3 hover:border-purple-800 transition-colors"
                        >
                          <Label className="flex-1 w-full flex flex-col">
                            <div className="flex text-sm font-semibold items-baseline">
                              {value}
                              <CardDescription className="text-xs font-normal pl-2">
                                Disclosure value
                              </CardDescription>
                            </div>
                            <span className="text-xs break-all">
                              {disclosure}
                            </span>
                          </Label>
                        </div>
                      );
                    })
                  ) : (
                    <p>No selectively disclosable claims were disclosed.</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VerifyTab;
