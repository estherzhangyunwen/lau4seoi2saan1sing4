import type {
  GenderPreference,
  LifestyleTag,
  RoomType,
  RoommatePost,
} from "./types";

export const CUHK_STUDENT_EMAIL_DOMAIN = "@link.cuhk.edu.hk";

export const roomTypes: RoomType[] = ["Shared room", "Private room", "Entire flat"];

export const genderPreferences: GenderPreference[] = [
  "No preference",
  "Female roommates",
  "Male roommates",
  "Mixed group",
];

export const lifestyleTags: LifestyleTag[] = [
  "Quiet",
  "Early riser",
  "Night owl",
  "Pet friendly",
  "Non-smoker",
  "Cooking",
];

export const campusAreas = [
  "University Station",
  "Fo Tan",
  "Sha Tin",
  "Tai Wai",
  "Ma On Shan",
  "Kowloon Tong",
  "Other",
];

export const starterPosts: RoommatePost[] = [
  {
    id: "starter-1",
    title: "Looking for one flatmate near University Station",
    location: "University Station",
    roomType: "Private room",
    budget: 6800,
    moveInDate: "2026-08-15",
    genderPreference: "No preference",
    lifestyleTags: ["Quiet", "Non-smoker"],
    description:
      "Two postgraduate students are renewing a quiet flat ten minutes from campus. We keep shared spaces clean and usually study in the evenings.",
    contactMethod: "Message via CUHK email after matching",
    postedAt: "2026-06-21T09:00:00.000Z",
    authorEmail: "m******@link.cuhk.edu.hk",
    authorProgramme: "MSc Information Engineering",
    authorYear: "Postgraduate",
  },
  {
    id: "starter-2",
    title: "Female roommate wanted for Sha Tin shared flat",
    location: "Sha Tin",
    roomType: "Shared room",
    budget: 4300,
    moveInDate: "2026-07-20",
    genderPreference: "Female roommates",
    lifestyleTags: ["Cooking", "Early riser"],
    description:
      "Shared flat with quick bus access to CUHK. Ideal for someone tidy who enjoys cooking simple meals together on weekends.",
    contactMethod: "Telegram handle shared after verification",
    postedAt: "2026-06-19T11:30:00.000Z",
    authorEmail: "a******@link.cuhk.edu.hk",
    authorProgramme: "BBA",
    authorYear: "Year 3",
  },
  {
    id: "starter-3",
    title: "Forming a group for Ma On Shan lease",
    location: "Ma On Shan",
    roomType: "Entire flat",
    budget: 7500,
    moveInDate: "2026-09-01",
    genderPreference: "Mixed group",
    lifestyleTags: ["Pet friendly", "Night owl"],
    description:
      "Searching for two more CUHK students to view flats together near the MTR. Open to cats and late study schedules.",
    contactMethod: "In-app message request",
    postedAt: "2026-06-17T15:15:00.000Z",
    authorEmail: "j******@link.cuhk.edu.hk",
    authorProgramme: "BSSc",
    authorYear: "Year 2",
  },
];
