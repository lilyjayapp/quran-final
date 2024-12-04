export interface Reciter {
  id: string;
  name: string;
  style: string;
  identifier: string;
}

export const reciters: Reciter[] = [
  { id: "1", name: "Mishary Rashid Alafasy", style: "Murattal", identifier: "ar.alafasy" },
  { id: "2", name: "Abdul Basit Abdul Samad", style: "Murattal", identifier: "ar.abdulbasitmurattal" },
  { id: "3", name: "Abdul Rahman Al-Sudais", style: "Murattal", identifier: "ar.abdurrahmaansudais" },
  { id: "4", name: "Abu Bakr Al-Shatri", style: "Murattal", identifier: "ar.shaatree" },
  { id: "5", name: "Hani Al-Rifai", style: "Murattal", identifier: "ar.hanirifai" },
  { id: "6", name: "Mohamed Siddiq El-Minshawi", style: "Murattal", identifier: "ar.minshawi" },
  { id: "7", name: "Sa'ad Al-Ghamdi", style: "Murattal", identifier: "ar.saadalghamidi" },
  { id: "8", name: "Ibrahim Walk (English)", style: "English", identifier: "en.walk" },
  { id: "9", name: "Mahmoud Khalil Al-Husary", style: "Murattal", identifier: "ar.husary" },
  { id: "10", name: "Ahmed Ibn Ali Al-Ajamy", style: "Murattal", identifier: "ar.ajamy" },
];