import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateSDJWTVC = () => {
  const queryClient = useQueryClient();

  const createSDJWTVC = async ({
    claims,
    signAlg,
    pubKey,
    privKey,
    disclosures,
    holderPubKey,
  }: {
    claims: string;
    signAlg: string;
    pubKey: string;
    privKey: string;
    disclosures: string;
    holderPubKey: string;
  }) => {
    return fetch(`api/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        claims,
        signAlg,
        pubKey,
        privKey,
        disclosures,
        holderPubKey,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  };

  return useMutation({
    mutationFn: createSDJWTVC,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["issueSDJWTVC"] });
    },
  });
};

export const useGenerateIssuerKeyPair = () => {
  const queryClient = useQueryClient();

  const generateIssuerKeyPair = async (alg: string) => {
    return fetch("/api/generateKeyPair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        algorithm: alg,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  };

  return useMutation({
    mutationFn: generateIssuerKeyPair,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["generateHolderKeyPair"],
      });
    },
  });
};
