/** Paper A's topic groupings, named after the source folders under resources/paper-a/High yields/. */
export const AREAS = {
  assessment: "Classification & clinical examination",
  neuroscience: "Neurosciences",
  pharmacology: "Pharmacology",
  psychology: "Psychology & development",
  genetics: "Genetics",
} as const;
export type AreaId = keyof typeof AREAS;
