import test from "node:test";
import assert from "node:assert/strict";
import { isCuhkStudentEmail, normalizeEmail } from "../src/verification.js";
import { validatePostPayload } from "../src/validation.js";

test("accepts CUHK student domains and normalizes email", () => {
  assert.equal(normalizeEmail("  S123@Link.CUHK.EDU.HK "), "s123@link.cuhk.edu.hk");
  assert.equal(isCuhkStudentEmail("student@link.cuhk.edu.hk"), true);
  assert.equal(isCuhkStudentEmail("staff@cuhk.edu.hk"), true);
});

test("rejects non-CUHK domains", () => {
  assert.equal(isCuhkStudentEmail("person@gmail.com"), false);
  assert.equal(isCuhkStudentEmail("bad-email-format"), false);
});

test("validates roommate post payload", () => {
  const valid = validatePostPayload({
    title: "Looking for one clean and quiet roommate in Sha Tin",
    preferredArea: "Sha Tin",
    budget: "HKD 8000-10000",
    moveInMonth: "2026-08",
    notes:
      "I am a CUHK student who keeps a regular schedule and hopes to find a respectful roommate for the next school year.",
    contact: "Telegram: @student",
  });
  assert.deepEqual(valid.errors, []);

  const invalid = validatePostPayload({
    title: "Too short",
    preferredArea: "",
    budget: "",
    moveInMonth: "",
    notes: "short text",
    contact: "",
  });
  assert.equal(invalid.errors.length, 6);
});
