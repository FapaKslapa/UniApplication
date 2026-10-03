const ROMAN_NUMERAL = /^(?:i{1,3}|iv|v|vi{1,3}|ix|x)$/i;

function formatWord(word: string): string {
  const bare = word.replace(/[^\p{L}]/gu, "");
  if (ROMAN_NUMERAL.test(bare) && bare.length <= 4) return word.toUpperCase();
  return word.toLowerCase();
}

export function formatSubjectName(name: string): string {
  const sentence = name.trim().split(/\s+/).map(formatWord).join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
