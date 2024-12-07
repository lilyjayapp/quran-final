export interface Language {
  id: string;
  name: string;
  code: string;
  direction: 'ltr' | 'rtl';
  audioCode?: string;
}

export const languages: Language[] = [
  { 
    id: "1", 
    name: "Arabic", 
    code: "ar.alafasy", 
    direction: "rtl",
    audioCode: "ar.alafasy"
  },
  { 
    id: "2", 
    name: "English", 
    code: "en.sahih", 
    direction: "ltr",
    audioCode: "en.sahih"
  },
];