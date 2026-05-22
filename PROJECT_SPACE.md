# PROJECT SPACE
## Lightweight Collaborative Workspace for Student Teams & Small Projects

---

# 1. OVERVIEW

Project Space is a lightweight collaborative workspace designed for:
- student teams
- indie developers
- freelancers
- small project groups

The product focuses on:
- simplicity
- clarity
- fast collaboration
- low-friction teamwork

Unlike enterprise tools, Project Space should feel:
- lightweight
- modern
- easy to understand
- enjoyable to use

---

# 2. CORE PROBLEM

Small teams currently work across:
- Messenger/Zalo/Discord
- Google Docs
- Trello
- Notion
- Drive
- GitHub

This creates:
- fragmented information
- lost context
- unclear responsibilities
- scattered files
- communication chaos

Most existing tools are:
- too corporate
- too complex
- overloaded with features

---

# 3. PRODUCT GOAL

Create ONE focused space where a team can:
- organize tasks
- store notes
- manage resources
- track progress
- collaborate smoothly

WITHOUT:
- overwhelming setup
- enterprise complexity
- bloated interfaces

---

# 4. TARGET USERS

Primary Users:
- university students
- capstone project teams
- small startup teams
- freelance collaborators

Behavior:
- work in small groups
- communicate frequently
- need organization
- dislike complicated software

---

# 5. CORE FEATURES

## A. Project Workspace

Each project has:
- title
- description
- members
- tasks
- resources
- notes

---

## B. Task Board

Features:
- create tasks
- drag & drop
- assign members
- due dates
- priorities
- progress tracking

Task statuses:
- Todo
- In Progress
- Review
- Done

---

## C. Notes System

Quick collaborative notes:
- meeting notes
- brainstorming
- documentation
- reminders

---

## D. Resource Hub

Store:
- GitHub links
- Figma links
- Drive links
- documents
- images
- references

---

## E. Activity Feed

Track:
- task updates
- member actions
- note creation
- project changes

Should feel:
- informative
- calm
- non-spammy

---

# 6. UX PHILOSOPHY

The product should:
- reduce friction
- reduce confusion
- minimize clicks
- feel fast

The interface should:
- prioritize whitespace
- avoid clutter
- feel responsive
- feel modern

Avoid:
- complex dashboards
- too many analytics
- enterprise-style UI

---

# 7. DESIGN STYLE

Visual direction:
- clean
- minimal
- smooth
- modern

Inspired by:
- Linear
- Notion Calendar
- Vercel dashboard
- modern startup SaaS

---

# 8. USER FLOW

## Create Project

User:
1. Creates workspace
2. Invites members
3. Adds tasks/resources
4. Starts collaborating

---

## Daily Workflow

User:
1. Opens project
2. Sees active tasks
3. Checks updates
4. Continues work
5. Adds notes/resources

---

# 9. CORE DIFFERENTIATION

Project Space is NOT:
- an enterprise management tool
- a heavy productivity suite
- a complicated workspace system

Project Space IS:
- lightweight
- focused
- student-friendly
- collaboration-first

---

# 10. TECH STACK

Frontend:
- Next.js
- React
- TailwindCSS
- Framer Motion

Backend:
- NestJS or Next.js API

Database:
- PostgreSQL
- Prisma ORM

Realtime:
- Supabase Realtime
- Socket.io

Deployment:
- Vercel
- Railway
- Supabase

---

# 11. DATABASE ENTITIES

## User
- id
- name
- email
- avatar

## Project
- id
- title
- description
- ownerId

## ProjectMember
- id
- projectId
- userId
- role

## Task
- id
- projectId
- title
- description
- status
- priority
- assignedTo
- dueDate

## Note
- id
- projectId
- authorId
- content

## Resource
- id
- projectId
- title
- url
- type

## Activity
- id
- projectId
- userId
- action

---

# 12. MVP SCOPE

MVP MUST include:
- authentication
- project creation
- member invitation
- task board
- notes
- resource links

MVP SHOULD NOT include:
- AI features
- advanced analytics
- automation systems
- excessive customization

---

# 13. FUTURE FEATURES

Possible future additions:
- AI meeting summary
- smart search
- quick recap
- focus mode
- realtime collaborative editing

ONLY after:
- MVP is stable
- users actively return

---

# 14. SUCCESS METRICS

Key metrics:
- daily active users
- project creation rate
- returning teams
- completed tasks
- collaboration frequency

Important signals:
- teams continue using after project starts
- users replace scattered workflows
- users invite teammates naturally

---

# 15. PRODUCT PHILOSOPHY

The product should feel like:
- a shared workspace
- a focused collaboration environment
- a calm project hub

NOT:
- stressful
- bloated
- overly professional

The product succeeds when users think:

"Everything for our project is finally in one place."