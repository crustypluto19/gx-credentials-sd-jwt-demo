import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useVerifySDJWTVC = () => {
  const queryClient = useQueryClient();

  const verifySDJWTVC = async ({
    sdJWT,
    signAlg,
    issuerPubKey,
  }: {
    sdJWT: string;
    signAlg: string;
    issuerPubKey: string;
  }) => {
    return fetch(`api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sdJWT,
        signAlg,
        issuerPubKey,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  };

  return useMutation({
    mutationFn: verifySDJWTVC,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["verifySDJWTVC"] });
    },
  });
};

export const useVerifySDJWTVCwithKBJWT = () => {
  const queryClient = useQueryClient();

  const verifySDJWTVCwithKBJWT = async ({
    vcSDJWTWithkeyBindingJWT,
    issuerPubKey,
    nonce,
  }: {
    vcSDJWTWithkeyBindingJWT : string;
    issuerPubKey: string;
    nonce: string;
  }) => {
    return fetch(`api/verifyWithKeyBinding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vcSDJWTWithkeyBindingJWT,
        issuerPubKey,
        nonce,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  };

  return useMutation({
    mutationFn: verifySDJWTVCwithKBJWT,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["verifySDJWTVCwithKB"] });
    },
  });
};
