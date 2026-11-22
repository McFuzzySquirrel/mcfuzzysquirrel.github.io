---
title:  "The AI-Assisted Research Habit: From Questions to Informed Decisions"
date:   2026-03-26 05:55:00 +0200
categories: [personal, workflow]
---

> *How pairing AI for research with AI for implementation creates a workflow where every decision is informed, documented, and traceable.*

Better decisions, faster builds: I use AI to research first and code with context, then document every key choice in ADRs so future changes are traceable, faster, and smarter.

<!--more-->


## The Evolution of a Habit

Everyone has their own way of researching before making decisions, and this is no different when it comes to building solutions with code. Some dive into documentation. Some experiment in branches. Some just start coding and see what breaks. But there's always this nagging feeling: *Am I missing something? Is there a better way I don't know about?*

<img
   src="/assets/images/2026-03-26-ai-assisted-research/research.jpeg"
   alt="Research diagram"
   style="max-width: 420px; width: 100%; height: auto; display: block; margin: 1rem auto;"
/>

I have these all the time, sometimes while I am busy, more often just after or before. That uncertainty led me to develop a habit that had transformed how I approach any significant technical or design decision: **AI-assisted research paired with AI-assisted implementation, all tied together through Architecture Decision Records (ADRs).**

This is a *process* that works for me regardless of the tool or project, and maybe something you could use too. The pattern is what matters.

## The Three-Phase Dance: Research, Build, Record

I have been doing this for a while, and I change it a little every time (I even do it on the train). Here is the workflow that has emerged from months of iteration:

### Phase 1: Research with AI Assistance

When a question arises, such as *"Should I use this library?"*, *"How do I handle this edge case?"*, or *"What's the best approach for this problem?"*, I start a research conversation with an AI assistant instead of jumping into forums or code.

This is a structured exploration, not a single prompt asking "what should I do?":

**1. Frame the Question Clearly**
   - What exactly am I trying to solve?
   - What constraints do I have? (technical, time, team skills)
   - What's the current state of things?

**2. Let AI Help Explore the Landscape**
   - What approaches exist?
   - What are the trade-offs of each?
   - What are the risks I might not have considered?
   - What's the current best practice (not what was best practice three years ago)?

**3. Challenge and Refine**
   - "What if we have to scale this?"
   - "What breaks if X changes?"
   - "What are we assuming that might not be true?"

The AI helps me *ask better questions*. It surfaces considerations I may not have looked for with my eternal optimism.

**The output**: a **research document**, a structured analysis that includes:
- The question and context
- Current state analysis
- Options explored with pros and cons
- Risk assessment
- Recommended approach with rationale
- Implementation considerations

This is the document that becomes a snapshot of understanding. Future-me, or your teammates and collaborators, can see what was decided and why, based on the information available.

### Phase 2: Implementation with AI Coding Sessions

With the research document as a foundation, I start a coding session with an AI assistant, **but not blindly**.

**The Coding Session Workflow:**

**1. Start with Context**
   - Share the research document
   - Point to relevant parts of the codebase
   - Clarify the specific task

**2. Let AI Do Its Research**
   - The AI assistant explores the codebase
   - It looks outside for inspiration
   - It identifies what files need changes
   - It spots dependencies and impacts
   - It considers edge cases based on the research

**3. Review the Plan**
   - AI proposes changes across multiple files
   - Shows how pieces fit together
   - Highlights potential issues
   - Explains the reasoning

**4. Iterate and Refine**
   - I, my team and even the agent review each proposed change
   - We question assumptions
   - We adjust approaches
   - We add missing considerations

**5. Implement with Understanding**
   - Changes are made with full context
   - No mysterious *"why did we do it this way?"* moments
   - Every decision traceable back to research

**The advantage**: the coding assistant has access to:
- Your research findings
- Its own exploration of the codebase and outside insights
- Understanding of how changes interconnect
- Awareness of testing implications

The work is more than writing code. The assistant presents a solution you understand, can review, and can approve with confidence.

### Phase 3: Codify in Architecture Decision Records

Once the research is done and the implementation is approved, the decision gets recorded in an ADR (I really love these).

**The ADR captures:**
- What was decided
- Why (linking back to the research)
- Alternatives considered
- Consequences expected
- Status (proposed, accepted, superseded)

**The useful part**: the ADR links to:
- The original research document
- Related code changes (PRs, commits)
- Other ADRs it affects or is affected by
- External references that informed the decision

This creates a **knowledge graph** of the project's evolution. I no longer dig through message threads, closed PRs, or code comments to reconstruct a decision. The knowledge is structured, searchable, and connected.



## What Changed

### 1. **Decisions Start from Evidence**

*This is a big one for me.* I struggle with it daily. Now I implement from researched, analyzed, documented understanding instead of "I think this is right."

### 2. **Context Persists Beyond Memory**

Six months later, when someone asks "why did I choose this approach?", I don't rely on memory. **I point to the ADR, which points to the research, which shows the full reasoning**.

### 3. **Onboarding Becomes Learning**

New collaborators and team members see the *thinking* behind the code. ADRs become a roadmap of how the project evolved and why.

### 4. **Course Corrections Are Data-Driven**

When an ADR decision needs revisiting, you start with the original research. What's changed? What new information do we have? The ADR gets superseded with a new one, preserving history.

### 5. **AI Assists, Humans Decide**

The AI tools help me explore, understand, and implement, but I am always in control. I review, I edit, I approve. The AI amplifies my capability; it doesn't replace my judgment.


## The Pattern, Agnostic to Tools

This workflow works regardless of my stack:

- **Research AI**: Could be ChatGPT, Claude, GitHub Copilot Chat, or any conversational AI that helps me explore and analyze.

- **Coding AI**: Could be GitHub Copilot, Cursor, Cody, or any AI coding assistant that understands codebases and can propose changes.

- **ADRs**: Just markdown files in a `/docs/adr/` directory (or wherever your team keeps them). Tools exist, but plain markdown works perfectly.

**The Universal Steps:**

```
Question arises
    ↓
Research with AI (document findings)
    ↓
Code with AI (implement with full context)
    ↓
Review & approve changes
    ↓
Create/update ADR (link everything together)
    ↓
Knowledge graph grows
```


## Real-World Example: Adding a New Feature

Let's make this concrete with a generic example:

**Scenario**: Your project needs caching to improve performance.

### Step 1: Research Session

*Conversation with AI:*
- "We need to add caching. What are the common approaches?"
- "We're using [your stack]. What works best here?"
- "What about cache invalidation strategies?"
- "What's new out there we should be looking at?"
- "What are the performance implications?"
- "What breaks if cache goes down?"
- "Consider the implications and risks, and document them"

*Output*: `docs/research/caching-strategy.md`
- Explores Redis, Memcached, in-memory options
- Analyzes trade-offs for your specific use case
- Recommends Redis with specific rationale
- Details implementation considerations
- Identifies risks and mitigation strategies

### Step 2: Coding Session

*Engagement with coding AI:*
- Share the research document
- "Implement Redis caching based on this research"

*AI Explores*:
- Reviews codebase structure
- Identifies where caching should be added
- Finds dependency injection points
- Considers error handling
- Plans configuration management

*AI Proposes*:
- Cache service implementation
- Integration with existing services
- Configuration files
- Error handling middleware
- Tests for cache hit/miss scenarios

*You Review*:
- Check each proposed change
- Adjust cache TTL values
- Add project-specific error handling
- Approve implementation

### Step 3: ADR Creation

Create `docs/adr/NNN-redis-caching.md`:

```markdown
# ADR-NNN: Implement Redis for Application Caching

**Date**: 2026-03-26
**Status**: Accepted

## Context

Performance testing revealed response times >500ms for data-heavy endpoints.
Research (see [caching-strategy.md](../research/caching-strategy.md)) 
explored multiple caching solutions.

## Decision

Implement Redis as application-level cache with:
- Cache-aside pattern
- 1-hour default TTL
- Separate cache keys per tenant
- Graceful degradation on cache failure

## Alternatives Considered

- Memcached: Lighter weight, but lacks persistence we may need later
- In-memory: Simple, but doesn't scale across instances
- CDN caching: Addresses different layer; complementary, not alternative

## Consequences

**Positive**:
- Expected 80% reduction in database load for cached queries
- Improved response times for frequently accessed data
- Foundation for future optimizations (session storage, job queues)

**Negative**:
- Additional infrastructure dependency
- Complexity in cache invalidation
- Memory usage requires monitoring

**Neutral**:
- Team needs Redis knowledge (addressed via documentation)

## References

- [Research Document](../research/caching-strategy.md)
- [Implementation PR](#123)
- [Redis Official Docs](https://redis.io/docs/)
```

Now everything is connected. The ADR links to the research. Future PRs reference the ADR. Knowledge accumulates instead of scattering.


## The Habit's Impact

After adopting this workflow, several things changed:

### Confidence in Decisions

Every significant change starts from a position of knowledge, not guesswork. The research phase ensures I have considered what I need to consider.

### Implementation Speed

Ironically, adding a research step *speeds up* implementation. I don't spend time coding, discovering issues, refactoring, and discovering more issues. I understand the landscape before I start building with my agent (let's not pretend I don't use one).

### Code Review Quality

When you open a PR with "Implements caching per ADR-025," reviewers can:
1. Read the ADR to understand the decision
2. Check the research to see alternatives considered
3. Review the code with full context

Reviews focus on execution instead of re-litigating the approach from scratch.

### Team Alignment

Everyone on the team can see the project's decision history. Discussions reference ADRs. New patterns emerge from synthesizing multiple ADRs. The team builds shared understanding.

### Future-Proofing

When you inevitably need to change something, you start with:
- The original ADR explaining why it was built that way
- The research that informed the decision
- Understanding of what constraints have changed

You won't reverse-engineer old code. You revisit documented decisions with new information.


## Starting Your Own Habit

You don't need special tools to adopt this workflow. Here is how I start. You will find this structure in all my repos, including the old ones I am revising.

### 1. Create Structure

```
docs/
  research/        # Research documents
  adr/             # Architecture Decision Records
```

### 2. Pick a Research Template

Keep it simple:
- **Question**: What are we trying to figure out?
- **Context**: Current state, constraints
- **Analysis**: Options, trade-offs, risks
- **Recommendation**: What to do and why
- **Implementation Notes**: How to approach it

### 3. Pick an ADR Template

Michael Nygard's format works great ([check it out here](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)):
- Title (numbered: ADR-001, ADR-002, etc.)
- Status (Proposed, Accepted, Superseded)
- Context
- Decision
- Consequences


### 4. Establish the Flow

For any significant decision:
1. Research -> document
2. Code (referencing research) -> review
3. ADR (linking research + code) -> commit

### 5. Link Everything

- Research docs reference relevant ADRs.
- ADRs reference research docs and PRs.
- Code comments reference ADRs for "why."
- PRs reference ADRs in descriptions.


## The Lesson I Learned

This habit is not really about AI (although it is used), research, or ADRs. It is about:

**Making the implicit explicit.**

We carry so much in our heads: why we chose this library, this design, what we considered and rejected, what could break if we change X. 
- This workflow externalizes that knowledge, making it visible, reviewable, and persistent.

AI tools help here:
- Helping surface what you might not think to research
- Exploring codebases faster than manual review
- Proposing solutions across multiple files
- Maintaining consistency across changes

But the core principle works even without AI: **research before you build, document decisions, connect the dots**.


## Your Turn

This workflow evolved from frustration with "I think this is right" and the sinking feeling of revisiting old code and solutions with no idea why it's that way.

You don't need to adopt everything at once. Start small:
- Next time you face a decision, write a quick research doc
- Next time you make a significant change, write an ADR
- Link them together

Over time, you'll build something more valuable than code: a **knowledge graph of your project's evolution**, where every decision is traceable, every choice is documented, and context never gets lost.

Start with one research document and one ADR. Link them, then repeat.
