export interface Reciter {
  id: string;
  name: string;
  identifier: string;
}

export const DEFAULT_RECITER = "ar.alafasy";

export const reciters: Reciter[] = [
  { id: "1", name: "Mishary Rashid Alafasy", identifier: "ar.alafasy" },
];