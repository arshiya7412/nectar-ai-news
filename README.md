# NECTAR AI News 📰🤖

> AI-native personalized news platform with vernacular support, story tracking, and fake news detection.

NECTAR AI is a next-generation news consumption platform designed to combat information overload and misinformation. By leveraging advanced AI (Google Gemini), it provides personalized news briefings, tracks evolving stories over time, detects fake news, and even generates AI-driven video content.

## ✨ Features

*   **🏠 Personalized Home Feed:** A dynamic news feed tailored to your interests, complete with a classic newspaper aesthetic and a live breaking news ticker.
*   **🎙️ AI Briefings:** Get concise, AI-generated summaries of complex news articles to understand the core story in seconds.
*   **🕵️ Fake News Detector:** Built-in tools to analyze articles and claims, helping you verify the authenticity of the news you consume.
*   **📈 Story Tracker:** Follow the timeline of developing stories to see how events unfold over time.
*   **🎬 AI Video Generator:** Transform news stories or reference images into engaging, short-form video content (Reels).
*   **👤 User Profiles & Onboarding:** Customized onboarding flow to select your preferred news categories and vernacular settings.
*   **📱 Responsive Design:** A beautiful, editorial-style UI built with Tailwind CSS and Framer Motion that works seamlessly across desktop and mobile devices.

## 🛠️ Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (v4), Framer Motion (Animations), Lucide React (Icons)
*   **Routing:** React Router DOM
*   **AI Integration:** Google GenAI SDK (`@google/genai`)
*   **Data Parsing:** RSS Parser

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or pnpm
*   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/nectar-ai-news.git
    cd nectar-ai-news
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  **Open the app:**
    Navigate to `http://localhost:3000` in your browser.

## 📂 Project Structure

```text
src/
├── components/         # Reusable UI components and page views
│   ├── AIBriefing.tsx  # AI summary generation view
│   ├── FakeNewsDetector.tsx
│   ├── Home.tsx        # Main news feed
│   ├── Login.tsx
│   ├── Onboarding.tsx  # User preference setup
│   ├── Profile.tsx
│   ├── StoryTracker.tsx
│   └── VideoFeed.tsx   # AI Video Generator
├── lib/                # Utility functions
├── types/              # TypeScript interfaces and types
├── App.tsx             # Main application routing and layout
├── index.css           # Global styles and Tailwind configuration
└── main.tsx            # Application entry point
```

## 🎨 Design Philosophy

NECTAR AI uses an "Editorial / Newspaper" design recipe. It combines the trustworthiness of traditional print media (serif fonts, column layouts, distinct dividers) with modern, interactive web elements (glassmorphism, smooth animations, collapsible sidebars) to create a reading experience that is both nostalgic and futuristic.

## 👨‍💻 Author

Created by **arshi**

---

*Built with ❤️ and AI.*
