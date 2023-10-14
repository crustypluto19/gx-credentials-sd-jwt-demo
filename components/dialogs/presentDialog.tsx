import { useCreateSDJWTVC } from "@/api_queries/issue";
import { usePresentSDJWTVCwithKB } from "@/api_queries/present";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGlobalContext } from "@/context/globalContext";
import { filterDisclosureResults } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { supportedAlgorithm } from "@meeco/sd-jwt-vc";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import FormInputInfo from "../formInputInfo";
import { Card, CardDescription } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

export const PresentationDialog = () => {
  const {
    token,
    payload,
    pubKey,
    privKey,
    signAlg,
    disclosures,
    sdMap,
    disclosureMap,
    nonce,
    setToken,
    setHolderPubKey,
    setHolderPrivKey,
    setIncludedDisclosures,
  } = useGlobalContext();
  const { mutateAsync: presentSDJWTVC } = usePresentSDJWTVCwithKB();
  const { mutateAsync: generateSDJWTVC } = useCreateSDJWTVC();
  const [selectedDisclosures, setSelectedDisclosures] = useState<string[]>([]);

  // wire up the holder key pair
  useEffect(() => {
    form.setValue("holderPubKey", pubKey);
    form.setValue("holderPrivKey", privKey);
    form.setValue("nonce", nonce);
    form.setValue("holderSignAlg", signAlg);
  }, [pubKey, privKey]);

  useEffect(() => {
    const dc =
      disclosureMap &&
      Object.keys(disclosureMap).reduce((acc: string[], sdDigest: string) => {
        return [...acc, disclosureMap[sdDigest].disclosure];
      }, []);
    setSelectedDisclosures(dc);
  }, [disclosureMap]);

  const handleCheck = (
    checked: boolean | "indeterminate",
    sdEntry: {
      disclosure: string;
      parentDisclosures: string[];
      value: any;
    }
  ): void => {
    let newDisclosureMap: string[];
    if (checked) {
      // exclude the disclosure from the list
      newDisclosureMap = selectedDisclosures.filter(
        (item) => item !== sdEntry.disclosure
      );
      setSelectedDisclosures(newDisclosureMap);
    } else {
      newDisclosureMap = [...selectedDisclosures, sdEntry.disclosure];
      setSelectedDisclosures(newDisclosureMap);
    }
  };

  const formSchema = z.object({
    holderPubKey: z.string({
      required_error: "Holder public key is required.",
    }),
    holderPrivKey: z.string({
      required_error: "holder private key is required.",
    }),
    holderSignAlg: z.string({
      required_error: "Signing algorithm of the holder key pair is required.",
    }),
    nonce: z.string({
      required_error: "Nonce from verifier is required.",
    }),
    audience: z.string({
      required_error: "Intended verified (audience) is required.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      audience: "https://example.com/verifierUrl",
      holderSignAlg: signAlg,
    },
  });

  const onInvalid = (errors: any) => {
    console.log(errors);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setHolderPubKey(values.holderPubKey);
    setHolderPrivKey(values.holderPrivKey);
    const disclosedList = filterDisclosureResults(
      selectedDisclosures,
      sdMap,
      disclosureMap
    );
    setIncludedDisclosures(disclosedList);
    console.log("disclosedList", disclosedList);
    if (values.holderPubKey !== pubKey) {
      console.log("pubkey changed");
      const {
        holderPubKey: newHolderPubKey,
        holderPrivKey: newHolderPrivKey,
        holderSignAlg: newHolderSignAlg,
      } = values;
      // issue new VC with holder public key binding in cnf claim
      generateSDJWTVC({
        claims: payload,
        signAlg,
        pubKey,
        privKey,
        disclosures,
        holderPubKey: newHolderPubKey,
      })
        .then((res) => {
          const { sdJWT: newToken } = res;
          return newToken;
        })
        .then((newToken) => {
          present(
            disclosedList,
            {
              ...values,
              holderSignAlg: newHolderSignAlg,
              holderPrivKey: newHolderPrivKey,
            },
            newToken
          );
        });
    } else {
      present(disclosedList, values, token);
    }
  };

  const present = async (disclosedList: any, values: any, token: string) => {
    presentSDJWTVC({
      sdJWT: token,
      signAlg,
      disclosedList,
      nonce: values.nonce,
      audience: values.audience,
      holderPrivKey: values.holderPrivKey,
      holderSignAlg: values.holderSignAlg,
    }).then((res) => {
      if (res) {
        const { vcSDJWTWithkeyBindingJWT } = res;
        setToken(vcSDJWTWithkeyBindingJWT);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={!token}>Create Verifiable Presentation</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[120vh] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create an SD-JWT Verifiable Presentation</DialogTitle>
          <DialogDescription>
            To present your SD-JWT VC to the verifier, configure the following
            options.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 content-center gap-4 py-2">
              <div className="flex flex-col items-center">
                <div className="flex flex-col space-y-4 w-full">
                  <div className="flex justify-between">
                    <FormLabel>Disclosures</FormLabel>
                    <FormInputInfo
                      content={
                        <p>
                          Select the disclosures you would like to{" "}
                          <b>exclude</b> from the verifier. The disclosures
                          correspond to their respective claims in the SD-JWT
                          VC.
                        </p>
                      }
                    />
                  </div>
                  <ScrollArea className="w-full max-h-40">
                    {disclosureMap && Object.keys(disclosureMap).length > 0 ? (
                      Object.keys(disclosureMap).map((sdDigest) => {
                        const sdEntry = disclosureMap[sdDigest];
                        return (
                          <div
                            key={sdEntry.disclosure}
                            className="flex items-center space-x-4 rounded-md border p-4 mb-2 hover:border-purple-800 transition-colors"
                          >
                            <Checkbox
                              id={sdEntry.disclosure}
                              value={sdEntry.disclosure}
                              className="w-6 h-6"
                              onCheckedChange={(checked) => {
                                handleCheck(checked, sdEntry);
                              }}
                            />
                            <Label
                              htmlFor={sdEntry.disclosure}
                              className="flex-1 w-full flex flex-col"
                            >
                              <div className="flex text-sm font-semibold items-baseline">
                                {sdEntry.value}
                                <CardDescription className="text-xs font-normal pl-2">
                                  Disclosure value
                                </CardDescription>
                              </div>
                              <span className="text-xs break-all">
                                {sdEntry.disclosure}
                              </span>
                            </Label>
                          </div>
                        );
                      })
                    ) : (
                      <Card className="flex justify-center align-middle p-4">
                        No disclosures found.
                      </Card>
                    )}
                  </ScrollArea>
                  <FormField
                    control={form.control}
                    name="holderPubKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-2">
                            <FormLabel>Holder Public Key</FormLabel>
                          </div>
                          <FormInputInfo
                            content={
                              <p>
                                Provide an optional <b>public key</b> in JWK
                                format to be bound the SD-JWT VC. This public
                                key belongs to the holder of the SD-JWT VC and
                                will be present in the VC as the value of the{" "}
                                <b>&apos;cnf&apos;</b> claim. if left blank, the
                                issuer&apos;s public key will be used.
                              </p>
                            }
                          />
                        </div>
                        <FormControl>
                          <Textarea
                            id="holderPubKey"
                            placeholder="Holder Public Key"
                            className="max-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="holderPrivKey"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-2">
                            <FormLabel>Holder Private Key</FormLabel>
                          </div>
                          <FormInputInfo
                            content={
                              <p>
                                Provide an optional <b>private key</b> in JWK
                                format to be bound the SD-JWT VC. This private
                                key belongs to the holder of the SD-JWT VC and
                                will be used for signing the Key Binding JWT
                                attached to the main SD-JWT VC. If left blank,
                                the issuer&apos;s private key will be used.
                              </p>
                            }
                          />
                        </div>
                        <FormControl>
                          <Textarea
                            id="holderPrivKey"
                            placeholder="Holder Private Key"
                            className="max-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-x-4">
                    <FormField
                      control={form.control}
                      name="holderSignAlg"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <div className="flex items-center space-x-2">
                              <FormLabel>Holder Key Pair Algorithm</FormLabel>
                            </div>
                            <FormInputInfo
                              content={
                                <p>
                                  Algorithm used for the holder&apos;s key pair.
                                  By default the issuer&apos;s key pair
                                  algorithm is used. If you provide a holder key
                                  pair, make sure to enter the correct algorithm
                                  for the key pair.
                                </p>
                              }
                            />
                          </div>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Algorithm" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(supportedAlgorithm).map(
                                  (alg) => {
                                    return (
                                      <SelectItem key={alg} value={alg}>
                                        {alg}
                                      </SelectItem>
                                    );
                                  }
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nonce"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <div className="flex items-center space-x-2">
                              <FormLabel>Nonce</FormLabel>
                            </div>
                            <FormInputInfo
                              content={
                                <p>
                                  Randomly generated nonce from the verifier to
                                  ensure the freshness of the signature.
                                  Currently 16 bytes (but can be arbitrary) in
                                  length, encoded in base64.
                                </p>
                              }
                            />
                          </div>
                          <FormControl>
                            <Input
                              placeholder="Nonce from verifier"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="audience"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-2">
                            <FormLabel>Audience (verifier)</FormLabel>
                          </div>
                          <FormInputInfo
                            content={
                              <p>
                                Refers to the intended verifier to which the
                                SD-JWT VC with key binding is presented.
                              </p>
                            }
                          />
                        </div>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/verifierUrl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="token" className="pl-2 pb-2">
                  Encoded
                </Label>
                <Textarea
                  id="token"
                  className="h-[65vh]"
                  value={token}
                  readOnly
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit">Present</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PresentationDialog;
