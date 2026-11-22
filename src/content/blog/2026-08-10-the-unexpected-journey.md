---
title: "The unexpected journey of building Skill Forge"
date:   2026-08-10 16:40:00 +0200
categories: [personal, project]
tags: [ai, agents, skill-forge, llm, automation, knowledge-systems, software-engineering]
---

> What started as a simple idea for building better AI skills became a deeper experiment in self-improving systems. Along the way, I explored review loops, CLI-powered skills, root skills, and a broader pattern that blends deterministic validation with AI judgement.


<!--more-->

## The Unexpected Journey of Building Skill Forge

So I have been quiet recently, but only because I have been on an exciting journey.

<img
	src="/assets/images/2026-08-10-the-unexpected-journey/inception.png"
	alt="McFuzzySquirrel character looking at a spinning top"
	style="max-width: 420px; width: 100%; height: auto; display: block; margin: 1rem auto;"
/>

A really interesting side quest I’ve been exploring recently is something I’m calling **Skill Forge**. Initially, I had a simple goal: make it easier to build high-quality reusable AI skills, but during this journey it turned into an experiment in self-improving systems.

The first thing I wanted was obvious: if AI agents are going to rely on skills, those skills need to be consistent, well-structured, documented, and aligned with agreed best practices. So rather than expecting someone (including me) to remember everything, I wondered…

*What if the AI could help enforce those standards itself, reliably?*

So that led to the first piece of the puzzle (and one that was going to be the key to everything): a **Skill Reviewer** skill which analyses a skill against a growing set of best practices and provides feedback on what could be improved. Once I had that working, the next step felt natural: why not build a **Skill Creator** that uses those same best practices from the outset, producing better skills automatically instead of relying on review afterwards?

And then things became slightly more… interesting.

Best practices aren’t static. As we learn more, they evolve, and when they do, we need to ask: **who keeps the reviewer up to date?**

Amusingly, the answer was… *a skill.*

So I went on and built an administrative skill whose job is to review and improve the best practices themselves. Those improvements feed back into the Skill Reviewer, which in turn improves the Skill Creator.

If you have ever watched the movie Inception, this is where it starts to feel like AI inception:

* A reviewer reviews skills.
* A creator creates skills using the reviewer’s guidance.
* An administrator updates the guidance used by the reviewer.
* The improved reviewer produces better guidance for the creator.
* The cycle repeats.

The entire system can now evolve without rewriting every individual skill. Pretty cool.

One of the biggest hands-on learning experiences in this project came from playing with **skills that invoke command-line tools**.

I knew we could execute scripts, but I had never really needed them. Then I wondered about installing and running a CLI. I experimented, and once a skill could install and execute a CLI as part of its workflow, something clicked. Skills no longer had to be passive instruction sets; **they could orchestrate real tooling**.

So now, instead of simply telling an agent *how* to perform a task, a skill can prepare its own environment, invoke specialist tools, process their output, and integrate the results back into the workflow. It becomes an executable capability rather than just documented knowledge. For me, this is a significant shift in how I think about skills.

The other concept I’m becoming increasingly interested in is the **root skill**.

Rather than every skill carrying its own copy of common guidance and conventions, imagine a foundational skill that defines the shared principles for a team or an organisation. Every other skill inherits from it.

- When your standards or rules evolve, you update the root once. Every future skill automatically benefits.

Combine that with the administrative improvement loop and you have a mechanism for continuously refining team or organisational knowledge. Over time, teams could build their own opinionated best practices while keeping every generated skill aligned. It is still an experiment, and I suspect I will discover plenty of flaws along the way, but that is what makes it fun.

I find that the most valuable projects aren’t the ones that solve today’s problem. They are the ones that change how I think about tomorrow’s problems.

I’m excited to see where this leads. Right now it feels less like building individual skills and more like building a system that learns how to build better skills over time.

One aspect of Skill Forge that I’m particularly happy with is the distinction between **mechanical validation** and **AI judgement**.

The review process does not start by asking an LLM, *“Is this a good skill?”* The first layer is deliberately deterministic. It performs mechanical checks against a set of objective best practices derived from the [Agent Skills community guidance](https://agentskills.io). These are things that either pass or fail:
- structure
- required files
- metadata
- conventions
- documentation
- and other repeatable rules.

That means the foundation is predictable and consistent. Every skill is evaluated against the same criteria every time, without the variability that naturally comes from prompting an LLM.

Only once those objective checks have been satisfied does the AI move into the more subjective space with its semantic understanding:
- helping improve wording
- refining instructions
- suggesting better approaches
- or generating new capabilities.

This separation is important. AI shouldn’t be responsible for everything. Where deterministic validation is possible, we should use deterministic validation. Save the model’s reasoning for the parts where creativity, context, and judgement genuinely add value.

Another reason I chose this approach is that the mechanical review is based on best practices emerging from the [Agent Skills community](https://agentskills.io). The ecosystem is still evolving, but this one feels like a strong foundation for reusable, composable AI skills. Building on an open community standard means Skill Forge isn’t inventing its own conventions. It starts with shared practices and leaves room for you, your team, or your organisation to layer specific standards on top.

The combination of a deterministic foundation, AI-assisted refinement, and continuously evolving best practices makes the feedback loop work.

Skill Forge is just the first implementation of a more general architecture.

### Beyond Skill Forge

The most exciting outcome of this experiment is the pattern that emerged.

What started as a way to create better AI skills has become a blueprint that could be applied to almost any domain where AI and deterministic software work together.

The pattern looks something like this:

1. **Define a deterministic foundation.** Establish the objective rules that can be mechanically validated.
2. **Use AI where reasoning adds value.** Let models create, refine, or make contextual decisions rather than enforcing structure.
3. **Capture feedback.** Observe what works, what fails, and where improvements can be made.
4. **Improve the guidance.** Feed those learnings back into the rules, prompts, and best practices.
5. **Repeat.** Every cycle produces a better system than the one before.

Once I started looking for it, I realised this pattern extends well beyond skills.

Imagine applying it to software engineering. Coding standards evolve through feedback, code reviews become increasingly aligned with organisational practices, and new projects automatically inherit those improvements.

Or documentation. AI drafts content, deterministic validation ensures required sections and formatting are present, reviewers refine the guidance, and every future document benefits.

The same idea could apply to architecture decision records, security reviews, infra as code, educational content, business processes, or even organisational policies.

In each case, the objective checks remain deterministic while AI focuses on reasoning, synthesis, and creativity. It’s a system that continuously improves how it performs a task.

Skill Forge started as a destination but became a journey, and the pattern that emerged is the proof that it works.

If you’re interested, the repositories are public:

* **Skill Forge** explores the skill creation and review pipeline: [Skill Forge](https://github.com/McFuzzySquirrel/skill-forge).
* **McFuzzy Agent Forge** integrates these capabilities into a broader agent engineering workflow, including the architecture decision describing the integration: [McFuzzy Agent Forge](https://github.com/McFuzzySquirrel/mcfuzzy-agent-forge).

This became a much bigger idea than Skill Forge, and I thought it was worth telling.

---

**Project:** [Skill Forge on GitHub](https://github.com/McFuzzySquirrel/skill-forge)
