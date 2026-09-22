# CoMatch

**Find teammates. Build your next project together.**

CoMatch helps students, competition participants, and independent creators find
teammates for academic projects, hackathons, and shared ideas. It brings project
discovery, recruitment, applications, and direct messaging into one platform,
so users can connect around complementary skills and shared goals.

Developed for **Orbital 2026**.

- **Proposed Level of Achievement:** Project Gemini
- **Advisor:** Eugene Oh Yun Zheng


[Visit CoMatch](https://co-match-two.vercel.app/) ·
[GitHub Repository](https://github.com/naymin-gif/CoMatch)

## Why CoMatch?

Finding a team often means searching through busy group chats or outdated
spreadsheets. Recruitment posts become difficult to find, requirements are
unclear, and application decisions are scattered across private messages.

CoMatch gives that process a clear structure: discover a relevant community,
explore opportunities, review potential teammates, and manage applications in
one place. Users can create communities for their own initiatives as well as
existing courses and competitions.

## Core Features

| Feature | What it offers |
| --- | --- |
| **Authentication** | Email and password registration, Google and LinkedIn sign-in, and authenticated access to personal workspaces. |
| **Profiles** | A personal introduction, skills, preferred roles, portfolio links, profile and cover images, and a showcase of spaces and recruitment posts. |
| **Spaces** | Dedicated hubs for courses, competitions, and project categories, with recruitment feeds, member directories, and shared information. |
| **Recruitment posts** | Project descriptions, commitment expectations, available roles, applications, likes, and inline comments. |
| **Application dashboard** | Separate views for incoming requests and outgoing applications, approval and rejection controls, status tracking, and unread indicators. |
| **Direct messaging** | Real-time, one-to-one conversations with conversation history and unread message notifications. |

## How It Works

1. **Create an account and introduce yourself.** Add your skills, interests,
   preferred roles, and relevant portfolio links.
2. **Find a Space.** Explore a community for your course, competition, or project
   category, or create one for a new initiative.
3. **Discover or publish an opportunity.** Browse recruitment posts or describe
   your own project, its expected commitment, and the roles you need.
4. **Connect with potential teammates.** Review profiles, ask questions in
   comments, or start a private conversation.
5. **Apply and manage decisions.** Submit an introduction and select your desired
   roles. Use the dashboard to track your applications or review incoming requests.

### Recruitment Workflow

Applications begin as **Pending**. A post owner reviews the applicant's profile,
selected roles, and introduction, then confirms an **Approved** or **Rejected**
decision. Applicants can track the outcome from their dashboard.

To keep recruitment consistent:

- Users cannot apply to their own recruitment posts.
- Duplicate active applications to the same post are blocked.
- Approval and rejection require confirmation; confirmed decisions are locked.
- Spaces have unique names. Spaces cannot be deleted once created.
- Space owners can update their Space's name, cover image, description, and external resources.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Application | Next.js, React, TypeScript |
| UI | Tailwind CSS, shadcn/ui, React Icons |
| Authentication | Supabase Auth, Google OAuth, LinkedIn OAuth |
| Database | Supabase PostgreSQL |
| Media storage | Supabase Storage |
| Live messaging | Supabase Realtime |
| Deployment | Vercel |
| Package management | pnpm |
| Code quality | ESLint, Prettier |
| Unit and integration tests | Vitest, React Testing Library |
| End-to-end tests | Playwright |

## Architecture

CoMatch uses Next.js for its web interface, routing, and server-side application
logic. Supabase provides authentication, relational data storage, media storage,
and real-time message updates.

The application separates page composition and data flow from reusable UI
components. Feature components handle concerns such as profile editing,
application review, and chat, while shared components provide consistent buttons,
cards, badges, and navigation.

The core data model connects profiles, Spaces, Space memberships, recruitment
posts, and applications. Direct messages belong to conversations between pairs
of users. Profile images are stored in Supabase Storage, with their URLs recorded
in the database.

Authentication checks protect personal routes, while database row-level security
policies enforce data access permissions. Supabase's server-side rendering
integration synchronizes sessions across the browser and server.

## Testing and Quality Assurance

The project combines component tests, database integration checks, browser tests,
and exploratory testing. ESLint and Prettier support consistent code quality and
formatting.

| Test Layer | Key Focus Areas |
| --- | --- |
| Unit | Shared UI components, rendering, variants, and user interactions. |
| Integration | Space memberships, database constraints, conversations, messages, application states, and notification fields. |
| End-to-end | Authentication screens, protected routes, dashboard and chat access, and Space search interactions. |
| Exploratory | Messaging updates, profile uploads, responsive forms, and notification behavior across tabs. |

## Engineering Approach

- **Separation of concerns:** Keep routing, data access, and presentation focused
  on distinct responsibilities.
- **Single responsibility:** Separate feature logic into components that can be
  understood and maintained independently.
- **Reuse:** Share UI components and styling conventions across the application.
- **Focused scope:** Prioritize discovery, recruitment, application management,
  and communication before adding further features.

## Team

- **Win Htut Khaung Soe**
- **Nay Min Thar**
