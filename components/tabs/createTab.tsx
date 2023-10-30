import { GlobalContext } from "@/context/globalContext";
import { decodePayload } from "@/lib/utils";
import { sampleDisclosures, samplePayload } from "@/sample/sample";
import { useContext } from "react";
import JsonGraphDialog from "../dialogs/jsonGraphDialog";
import PresentationDialog from "../dialogs/presentDialog";
import GenerateForm from "../forms/generateForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

const CreateTab = () => {
  const {
    token,
    payload,
    pubKey,
    privKey,
    disclosures,
    sdMap,
    setPayload,
    setPubKey,
    setPrivKey,
    setDisclosures,
  } = useContext(GlobalContext);

  return (
    <div className="grid grid-cols-2 content-center gap-x-4 p-4">
      <div className="flex flex-col space-y-2">
        <Tabs
          defaultValue="employee"
          className="flex flex-col items-center w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="employee" className="w-full">
              GX Employee Credential
            </TabsTrigger>
            <TabsTrigger value="custom" className="w-full">
              Custom Payload or Input
            </TabsTrigger>
          </TabsList>
          <TabsContent value="employee" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>GX Employee Credential</CardTitle>
                <CardDescription>
                  Create a GX Employee Credential based on the schema outlined
                  in the thesis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerateForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent
            value="custom"
            className="w-full flex flex-col space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Custom Payload or Input</CardTitle>
                <CardDescription>
                  Specify your own payload to be signed (in JSON) or view the
                  payload created from the GX Employee Credential form.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="custompayload" className="pl-1">
                    Payload
                  </Label>
                  <Textarea
                    id="custompayload"
                    onChange={(e) => {
                      setPayload(e.target.value);
                    }}
                    className="h-64"
                    value={payload}
                    placeholder={`${JSON.stringify(
                      samplePayload,
                      undefined,
                      4
                    )}`}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Disclosures</CardTitle>
                <CardDescription>
                  Specify which claims in the SD-JWT VC you want to be
                  selectively disclosable here
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`${JSON.stringify(
                    sampleDisclosures,
                    undefined,
                    4
                  )}`}
                  value={disclosures}
                  className="h-44"
                  onChange={(e) => {
                    setDisclosures(e.target.value);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <Card>
          <CardHeader>
            <CardTitle>Issuer Key Pair</CardTitle>
            <CardDescription>
              Pick a signing algorithm to generate a key used for signing, or
              provide your own keys in JWK format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pubKey" className="pl-1">
                Public Key
              </Label>
              <Textarea
                id="pubKey"
                placeholder="Public Key"
                value={pubKey}
                className="h-26"
                onChange={(e) => {
                  setPubKey(e.target.value);
                }}
              />
            </div>
            <div>
              <Label htmlFor="privKey" className="pl-1">
                Private Key
              </Label>
              <Textarea
                id="privKey"
                placeholder="Private Key"
                value={privKey}
                onChange={(e) => {
                  setPrivKey(e.target.value);
                }}
                className="h-26"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-baseline space-x-2">
              <CardTitle className="text-3xl">Encoded</CardTitle>
              <CardDescription>Generated SD-JWT</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="min-h-[54vh]"
              value={token}
              placeholder="Select a signing algorithm to create an SD-JWT VC."
              readOnly
            />
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
          </TabsList>
          <TabsContent value="payload">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex items-baseline space-x-2">
                    <CardTitle>Payload</CardTitle>
                    <CardDescription>The entire SD-JWT Payload</CardDescription>
                  </div>
                  <JsonGraphDialog jwt={decodePayload(token)} title="Payload" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="min-h-[40vh]"
                  value={decodePayload(token)}
                  placeholder="Select a signing algorithm to create an SD-JWT VC."
                  readOnly
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sdclaims">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex items-baseline space-x-2">
                    <CardTitle>SD Claims</CardTitle>
                    <CardDescription>
                      Selectively (un)disclosable claims from the payload
                    </CardDescription>
                  </div>
                  <JsonGraphDialog
                    jwt={sdMap}
                    title="Selective Disclosure Claims"
                    description="Selectively (un)disclosable claims from the payload"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  className="h-80"
                  value={sdMap}
                  placeholder="Select a signing algorithm to create an SD-JWT VC."
                  readOnly
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <PresentationDialog />
      </div>
    </div>
  );
};

export default CreateTab;
