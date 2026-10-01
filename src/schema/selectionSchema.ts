import { z } from "zod";

// A <select> bound with react-hook-form's `valueAsNumber` reports an empty
// choice as NaN, which a plain number-or-"" union rejects with zod's generic
// "Invalid input" instead of our message. Accept anything and only treat a
// real, positive id as "selected" so the message is always the friendly one.
export function requiredSelectionId(message: string) {
  return z
    .unknown()
    .refine(
      (value) =>
        typeof value === "number" && Number.isInteger(value) && value > 0,
      { message },
    );
}
