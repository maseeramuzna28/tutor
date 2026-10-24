# TUTO — AI Academic Intelligence & Socratic Learning Platform

> **Live Production App**: **[https://tutor-nine-eta.vercel.app](https://tutor-nine-eta.vercel.app)**  
> **Target Branch**: [`tuto`](https://github.com/maseeramuzna28/tutor/tree/tuto)

TUTO is an AI-powered academic learning platform for college students and faculty. Students ask questions and receive first-principles, step-by-step derivations with Socratic voice guidance, while faculty receive real-time telemetry on student confusion hotspots before exams occur.

---

## 🌟 Key Features

### 1. Interactive Socratic Voice Companion
- **Step-by-Step Problem Solving**: Rather than reciting monolithic text, TUTO breaks problems down into intuitive derivation steps with synchronous card highlights.
- **Natural Voice Cadence & Pauses**: Uses empathetic Socratic teaching prompts and periodic comprehension check-ins (*"Does this substitution make intuitive sense so far?"*).
- **Interactive Response Chips**: *"Understood! Next Step"*, *"Explain Simpler"*, *"Give Everyday Analogy"*, *"Scribe to Notebook"*, and *"Speak Follow-Up"*.

### 2. Hands-Free Digital Notebook
- **Voice Pen**: Dictate your thoughts and formulas hands-free via web speech recognition.
- **Smooth Freehand Drawing & Highlighter**: SVG canvas with Royal Blue, Charcoal, Crimson, Emerald ink and translucent fluorescent highlighter.
- **Paper Styles**: Authentic College-Ruled Lined paper with red margin and Engineering Dot Grid.
- **Auto-Scribe**: 1-click pinning of derivations directly into your digital notebook.

### 3. Editorial & 3D Animated Frontend
- **3D Platform & Testimonial Wall**: Interactive mouse-driven 3D perspective wall with physics tilt.
- **Coordinate Canvas Grid**: Real-time cursor tracking radial glow background.
- **Architectural Display Typography**: Condensed high-impact headline styling powered by `Oswald` & `Syne`.
- **14-Page App Suite**: Smart Notebook, AI Tutor, Confusion Map, Dashboard, Projects, Curriculum Updates, and Faculty Telemetry.

### 4. High-Performance Multi-Tier Intelligence Engine
- **Tier 1 (Local)**: Fast-fail local Ollama daemon integration (`tuto-tutor`).
- **Tier 2 (Cloud)**: Google Gemini 3.5 Flash Lite generating dynamic KaTeX LaTeX formulas, root-cause diagnosis, and everyday analogies in under 5 seconds.
- **Tier 3 (Offline)**: Deterministic first-principles fallback with 10 specialized domain templates and autonomous PostgREST in-memory store.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/) + React 19
- **Styling**: Tailwind CSS + Custom Architectural CSS Tokens
- **AI Engine**: `@google/genai` (Gemini 3.5 Flash Lite)
- **Math Rendering**: KaTeX
- **Deployment**: [Vercel](https://vercel.com/) Global Edge Network

---

## 🚀 Local Development

1. **Clone the repository and checkout the `tuto` branch**:
   ```bash
   git clone https://github.com/maseeramuzna28/tutor.git -b tuto
   cd tutor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 📄 License

MIT © 2026 Tuto Team
