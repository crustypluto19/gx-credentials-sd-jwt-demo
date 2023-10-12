import { toast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const usePresentSDJWTVCwithKB = () => {
  const queryClient = useQueryClient();

  const presentSDJWTVCwithKB = async ({
    sdJWT,
    signAlg,
    disclosedList,
    nonce,
    audience,
    holderPrivKey,
    holderSignAlg,
  }: {
    sdJWT: string;
    disclosedList: any[];
    signAlg: string;
    nonce: string;
    audience?: string;
    holderPrivKey: string;
    holderSignAlg?: string;
  }) => {
    return fetch(`api/present`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sdJWT,
        signAlg,
        disclosedList,
        nonce,
        audience,
        holderPrivKey,
        holderSignAlg,
      }),
    }).then((res) => {
      if (res.status === 200) {
        toast({
          variant: "success",
          title: "Verifiable Presentation Created!",
          description:
            "Your SD-JWT VP has been created! Close this dialog and head to the Verify tab to view it.",
          duration: 4500,
        });
        return res.json();
      } else {
        toast({
          variant: "destructive",
          title: "Something went wrong.",
          description:
            "An error occurred while creating the VP. Please make sure that you've not created a VP with the same SD-JWT VC before and use a correct key pair.",
        });
      }
    });
  };

  return useMutation({
    mutationFn: presentSDJWTVCwithKB,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["presentSDJWTVCwithKB"],
      });
    },
  });
};

export const useCreateSDMap = () => {
  const queryClient = useQueryClient();

  const createSDMap = async ({
    sdJWT,
    signAlg,
  }: {
    sdJWT: string;
    signAlg: string;
  }) => {
    return fetch(`api/createSDMap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sdJWT,
        signAlg,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.error(err));
  };

  return useMutation({
    mutationFn: createSDMap,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["createSDMap"],
      });
    },
  });
};
