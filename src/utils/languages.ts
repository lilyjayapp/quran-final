export interface Language {
  id: string;
  name: string;
  code: string;
  direction: 'ltr' | 'rtl';
}

export const languages: Language[] = [
  { id: "1", name: "Arabic", code: "ar.alafasy", direction: "rtl" },
  { id: "2", name: "English", code: "en.asad", direction: "ltr" },
];