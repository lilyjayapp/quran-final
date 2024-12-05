export interface Language {
  id: string;
  name: string;
  code: string;
  direction: 'ltr' | 'rtl';
}

export const languages: Language[] = [
  { id: "1", name: "Arabic", code: "ar.alafasy", direction: "rtl" },
  { id: "2", name: "English", code: "en.asad", direction: "ltr" },
  { id: "3", name: "French", code: "fr.hamidullah", direction: "ltr" },
  { id: "4", name: "Spanish", code: "es.asad", direction: "ltr" },
  { id: "5", name: "Turkish", code: "tr.ates", direction: "ltr" },
  { id: "6", name: "Indonesian", code: "id.indonesian", direction: "ltr" },
  { id: "7", name: "Urdu", code: "ur.jalandhry", direction: "rtl" },
  { id: "8", name: "German", code: "de.aburida", direction: "ltr" },
  { id: "9", name: "Russian", code: "ru.kuliev", direction: "ltr" },
  { id: "10", name: "Chinese", code: "zh.jian", direction: "ltr" },
  { id: "11", name: "Persian", code: "fa.ansarian", direction: "rtl" },
  { id: "12", name: "Bengali", code: "bn.bengali", direction: "ltr" },
  { id: "13", name: "Hindi", code: "hi.hindi", direction: "ltr" },
  { id: "14", name: "Malayalam", code: "ml.abdulhameed", direction: "ltr" },
  { id: "15", name: "Tamil", code: "ta.tamil", direction: "ltr" }
];