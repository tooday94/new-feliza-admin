type FormatPriceOptions = {
  separator?: "." | ","; // Raqam ajratgichi
  withCurrency?: boolean; // "so'm" qo‘shish yoki yo‘q
};

export function formatPrice(
  value: number | string,
  options: FormatPriceOptions = {}
): string {
  const { separator = " ", withCurrency = true } = options;

  // string bo'lsa numberga o'tkazamiz
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  // toLocaleString bilan formatlash
  let formatted = num.toLocaleString("ru-RU"); // 1 234 567

  // agar separator "." yoki "," bo'lsa, o'zgartiramiz
  if (separator !== " ") {
    formatted = formatted.replace(/\s/g, separator);
  }

  return withCurrency ? `${formatted} so'm` : formatted;
}
