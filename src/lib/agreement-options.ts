export const TRACKS = [
  { value: "Track A", label: "Course Track A" },
  { value: "Track B", label: "Course Track B" },
] as const;

export const COURSES_BY_TRACK: Record<string, readonly string[]> = {
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
};

export const COURSES = Object.values(COURSES_BY_TRACK).flat() as readonly string[];
