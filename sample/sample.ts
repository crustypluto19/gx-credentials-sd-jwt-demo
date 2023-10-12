export const samplePayload = {
  type: "VerifiableCredential",
  status: {
    idx: "statusIndex",
    uri: "https://valid.status.url",
  },
  address: "Munich",
  university: "TUM",
  hobbys: ["Studying", "Coding", "Research"],
  person: {
    name: "Max Mustermann",
    age: 25,
  },
};

export const sampleDisclosures = {
  _sd: ["address"],
  hobbys: {
    _sd: [0, 1],
  },
  person: { _sd: ["age"] },
};
