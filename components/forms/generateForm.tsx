import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { DatePicker } from "../DatePicker";
import { GlobalContext } from "@/context/globalContext";
import { useContext } from "react";
import { useCreateSDJWTVC } from "@/api_queries/issue";

const formSchema = z.object({
  employeeId: z
    .string({
      required_error: "ID is required.",
    })
    .min(2, {
      message: "Username must be at least 3 characters.",
    }),
  familyName: z.string({
    required_error: "Family name is required.",
  }),
  firstName: z.string({
    required_error: "First name is required.",
  }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required.",
  }),
  nationalIdentifier: z.string({
    required_error: "National identifier is required.",
  }),
  emailAddress: z.string().email({
    message: "Please enter a valid email address.",
  }),
  companyId: z.string({
    required_error: "Company ID is required.",
  }),
  companyName: z.string({
    required_error: "Company name is required.",
  }),
  companyLegalIdentifier: z.string({
    required_error: "Company legal identifier is required.",
  }),
});

const gxDisclosureKeys = [
  "employeeId",
  "familyName",
  "firstName",
  "dateOfBirth",
  "nationalIdentifier",
  "emailAddress",
  "companyId",
  "companyName",
  "companyLegalIdentifier",
];

const GenerateForm = () => {
  const { signAlg, pubKey, privKey, holderPubKey, setPayload, setDisclosures } =
    useContext(GlobalContext);
  const { mutateAsync: createSDJWTVC } = useCreateSDJWTVC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    const vcPayload = {
      type: "EmployeeCredential",
      ...values,
    };
    setPayload(JSON.stringify(vcPayload, undefined, 4));
    setDisclosures(
      JSON.stringify(
        {
          _sd: gxDisclosureKeys,
        },
        undefined,
        4
      )
    );
    createSDJWTVC({
      claims: JSON.stringify(vcPayload),
      signAlg,
      pubKey,
      privKey,
      disclosures: JSON.stringify({ _sd: gxDisclosureKeys }),
      holderPubKey,
    }).then((res) => {
      console.log(res);
    });
  }

  const onInvalid = (errors: any) => {
    console.log(errors);
  };
  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 w-full gap-x-2">
            <FormField
              control={form.control}
              name="familyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Family Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Hoops" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Felix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormLabel>ID</FormLabel>
                  <FormDescription>(Employee DID)</FormDescription>
                </div>
                <FormControl>
                  <Input placeholder="did:pkh:tz:..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationalIdentifier"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormLabel>National ID</FormLabel>
                  <FormDescription>
                    (National Identifier)
                  </FormDescription>
                </div>
                <FormControl>
                  <Input placeholder="sample identifier" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 w-full gap-x-2">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <DatePicker
                      withInput
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="employee@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Legal Name</FormLabel>
                <FormControl>
                  <Input placeholder="company AG" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormLabel>Company ID</FormLabel>
                  <FormDescription>
                    (DID of the issuing company)
                  </FormDescription>
                </div>
                <FormControl>
                  <Input placeholder="did:pkh:tz:..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="companyLegalIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Legal Identifier</FormLabel>
                <FormControl>
                  <Input placeholder="did:elsi:..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="secondary" className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default GenerateForm;
