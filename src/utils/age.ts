function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// The blood-request API stores a date of birth, not an age, so a recipient's
// age is sent as "today, `age` years ago" (YYYY-MM-DD, local time). ageFromDob
// turns it back into the same age.
export function dobFromAge(age: number): string {
  const today = new Date();
  return toIsoDate(
    new Date(today.getFullYear() - age, today.getMonth(), today.getDate()),
  );
}

// Whole years between a YYYY-MM-DD date of birth and today, or null if the
// value is missing or not a valid date.
export function ageFromDob(value: string | null | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const today = new Date();

  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}
