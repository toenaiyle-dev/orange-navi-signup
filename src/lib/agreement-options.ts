export const TRACKS = [
  { value: "Track A", label: "Course Track A" },
  { value: "Track B", label: "Course Track B" },
] as const;

export const COURSES_BY_TRACK = {
  "Track A": [
    "Video Editing",
    "Graphics Design",
    "Cinematography",
    "Motion Graphics",
    "Photography",
  ],
  "Track B": [
    "Web Development",
    "Robotics",
    "Mobile Design",
    "Tech Maintenance",
    "Digital Marketing",
  ],
} as const;

export const COURSES = [
  ...COURSES_BY_TRACK["Track A"],
  ...COURSES_BY_TRACK["Track B"],
] as const;
