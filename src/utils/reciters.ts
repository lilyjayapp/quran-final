export interface Reciter {
  id: string;
  name: string;
  identifier: string;
}

export const DEFAULT_RECITER = "ar.alafasy";

export const reciters: Reciter[] = [
  { id: "1", name: "Mishary Rashid Alafasy", identifier: "ar.alafasy" },
  { id: "2", name: "Abdul Basit Abdul Samad", identifier: "ar.abdulbasit" },
  { id: "3", name: "Abu Bakr Al-Shatri", identifier: "ar.shaatree" },
  { id: "4", name: "Hani Rifai", identifier: "ar.hanirifai" },
  { id: "5", name: "Mohamed Siddiq El-Minshawi", identifier: "ar.minshawi" },
];