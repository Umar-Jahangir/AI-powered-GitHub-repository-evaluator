# GitGrade – AI-Powered GitHub Repository Evaluator

Demo:- https://v0-git-hub-repository-analyzer.vercel.app/

## 🚀 Overview

**GitGrade** is an AI-powered web application built for the **GitGrade Hackathon (Theme: AI + Code Analysis + Developer Profiling)**.
It analyzes a **public GitHub repository** and converts it into a **Score, Summary, and Personalized Improvement Roadmap**, acting like an AI coding mentor for students and early developers.

A GitHub repository is a developer’s real portfolio, but many students don’t know how clean, complete, or recruiter-ready their code actually is. GitGrade solves this by providing **honest, data-driven feedback** and **actionable guidance**.

---

## 🎯 Problem Statement

Design an intelligent system that:

* Accepts a **GitHub repository URL** as input
* Automatically fetches repository data
* Evaluates the repository on multiple dimensions
* Generates:

  * **Score / Rating**
  * **Written Summary**
  * **Personalized Roadmap**

This project follows the **official problem statement provided in the hackathon PDF**.

---

## ✨ Key Features

### Light/dark Theme

### PDF report export

### Commit activity graphs

### 🔗 Repository Analysis

* Public GitHub repository URL input
* GitHub API–based data fetching
* Secure API token usage (environment variables)

### 📊 Evaluation Metrics

* Code quality & readability
* Folder structure & organization
* README & documentation quality
* Commit history & consistency
* Language & tech stack usage
* Test coverage detection
* Version control best practices
* Real-world applicability

### 🧠 Intelligent Outputs

1. **Score / Rating**

   * Numeric score (0–100)
   * Skill level badge (Beginner / Intermediate / Advanced)

2. **Written Summary**

   * Short, honest evaluation of repository quality

3. **Personalized Roadmap**

   * Clear, actionable steps to improve the project
   * Acts like guidance from an AI coding mentor

---

## 🖥️ Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Backend

* Node.js
* Express / Next.js API routes

### APIs & Tools

* GitHub REST API
* Environment-based API authentication

---

## 🧩 System Architecture

1. **User inputs GitHub repository URL**
2. **Backend validates and fetches repo data** using GitHub API
3. **Evaluation engine** analyzes repository across multiple dimensions
4. **Scoring logic** assigns weighted scores
5. **Summary & roadmap generator** produces readable feedback
6. **Frontend dashboard** displays results

---

### Usage

1. Enter a public GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. Click **Analyze Repository**
3. View your repository's score, summary, and improvement roadmap

---

## 📈 Sample Output

**Input:**
[https://github.com/example-user/todo-app](https://github.com/example-user/todo-app)

**Output:**

* **Score:** 78 / 100 (Intermediate)
* **Summary:** Clean code structure with consistent commits, but lacks testing and detailed documentation.
* **Roadmap:**

  * Add unit tests
  * Improve README with setup instructions
  * Introduce CI/CD using GitHub Actions

---

## 🔐 GitHub API Usage

* Uses **GitHub Personal Access Token (PAT)**
* Public repositories only
* Free GitHub API tier (no payment required)
* Token stored securely using environment variables

---

## 🛠️ Setup & Installation

## 🚀 Getting Started

### Prerequisites

* Node.js 18+ installed
* npm or yarn package manager
* (Optional) GitHub Personal Access Token for higher API rate limits

### Installation

1️⃣ **Clone the repository**

```bash
bash
git clone https://github.com/your-username/gitgrade.git
cd gitgrade
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

### 4️⃣ Run the Application

```bash
npm run dev
```

2️⃣ **Install dependencies**

```bash
npm install
```

3️⃣ **(Optional) Set up environment variables**

Create a `.env.local` file in the root directory:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

**To generate a GitHub token:**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Select the `public_repo` scope
4. Copy the generated token

4️⃣ **Run the development server**

```bash
npm run dev
```

5️⃣ **Open the app**

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Future Enhancements

* Tech stack visualizations
* CI/CD readiness scoring
* Resume-ready developer profile

---

---

## 📄 License

This project is for **educational and hackathon purposes only**.
