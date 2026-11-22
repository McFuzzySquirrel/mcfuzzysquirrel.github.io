---
title:  "The Story of Agent Forge: Building an AI Development Team from Scratch"
date:   2026-03-20 21:45:00 +0200
categories: [personal, update]
tags: [agent systems, frameworks, AI orchestration]
---

> *How a simple question, "What if AI could work like a real team?", became a framework that turns ideas into coordinated agent teams.*

Agent Forge started as a practical response to a recurring problem: one AI assistant can do many things, but complex projects still need specialist thinking, clear ownership, and coordinated execution.

This post shares how I designed a PRD-first, multi-agent workflow that turns an idea into a structured team of AI specialists with an orchestrator that keeps delivery moving in the right order.

<!--more-->


## The Spark

It started with a frustration anyone working with agentic AI knows.

You're sitting with GitHub Copilot, this incredibly powerful AI assistant, and you ask it to build something complex. A web application, maybe. Authentication, database layer, API endpoints, frontend components, testing, an awesome game. The AI dives in, and it's impressive… at least for a while. But then you notice the cracks. It forgets the authentication approach it chose when it moves to the API layer. It makes frontend decisions that conflict with the backend architecture it just created. It's like asking one person to be the architect, the plumber, the electrician, and the interior designer all at once. They *can* do all of those things, but not with the same depth and consistency as specialists who coordinate.

That frustration led to a question:

**"What if, instead of one AI doing everything, we had a *team* of AI specialists, each an expert in their domain, working together like a real development team?"**

The practical version: *Can we build this today with the tools we have?*

The answer is yes. Orchestrated multi-agent systems already exist, and people are building them in many different ways. This document is about the journey to get there, after exploring the options and expanding on them.



## Chapter 1: Start with the Problem

The first instinct was to jump straight into code: build some agents, wire them together, and see what happens. But experience whispers that this is how you build something that works for the demo and falls apart in the real world.

Instead, the process started with a deliberate step back, one I believe is a constant in a field that keeps changing. Before writing a single line of agent definition, three questions needed answers:

1. **What does a "team" actually mean in the context of AI agents?** A team means agents with clear roles, defined boundaries, and a way to coordinate. A frontend specialist shouldn't be writing database migrations. A QA engineer shouldn't be designing the API schema.

2. **How do real development teams organize?** They start with **requirements**. Someone figures out *what* to build (the product manager, the PRD). Someone decides *who* builds *what* (the tech lead, the team structure). And someone coordinates the work (the project manager, the execution plan). That's three distinct phases: requirements -> team -> execution.

3. **What already exists that we can build on?** Most systems like GitHub Copilot and Claude already support custom agents. I use GitHub Copilot's agents (Markdown files in `.github/agents/`) and skills (reusable process files in `.github/skills/`). The infrastructure was there. What was missing was the *system* for creating and coordinating them.

These three questions became the blueprint, a *way of thinking* about the problem rather than a technical specification.

### The Takeaway for Builders

> **Start with "what problem am I actually solving?" and "how do humans already solve this?" before you ask "what should I build?"** The best frameworks mirror real-world processes that already work. AI agent teams work because real development teams work. We just translated the pattern.



## Chapter 2: The PRD-First Epiphany

The first major design decision shaped everything that followed.

The initial temptation was to build agents that could figure out what to build on their own. Give them a vague description, let them decompose it, and watch them go. It sounds cool, and it is a terrible idea.

Why? Because **AI agents follow instructions faithfully**. If the instructions are vague, the output is vague. If the requirements are ambiguous, the agents will resolve that ambiguity in ways you can't predict, and different agents will resolve it differently. You end up with a frontend that expects data the API doesn't provide, tests that validate the wrong behavior, and an architecture that no one actually agreed on.

The solution was obvious: **start with a Product Requirements Document (PRD)**. That has been the starting point long before agentic AI became a thing. A PRD is a *single source of truth* that every agent can reference. When the API engineer needs to know what endpoints to build, they check the PRD. When the frontend specialist needs to know what data to display, they check the PRD. When the QA engineer needs to know what "correct" means, they check the PRD. No ambiguity. No conflicting interpretations.

Some people start this way and call it a **Specification (Spec)**, but many never do. They may have all the research, then get lost on how to structure it.

That led to a second realization: **the PRD itself could be built by an AI agent through a structured conversation with the human**, so you don't need one before you start.

This became the first skill, `forge-build-prd`. It runs as an AI-guided interview that asks you the right questions across ten categories (scope, functional requirements, technical constraints, security, accessibility, design, testing, delivery, risks, dependencies), synthesizes your answers, and produces a comprehensive PRD.

If you already have a PRD, point the skill at it. If you have research and notes, point it at those. You don't need to start from scratch if you have already done most of the work.

Building the first skill taught me a lesson:

> **Skills are processes, not templates.** A template says "fill in section 3." A process says "let me ask you about section 3, challenge your assumptions, research whether your tech choices are current, and *then* write section 3."

### The Takeaway for Builders

> **Give your AI agents a single source of truth before you let them do anything.** The quality of your agents' output is directly proportional to the quality of their input. A PRD prevents your agent team from building six different interpretations of the same project.



## Chapter 3: Designing the Team Builder

With the PRD skill working, the next challenge was translating a PRD into an agent team. That translation is the framework's core design problem.

The naive approach is to hand over a PRD and ask for "some agents." But *how many* agents? *Which* specializations? *Where* do you draw the boundaries between them?

The design process involved studying how real technical leads decompose projects:

- **Every project needs certain roles**: Someone to set up the project structure (architect), someone to test everything (QA). These are non-negotiable.
- **Every major technology gets a specialist**: If you're using Next.js and FastAPI, you want a Next.js expert and a FastAPI expert, not a "full-stack generalist" who's mediocre at both.
- **Every distinct feature domain gets an owner**: Authentication, payments, and notifications each deserve focused attention.
- **Cross-cutting concerns become specialists when they're substantial**: If security is a checkbox, the architect handles it. If security is a core requirement (healthcare, finance), it gets its own agent.

These heuristics were encoded into the `forge-build-agent-team` skill: a detailed process that the `forge-team-builder` agent follows. The skill creates agents and *validates* the team. Every PRD requirement must map to exactly one agent. No gaps (requirements no one owns). No overlaps (requirements two agents fight over).

The collaboration section in each agent's definition made coordination possible. Every agent explicitly declares:
- **Dependencies**: What it needs from other agents before it can work
- **Handoffs**: Where its work ends and another agent's begins
- **Coordination points**: What needs to be synchronized

This is the contract that makes multi-agent coordination work. When the project orchestrator needs to decide what order to call agents in, it reads these collaboration sections. The dependencies become the execution graph.

### The Takeaway for Builders

> **Design a team.** The value comes from how the agents coordinate. Explicit boundaries and collaboration contracts prevent the chaos that comes from multiple AI agents working in the same codebase without clear ownership.



## Chapter 4: The Orchestrator as Conductor

This part is critical: individual agents can do individual tasks. But who decides *what* to build *when*? Who makes sure the database schema exists before the API engineer tries to query it? Who verifies that Phase 1 is actually complete before Phase 2 begins?

Enter the `project-orchestrator`: the project manager of the agent team.

Building the orchestrator exposed the hard part of AI coordination: **making agents do work in the right order, with the right context, and knowing when to stop.**

The orchestrator's process is deceptively simple:

1. Read the PRD. Understand all the phases.
2. Read every agent file. Understand who can do what, and what they need from whom.
3. For each phase, identify the right sequence of agent calls.
4. Execute tasks, verify deliverables, handle dependencies.
5. Provide progress updates. Flag blockers. Move to the next phase.

But within that simplicity are subtle design choices:

- **The orchestrator never does implementation work itself.** It coordinates, delegates, and validates. The actual code, tests, and configuration come from specialist agents. This separation of concerns mirrors how the best project managers operate: they don't write code, they ensure the right people write the right code at the right time.

- **Verification before progression.** The orchestrator doesn't blindly move from Phase 1 to Phase 2. It checks that deliverables actually exist and meet acceptance criteria. This catches problems early, before they cascade.

- **Error handling is explicit.** When something goes wrong, the orchestrator stops and reports. That includes an agent that cannot complete a task, ambiguous requirements, or missing dependencies. It does not silently push through hoping things work out.

### The Takeaway for Builders

> **Coordination is the hardest problem in multi-agent systems.** A team of brilliant specialists without coordination produces chaos. Build the orchestration layer with at least as much care as the specialist agents.



## Chapter 5: The First Real-World Test (and What It Revealed)

The framework worked. You could describe an idea or give it your existing work, get a validated PRD, generate an agent team, and orchestrate a build. But using it on real projects revealed gaps that theory hadn't predicted.

### The Freshness Problem

The first surprise was dangerous. An agent generating a Next.js application used the Pages Router, **the standard approach during its training data cutoff**, even though the App Router had been recommended for months. Another agent installed a library version with known security vulnerabilities. The PRD said "use React" but didn't specify a version, so the agent used patterns from 2024.

The problem was systemic: **the framework had no mechanism for ensuring agents used current information.**

The instinct was to add "always search for the latest version of everything" to every agent. But that would be noisy, slow, and counterproductive: agents would spend half their time searching and second-guessing the PRD's deliberate choices.

Instead, I wrote a research document, `latest-information-strategy.md`, that analyzed:
- Where in the workflow does outdated information cause the most damage?
- What existing mitigations already help? (Human review, LLM knowledge, Copilot's web access)
- Where should we add targeted freshness checks?

The answer was four surgical additions:
1. **PRD Builder**: Verify tech stack currency during PRD creation (catch it at the source)
2. **Agent Template**: Every generated agent gets a constraint to verify current APIs when uncertain
3. **Orchestrator**: Check tech stack currency before starting Phase 1 (last chance before code is written)
4. **Team Builder**: Include freshness instructions in every agent it generates (systemic, not ad-hoc)

Four small changes across four files. No structural modifications. But they closed a gap that could have led to entire projects being built on deprecated foundations.

### The Takeaway for Builders


> **Use your own framework. The gaps you find in real use are the ones that matter most.** And when you find a gap, don't patch it everywhere: analyze where the fix has the highest impact with the lowest noise. Surgical fixes beat sledgehammer fixes every time.



## Chapter 6: What Happens After V1?

The second major revelation came from a simple question: *"Okay, the initial build is done. Now I want to add a feature. What do I do?"*

The framework had no good answer.

The existing workflow assumed a single PRD driving a single team generation driving a single build execution. It was a one-shot process. But real software development is iterative. You build V1, then you add notifications, then you add payment processing, then you refactor the authentication layer.

The naive solutions were all problematic:
- **Modify the original PRD and regenerate everything?** That overwrites all the customizations users made to their agents after generation. Unacceptable.
- **Just call individual agents directly?** That works for small changes but doesn't scale. How do you coordinate a cross-cutting feature like "real-time notifications" that touches the frontend, the API, and needs new WebSocket expertise?
- **Create a whole new PRD from scratch?** That ignores everything already built. The new PRD would have no awareness of existing agents, existing architecture, or completed phases.

The missing piece was a *workflow*. The solution required thinking through the entire lifecycle rather than adding a skill.

I wrote another research document, `feature-prd-strategy.md`, and this one was more complex. It identified six fundamental challenges:

1. **Preserving existing agent customizations**: Can't overwrite what users have refined
2. **Understanding completed state**: The feature needs to know what's already built
3. **Agent boundary evolution**: A new feature might cross existing agent boundaries
4. **Orchestrator continuity**: Feature phases are additive, not from-scratch
5. **PRD versioning**: Multiple PRDs need distinct IDs to avoid collisions
6. **Backward compatibility**: The existing workflow must remain untouched

The solution was three coordinated capabilities that mirrored the existing workflow:

```
Original workflow:  Idea -> PRD -> Agent Team -> Orchestrated Build

Feature workflow:   Feature Idea -> Feature PRD -> Team Update -> Feature Build
```

Each component was designed to be *context-aware*:

- The **Feature PRD Builder** (`forge-build-feature-prd`) reads the original PRD, scans existing agents, and examines the codebase before asking a single question. It knows what exists. Its output includes an "Agent Impact Assessment": a section that explicitly maps the feature's impact onto the existing team.

- The **Team Builder** gained an incremental mode. It auto-detects whether it's looking at a full PRD or a Feature PRD. In feature mode, it extends existing agents with new responsibilities, creates new agents only when needed, and leaves unaffected agents completely untouched. Changes are presented as diffs, not replacements.

- The **Orchestrator** gained a feature execution mode. It reads both the original PRD and the Feature PRD, understands which phases are already complete, and executes only the new F-prefixed feature phases. It never re-executes original phases.

The design choice that prevented collisions was **prefixed IDs** everywhere: `FT-US-01` for feature user stories, `FT-FR-01` for feature requirements, `Phase F1` for feature phases. This simple convention prevents the collision that would happen when Feature PRD requirement `FR-01` conflicts with the original PRD's `FR-01`.

### The Takeaway for Builders

> **Design for iteration from day one, but implement it when you actually need it.** The original framework didn't support features, and that was fine for V1. But when the need arose, the research-first approach meant the solution was additive, not a rewrite. If you build your original architecture with clear boundaries and single sources of truth, adding iteration support later becomes an extension, not a surgery.



## Chapter 7: The Research-Driven Approach

One pattern defined the development of Agent Forge: **research before implementation**.

Every significant capability was preceded by a research document that followed the same structure:

1. **The Question**: What are we trying to solve? State it clearly.
2. **Current State Analysis**: What exists today? What's the gap? Be specific: reference actual file paths and line numbers.
3. **Risk Assessment**: What happens if we don't solve this? What are the failure modes?
4. **Proposed Solution**: How do we solve it? Multiple options considered, one recommended.
5. **Implementation Plan**: What specific files change? What's the effort? Is it backward compatible?
6. **Open Questions**: What haven't we figured out yet? What can we defer?
7. **Summary Table**: A clean summary a busy person can scan in 30 seconds.

It served three practical purposes:

**First, it prevented over-engineering.** When you write down the risk assessment and implementation plan, you quickly see whether a change is proportionate to the problem. The freshness strategy could have been a massive "agent verification framework". The research document showed that four small additions across four files would solve 80% of the problem.

**Second, it created a decision trail.** Six months from now, when someone asks "why does the team builder have two modes?", the answer is a documented analysis with specific reasoning, tradeoff discussions, and rejected alternatives, not "because someone thought it was a good idea."

**Third, it forced clarity before complexity.** Writing "the orchestrator needs to understand this is additive work, not a from-scratch build" in a research document is how you discover that you need separate phase prefixes instead of a flag. The writing process surfaces edge cases that coding doesn't.

### The Takeaway for Builders

> **Write the research document before you write the code.** Even if "research document" is just a page of notes in a markdown file. The act of writing down *what exists*, *what's missing*, *what could go wrong*, and *what specifically changes* will save you from building the wrong thing. It is faster, because you don't have to undo mistakes.



## Chapter 8: Building Tools That Build Tools

Agent Forge is a framework that uses AI to create AI teams that build software. That recursion is the whole point.

- The PRD Builder skill conducts an intelligent interview, challenges assumptions, and researches technology currency. 
- The Team Builder analyzes the specific requirements, identifies the right specialization boundaries, and validates coverage. 
- The Orchestrator reads the dependency graph and adapts the order.

At every layer, the principle is the same: **give the AI enough structure to be effective, but enough freedom to adapt to the specific situation.**

This balance between structure and freedom is the hardest thing to get right. Too much structure and your framework only works for one type of project. Too little and agents go off in unpredictable directions.

The sweet spot, as discovered through building Agent Forge, is:
- **Structure the *process*, not the *output*.** Tell agents *how* to think about a problem (analyze requirements -> identify roles -> validate coverage), not *what* to produce (always create exactly 6 agents with these exact names).
- **Make the PRD the single source of truth.** Everything else is derived from it. If agents disagree, the PRD wins.
- **Use validation as a safety net.** The team builder validates that every requirement has an owner. The orchestrator validates that deliverables exist before moving forward. These checks catch the cases where freedom leads to gaps.



## Chapter 9: Your Turn to Build a Framework

This story is about Agent Forge and about a *process* for building any framework that coordinates AI agents, or any complex system where multiple components need to work together.

The process, distilled:

### Step 1: Identify the Real Problem
Start with the frustration, not the technology. What are you actually trying to make better? For Agent Forge, it was: "One AI can't be an expert in everything simultaneously." Your problem will be different, but the approach is the same: name the pain clearly.

### Step 2: Study How Humans Solve It
Before you design an AI system, understand the human system it mirrors. Agent Forge works because real development teams work: specialists with clear roles, coordinated by a project manager, working from shared requirements. Whatever your domain, there's a human process that already works. Find it. Understand it. Translate it.

### Step 3: Build the Foundation First (PRD-Equivalent)
Every multi-agent system needs a single source of truth. For software, that's a PRD. For a content pipeline, it might be an editorial brief. For a data processing system, it might be a data specification. Whatever your domain, build the "single source of truth creation" tool first. Everything else depends on it.

### Step 4: Design Agents as a Team
It's tempting to build one amazing agent, then another, then another. Resist that and design the *team*: the boundaries, the handoff points, the collaboration contracts. An individual agent's value comes from its place in the team, not its standalone capabilities.

### Step 5: Build Orchestration as a First-Class Concern
Don't bolt coordination on later. Design your orchestration layer alongside your agents. The orchestrator needs to understand agent capabilities, dependencies, and validation criteria. It is the glue that makes the team function.

### Step 6: Use It, Break It, Fix It (With Research)
Ship the first version. Use it on a real project. Document the gaps you find: not as bugs to patch, but as research questions to answer. "How do we ensure agents use current information?" is a better starting point than "add a version check to every agent." The research-first approach leads to proportionate, surgical fixes instead of bloated workarounds.

### Step 7: Design for Iteration
Your V1 will handle the greenfield case. Eventually, you'll need to handle the "what now?" case: new features, changed requirements, evolved capabilities. When that happens, follow the same research-first approach: understand the existing state, identify the specific challenges, and design an additive solution that doesn't break what's working.

### Step 8: Document the Journey
You're reading this document because someone decided the *process* was as valuable as the *product*. Every research document, every design decision, every rejected alternative is knowledge that lets other people build on your work, learn from your mistakes, and create their own versions of what you've built.



## Epilogue: What We Actually Built

Here is the whole picture.

**McFuzzy Agent Forge** is a template repository that takes an idea and turns it into a coordinated team of AI specialists:

```
 ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
 │  Your Idea   │ ──→ │  PRD Builder  │ ──→ │   Team Builder    │ ──→ │   Orchestrator   │
 │              │     │  (Interview)  │     │ (Specialist Team) │     │  (Coordination)  │
 └─────────────┘     └──────────────┘     └──────────────────┘     └─────────────────┘
                            │                      │                        │
                      Comprehensive PRD      Agent Files +           Phased Execution
                      (Single Source          Skill Files             with Validation
                       of Truth)             (Clear Ownership)       and Handoffs
```

And when V1 is done:

```
 ┌─────────────────┐     ┌────────────────────┐     ┌───────────────┐     ┌─────────────────┐
 │  Feature Idea    │ ──→ │  Feature PRD Builder │ ──→ │ Team Updater   │ ──→ │   Orchestrator   │
 │  (on existing    │     │  (Context-Aware)     │     │ (Incremental)  │     │  (Feature Mode)  │
 │   project)       │     └────────────────────┘     └───────────────┘     └─────────────────┘
 └─────────────────┘            │                          │                        │
                          Feature PRD               Only Changed/New          Feature Phases
                          (Impact Assessment,       Agent Files              (F-prefixed,
                           Prefixed IDs)            (Diff-based)             Context-aware)
```

The components:

| Component | What It Does | Why It Exists |
|-----------|-------------|---------------|
| `forge-build-prd` skill | Creates PRDs through AI-guided interviews | A team needs a single source of truth |
| `forge-build-feature-prd` skill | Creates feature PRDs aware of existing projects | V1 is not the end. Iteration needs structure too |
| `forge-build-agent-team` skill | Transforms PRDs into agent team definitions | Manual agent creation doesn't scale or validate |
| `forge-team-builder` agent | Executes the team-building process | An agent follows the skill's process to design teams |
| `project-orchestrator` agent | Coordinates agents through implementation phases | Specialists without coordination produce chaos |
| Bootstrap scripts | Deploy templates to any repository | The framework should be easy to adopt |

Each component was built in response to a real need, validated through real use, and refined through documented research. Nothing was added "just in case." Everything earns its place.



## The Principles That Guided Everything

1. **Start with the problem, not the technology.** The best frameworks solve real frustrations, not imagined ones.

2. **Mirror human processes.** If real teams work with PRDs, specialists, and project managers, your AI teams should too.

3. **Single source of truth, always.** Every agent, every decision, every validation should trace back to one authoritative document.

4. **Research before implementation.** Write down what exists, what's missing, what could go wrong, and what specifically changes. Then build.

5. **Additive, not destructive.** New capabilities should extend the framework, not rewrite it. If your new feature requires rewriting existing code, your architecture needs rethinking.

6. **Validate at every layer.** The PRD builder validates tech currency. The team builder validates coverage. The orchestrator validates deliverables. Trust, but verify.

7. **Design for iteration.** V1 is never the end. Build your foundations so that V2 is an extension, not a replacement.

8. **Document why each decision was made.** Code tells you what was built. Research documents tell you *why*, and that is what lets other people build their own versions.

The repo is here: https://github.com/McFuzzySquirrel/mcfuzzy-agent-forge



*This is the story of how Agent Forge came to be, and a playbook you can adapt. The patterns work whether you're building AI agent teams, data pipelines, content systems, or anything else where specialized components need to work together toward a shared goal.*



**Made with ❤️ and a lot of research documents by [McFuzzySquirrel](https://github.com/McFuzzySquirrel)**