export interface WallItem {
  id: number;
  area: "Student" | "Faculty" | "Shared" | "Planned";
  question: string;
  destination: string;
  planned?: boolean;
}

// Example questions written for this platform. Not quotes from real people.
export const wallItems: WallItem[] = [
  { id: 1, area: "Student", question: "Why does my recursive function never stop?", destination: "Worked answer, one step at a time" },
  { id: 2, area: "Student", question: "What is the difference between a process and a thread?", destination: "AI tutoring" },
  { id: 3, area: "Shared", question: "Nobody in my section followed the last slide on normalization.", destination: "Flagged on the Confusion Map" },
  { id: 4, area: "Faculty", question: "Which concept should I revisit before the internal test?", destination: "Outcome dashboard" },
  { id: 5, area: "Student", question: "I need two teammates who know React for a mini project.", destination: "College projects" },
  { id: 6, area: "Student", question: "Can I ask this without my name on it?", destination: "Anonymous post in the community feed" },
  { id: 7, area: "Student", question: "I have ten minutes before class. Can I go over pointers again?", destination: "AI micro lesson" },
  { id: 8, area: "Student", question: "Explain Big O to me while I walk to the library.", destination: "Voice AI tutor" },
  { id: 9, area: "Faculty", question: "The syllabus changed. How do I tell every section?", destination: "Curriculum updates" },
  { id: 10, area: "Student", question: "How does hashing connect to the rest of this unit?", destination: "Concept clusters" },
  { id: 11, area: "Student", question: "Who answered the most questions this week?", destination: "Leaderboard" },
  { id: 12, area: "Planned", question: "I missed Tuesday's lecture. What did I miss?", destination: "Lecture recap video (planned)", planned: true },
];
