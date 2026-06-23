function cleanText(value) {
  return String(value || "").trim();
}

export function validatePostPayload(payload) {
  const normalized = {
    title: cleanText(payload.title),
    preferredArea: cleanText(payload.preferredArea),
    budget: cleanText(payload.budget),
    moveInMonth: cleanText(payload.moveInMonth),
    notes: cleanText(payload.notes),
    contact: cleanText(payload.contact),
  };

  const errors = [];

  if (normalized.title.length < 10 || normalized.title.length > 120) {
    errors.push("Title must be between 10 and 120 characters.");
  }

  if (!normalized.preferredArea) {
    errors.push("Preferred area is required.");
  }

  if (!normalized.budget) {
    errors.push("Budget is required.");
  }

  if (!normalized.moveInMonth) {
    errors.push("Move-in month is required.");
  }

  if (normalized.notes.length < 30 || normalized.notes.length > 1000) {
    errors.push("Description must be between 30 and 1000 characters.");
  }

  if (!normalized.contact) {
    errors.push("Contact information is required.");
  }

  return { errors, normalized };
}
