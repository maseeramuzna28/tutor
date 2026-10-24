import { http } from "./http";
import { db, MockPost, MockProject, MockTopic, MockCurriculumUpdate } from "./mockData";

let seq = 100;
const nid = (prefix: string) => `${prefix}${++seq}`;
const now = () => new Date().toISOString();
const hottest = <T extends { heat: number }>(list: T[]) =>
  [...list].sort((a, b) => b.heat - a.heat);

export const auth = {
  // POST /auth/login   body: { email, password }
  login: (body: any) =>
    http("/auth/login", {
      method: "POST",
      body,
      mock: () => ({ connected: false }),
    }),
  // POST /auth/signup  body: { name, email, password, role, college }
  signup: (body: any) =>
    http("/auth/signup", {
      method: "POST",
      body,
      mock: () => ({ connected: false }),
    }),
};

export const courses = {
  // GET /courses
  list: () => http("/courses", { mock: () => db.courses }),
};

export const dashboard = {
  // GET /dashboard/student
  student: () =>
    http("/dashboard/student", {
      mock: () => ({
        user: db.users.student,
        openDoubts: db.doubts.slice(0, 3),
        suggestedLesson: db.lessons.find((l) => !l.completed) || db.lessons[0],
        topFlagged: hottest(db.topics.cs201)[0],
        points: db.points,
        streak: db.streak,
        latestPost: db.posts[0],
      }),
    }),
  // GET /dashboard/faculty
  faculty: () =>
    http("/dashboard/faculty", {
      mock: () => ({
        sections: db.sections,
        flagged: hottest(Object.values(db.topics).flat()).slice(0, 5),
        recentQuestions: db.doubts.map((d) => d.question),
      }),
    }),
};

export const tutor = {
  // POST /tutor/ask  body: { question }  returns { id, question, steps: [{ title, body }] }
  ask: (body: { question: string }) =>
    http<{ id: string; question: string; isDemo: boolean; steps: Array<{ title: string; body: string }> }>(
      "/tutor/ask",
      {
        method: "POST",
        body,
        mock: ({ question }: { question: string }) => {
          const answer = {
            id: nid("a"),
            question,
            isDemo: true,
            steps: [
              {
                title: "Restate the problem",
                body: `You asked: "${question}". Say it in your own words and note what the question is really asking.`,
              },
              {
                title: "List what you know",
                body: "Write down the facts, definitions and constraints that apply. Missing pieces show you what to look up next.",
              },
              {
                title: "Choose an approach",
                body: "Pick the simplest method that fits what you know. Try a small example before the general case.",
              },
              {
                title: "Work it through",
                body: "Carry the approach out one move at a time and write down each result.",
              },
              {
                title: "Check the result",
                body: "Test your answer against your small example. If they disagree, return to the step where they first differ.",
              },
            ],
          };
          db.doubts.unshift({ id: answer.id, question, createdAt: now(), status: "demo" });
          return answer;
        },
      }
    ),
  // POST /tutor/clarify  body: { answerId, stepIndex, stepTitle }  returns { text }
  clarify: (body: { answerId: string; stepIndex: number; stepTitle: string }) =>
    http<{ text: string }>("/tutor/clarify", {
      method: "POST",
      body,
      mock: ({ stepTitle }: { stepTitle: string }) => ({
        text: `Demo explanation for "${stepTitle}". Once the AI backend is connected, this will rephrase the step with a simpler example.`,
      }),
    }),
  // POST /tutor/chat  body: { message, conversation, sessionState }  returns SocraticChatResponse
  chat: (body: any) =>
    http<any>("/tutor/chat", {
      method: "POST",
      body,
    }),
  // GET /tutor/history
  history: () => http<typeof db.doubts>("/tutor/history", { mock: () => db.doubts }),
};

export const community = {
  // GET /community/posts
  list: () => http<MockPost[]>("/community/posts", { mock: () => db.posts }),
  // POST /community/posts  body: { body, tag, anonymous }
  create: (body: { body: string; tag: string; anonymous: boolean }) =>
    http<MockPost>("/community/posts", {
      method: "POST",
      body,
      mock: (b: { body: string; tag: string; anonymous: boolean }) => {
        const post: MockPost = {
          id: nid("p"),
          author: b.anonymous ? "Anonymous" : db.users.student.name,
          anonymous: b.anonymous,
          tag: b.tag,
          body: b.body,
          createdAt: now(),
          upvotes: 0,
          upvoted: false,
          replies: [],
        };
        db.posts.unshift(post);
        return post;
      },
    }),
  // POST /community/posts/:id/upvote
  upvote: (id: string) =>
    http<{ id: string; upvotes: number; upvoted: boolean }>(`/community/posts/${id}/upvote`, {
      method: "POST",
      mock: () => {
        const p = db.posts.find((x) => x.id === id);
        if (p) {
          p.upvoted = !p.upvoted;
          p.upvotes += p.upvoted ? 1 : -1;
          return { id, upvotes: p.upvotes, upvoted: p.upvoted };
        }
        return { id, upvotes: 0, upvoted: false };
      },
    }),
  // POST /community/posts/:id/replies  body: { body }
  reply: (id: string, text: string) =>
    http<{ id: string; author: string; body: string; createdAt: string }>(
      `/community/posts/${id}/replies`,
      {
        method: "POST",
        body: { body: text },
        mock: () => {
          const reply = {
            id: nid("r"),
            author: db.users.student.name,
            body: text,
            createdAt: now(),
          };
          const p = db.posts.find((x) => x.id === id);
          if (p) p.replies.push(reply);
          return reply;
        },
      }
    ),
};

export const projects = {
  // GET /projects
  list: () => http<MockProject[]>("/projects", { mock: () => db.projects }),
  // POST /projects  body: { title, summary, skills, teamSize }
  create: (body: { title: string; summary: string; skills: string[]; teamSize: number }) =>
    http<MockProject>("/projects", {
      method: "POST",
      body,
      mock: (b: any) => {
        const project: MockProject = {
          id: nid("pr"),
          ...b,
          members: 1,
          interested: false,
        };
        db.projects.unshift(project);
        return project;
      },
    }),
  // POST /projects/:id/interest
  interest: (id: string) =>
    http<{ id: string; interested: boolean }>(`/projects/${id}/interest`, {
      method: "POST",
      mock: () => {
        const p = db.projects.find((x) => x.id === id);
        if (p) p.interested = true;
        return { id, interested: true };
      },
    }),
};

export const confusion = {
  // GET /confusion/:courseId
  map: (courseId: string) =>
    http<MockTopic[]>(`/confusion/${courseId}`, { mock: () => db.topics[courseId] || [] }),
  // POST /confusion/:courseId/mark  body: { topicId }
  mark: (courseId: string, topicId: string) =>
    http<MockTopic>(`/confusion/${courseId}/mark`, {
      method: "POST",
      body: { topicId },
      mock: () => {
        const list = db.topics[courseId] || [];
        const t = list.find((x) => x.id === topicId);
        if (t) {
          t.heat = Math.min(100, t.heat + 8);
          return t;
        }
        return { id: topicId, name: topicId, heat: 50 };
      },
    }),
  // POST /confusion/:courseId/pulse
  pulse: (courseId: string) =>
    http<{ ok: boolean; sentAt: string }>(`/confusion/${courseId}/pulse`, {
      method: "POST",
      mock: () => {
        const b = db.badges.find((x) => x.id === "b6");
        if (b) b.earned = true;
        return { ok: true, sentAt: now() };
      },
    }),
};

export const concepts = {
  // GET /concepts/graph
  graph: () => http<typeof db.concepts>("/concepts/graph", { mock: () => db.concepts }),
};

export const lessons = {
  // GET /lessons
  list: () => http<typeof db.lessons>("/lessons", { mock: () => db.lessons }),
  // POST /lessons/:id/complete  returns { pointsAwarded, points }
  complete: (id: string) =>
    http<{ id: string; pointsAwarded: number; points: number }>(`/lessons/${id}/complete`, {
      method: "POST",
      mock: () => {
        const l = db.lessons.find((x) => x.id === id);
        if (!l) return { id, pointsAwarded: 0, points: db.points };
        const first = !l.completed;
        l.completed = true;
        if (first) {
          db.points += 10;
          const b = db.badges.find((x) => x.id === "b3");
          if (b) b.earned = true;
        }
        return { id, pointsAwarded: first ? 10 : 0, points: db.points };
      },
    }),
};

export const rewards = {
  // GET /rewards/summary
  summary: () =>
    http<{ points: number; streak: number; badges: typeof db.badges }>("/rewards/summary", {
      mock: () => ({ points: db.points, streak: db.streak, badges: db.badges }),
    }),
  // GET /rewards/leaderboard?scope=class|college&range=week|all
  leaderboard: (scope: "class" | "college", range: "week" | "all") =>
    http<Array<{ name: string; points: number; you: boolean; rank: number }>>(
      `/rewards/leaderboard?scope=${scope}&range=${range}`,
      {
        mock: () => {
          const list = db.leaderboard[scope][range] || [];
          const rows = list.map(([name, points]) => ({
            name,
            points,
            you: false,
          }));
          rows.push({
            name: "You",
            points: range === "week" ? Math.min(db.points, 130) : db.points,
            you: true,
          });
          return rows
            .sort((a, b) => b.points - a.points)
            .map((r, i) => ({ ...r, rank: i + 1 }));
        },
      }
    ),
};

export const notifications = {
  // GET /notifications
  list: (role: "student" | "faculty") =>
    http<typeof db.notifications>("/notifications", {
      mock: () => db.notifications.filter((n) => n.audience === role),
    }),
  // POST /notifications/:id/read
  markRead: (id: string) =>
    http<{ id: string }>(`/notifications/${id}/read`, {
      method: "POST",
      mock: () => {
        const n = db.notifications.find((x) => x.id === id);
        if (n) n.read = true;
        return { id };
      },
    }),
  // POST /notifications/read-all
  markAllRead: (role: "student" | "faculty") =>
    http<{ ok: boolean }>("/notifications/read-all", {
      method: "POST",
      mock: () => {
        db.notifications
          .filter((n) => n.audience === role)
          .forEach((n) => {
            n.read = true;
          });
        return { ok: true };
      },
    }),
};

export const profile = {
  // GET /profile
  get: (role: "student" | "faculty") =>
    http<typeof db.users.student>("/profile", { mock: () => db.users[role] }),
  // PUT /profile  body: { name, college, department, year, bio, anonymousByDefault, notifyEmail, notifyPulse }
  update: (role: "student" | "faculty", body: any) =>
    http<typeof db.users.student>("/profile", {
      method: "PUT",
      body,
      mock: (b: any) => {
        if (!b.name || !b.name.trim()) throw new Error("Name is required.");
        db.users[role] = { ...db.users[role], ...b };
        return db.users[role];
      },
    }),
  // POST /profile/deletion-request
  requestDeletion: () =>
    http<{ ok: boolean }>("/profile/deletion-request", {
      method: "POST",
      mock: () => ({ ok: true }),
    }),
};

export const outcomes = {
  // GET /outcomes/:courseId
  get: (courseId: string) =>
    http<typeof db.outcomes.cs201>(`/outcomes/${courseId}`, {
      mock: () => db.outcomes[courseId] || [],
    }),
};

export const curriculum = {
  // GET /curriculum/updates
  list: () =>
    http<MockCurriculumUpdate[]>("/curriculum/updates", {
      mock: () => db.updates,
    }),
  // POST /curriculum/updates  body: { title, course, section, effective, body }
  publish: (body: any) =>
    http<MockCurriculumUpdate>("/curriculum/updates", {
      method: "POST",
      body,
      mock: (b: any) => {
        const update: MockCurriculumUpdate = {
          id: nid("u"),
          ...b,
          publishedAt: now(),
        };
        db.updates.unshift(update);
        return update;
      },
    }),
};
