import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Disclosure } from "@meeco/sd-jwt";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const decodeHeader = (jwt: string) => {
  try {
    const header = jwt.split(".")[0];
    const decodedHeader = atob(header);
    return JSON.stringify(JSON.parse(decodedHeader), undefined, 4);
  } catch (e) {
    // console.log("Something went wrong when parsing header from JWT", e);
    return "";
  }
};

export const decodePayload = (jwt: string) => {
  try {
    const payload = jwt.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.stringify(JSON.parse(decodedPayload), undefined, 4);
  } catch (e) {
    // console.log("Something went wrong when parsing payload from JWT", e);
    return "";
  }
};

export const decodeKBJWT = (jwt: string) => {
  try {
    const kbJWT = jwt.split(".");

    // invalid KB JWT
    if (kbJWT.length < 2) {
      console.log("Invalid KB JWT");
      return {};
    }
    const kbHeader = kbJWT[0];
    const decodedHeader = atob(kbHeader);
    const kbPayload = kbJWT[1];
    const decodedPayload = atob(kbPayload);
    return {
      header: JSON.stringify(JSON.parse(decodedHeader), undefined, 4),
      payload: JSON.stringify(JSON.parse(decodedPayload), undefined, 4),
    };
  } catch (e) {
    // console.log("Something went wrong when parsing KBJWT from JWT", e);
    return {};
  }
};

type DisclosureMap = Record<
  string,
  { disclosure: string; value: any; parentDisclosures: string[] }
>;

interface ResultObject {
  key: string;
  value: string | number;
  disclosure: string;
}

/**
 * Generates an array of ResultObject based on the provided sdMap and disclosureMap.
 * @param sdMap - A string representation of a JSON object containing the sdMap.
 * @param disclosureMap - An object containing the disclosure map.
 * @returns An array of ResultObject containing the key, value, and disclosure for each disclosed item.
 */
const generateDisclosureResults = (
  sdMap: string,
  disclosureMap: DisclosureMap
): ResultObject[] => {
  try {
    const result: ResultObject[] = [];
    const parsedSDMap = JSON.parse(sdMap);
    processNestedObject(parsedSDMap, disclosureMap, result);
    return result;
  } catch (error) {
    console.error("Error generating result object:", error);
    return [];
  }
};

// helper function for generateDisclosureResults
const processNestedObject = (
  obj: any,
  disclosureMap: DisclosureMap,
  result: ResultObject[],
  parentKey: string = ""
) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (value && value._sd) {
        // Handle single values
        const sdKey = value._sd;
        const { disclosure, value: singleValue } = disclosureMap[sdKey];
        result.push({
          key: fullKey,
          value: singleValue || "",
          disclosure,
        });
      } else if (Array.isArray(value)) {
        // Handle arrays of values
        for (const item of value) {
          if (item?._sd) {
            const sdKey = item._sd;
            const { disclosure, value: itemValue } = disclosureMap[sdKey];
            result.push({
              key: fullKey,
              value: itemValue || "",
              disclosure,
            });
          }
        }
      } else if (value && typeof value === "object") {
        // Handle nested objects recursively
        processNestedObject(value, disclosureMap, result, parentKey);
      }
    }
  }
};

/**
 * Filters the disclosure results based on the selected disclosures.
 * @param selectedDisclosures - An array containing the selected disclosures in string format.
 * @param sdMap - A string representation of a JSON object containing the sdMap.
 * @param disclosureMap - An object containing the disclosure map.
 * @returns An array of objects containing the key and value for each disclosed item that matches the selected disclosures.
 */
export const filterDisclosureResults = (
  selectedDisclosures: string[],
  sdMap: string,
  disclosureMap: DisclosureMap
): Disclosure[] => {
  const results = generateDisclosureResults(sdMap, disclosureMap);
  return results.filter((result) =>
    selectedDisclosures.includes(result.disclosure)
  );
};
