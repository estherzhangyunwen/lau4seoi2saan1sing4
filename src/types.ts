export type RoomType = "Shared room" | "Private room" | "Entire flat";

export type GenderPreference =
  | "No preference"
  | "Female roommates"
  | "Male roommates"
  | "Mixed group";

export type LifestyleTag =
  | "Quiet"
  | "Early riser"
  | "Night owl"
  | "Pet friendly"
  | "Non-smoker"
  | "Cooking";

export interface StudentProfile {
  email: string;
  studentId: string;
  programme: string;
  yearOfStudy: string;
  verifiedAt: string;
}

export interface RoommatePost {
  id: string;
  title: string;
  location: string;
  roomType: RoomType;
  budget: number;
  moveInDate: string;
  genderPreference: GenderPreference;
  lifestyleTags: LifestyleTag[];
  description: string;
  contactMethod: string;
  postedAt: string;
  authorEmail: string;
  authorProgramme: string;
  authorYear: string;
}
