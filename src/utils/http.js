export function extractErrorMessage(input) {
  // Acceptă fie răspuns (data), fie obiect de eroare axios
  const data = input?.response?.data ?? input;
  const m =
    data?.message ??
    data?.error ??
    (typeof data === "string" ? data : null);

  // Laravel validation: { errors: { email: ["..."], password: ["..."] } }
  if (!m && data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    const firstMsg = data.errors[firstKey]?.[0];
    if (firstMsg) return firstMsg;
  }

  return m || "A apărut o eroare la autentificare.";
}
