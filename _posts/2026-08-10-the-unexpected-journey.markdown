---
layout: post
title: "The unexpected journey of building Skill Forge"
date:   2026-09-10 16:40:00 +0200
categories: [personal, project]
tags: [ai, agents, skill-forge, llm, automation, knowledge-systems, software-engineering]
---

> What started as a simple idea for building better AI skills became a deeper experiment in self-improving systems. Along the way, I explored review loops, CLI-powered skills, root skills, and a broader pattern that blends deterministic validation with AI judgement.

<img
	src="/assets/images/2026-08-10-the-unexpected-journey/inception.png"
	alt="McFuzzySquirrelr character looking at a spinning top"
	style="max-width: 420px; width: 100%; height: auto; display: block; margin: 1rem auto;"
/>

<!--more-->

## The Unexpected Journey of Building Skill Forge 
  
So I have been quite recently, but only because I been on an exciting journey.  
  
A really interesting side quest I’ve been exploring recently is something I’m calling **Skill Forge**. Initially I had a simple goal: make it easier to build high-quality reusable AI skills, but during this journey it turned into an experiment in self-improving systems.  
  
The first thing I wanted was obvious: if AI agents are going to rely on skills, then those skills need to be consistent, well structured, documented, and follow agreed best practices. So rather than expecting someone (including me) to remember everything, I wondered…  
  
*What if the AI could help enforce those standards itself, reliably?*  
  
So that led to the first piece of the puzzle (and one that was going to be the key to everything): a **Skill Reviewer** skill which analyses a skill against a growing set of best practices and provides feedback on what could be improved. Once I had that working, the next step felt natural: why not build a **Skill Creator** that uses those same best practices from the outset, producing better skills automatically instead of relying on review afterwards? 
  
And then things became slightly more… interesting.  
  
The first thing to remember is that best practices aren’t static forever. As we learn more, they evolve and when they evolve, then we need to ask: **who keeps the reviewer up to date?**  
  
Amusingly the answer, was…*A skill.*  
  
So I went on and built an administrative skill whose job is to review and improve the best practices themselves. Those improvements feed back into the Skill Reviewer, which in turn improves the Skill Creator.  
  
Now if you have ever watched the movie Inception, at this point it started feeling a little like AI inception:  
  
* A reviewer reviews skills.  
* A creator creates skills using the reviewer’s guidance.  
* An administrator updates the guidance used by the reviewer.  
* The improved reviewer produces better guidance for the creator.  
* The cycle repeats.  
  
So now the entire system has become capable of evolving without rewriting every individual skill, pretty cool.  
  
One of the biggest hands-on learning experience during this project came from playing with **skills that invoke command-line tools**.  
  
I always knew that we could execute scripts, but never really needed them before, but what about installing and running a CLI? So I experimented, and once I successfully had a skill install and execute a CLI as part of its workflow, something clicked. Skills no longer needed to be passive instruction sets, **they could orchestrate real tooling**.  
  
So know, instead of simply telling an agent *how* to perform a task, a skill can prepare its own environment, invoke specialist tools, process their output, and integrate the results back into the workflow. It becomes an executable capability rather than just documented knowledge. For me, this is a significant shift in how I think about skills.  
  
**But there is more**: the other concept I’m becoming increasingly interested in is the idea of a **root skill**.  
  
Rather than every skill carrying its own copy of common guidance and conventions, imagine a foundational skill that defines the shared principles for a team or an organisation. Every other skill inherits from it.  
  
- When your standards or rules evolve, you update the root once. Every future skill automatically benefits.  
  
Now combine that with the administrative improvement loop, and you have a mechanism for continuously refining your team or organisational knowledge. Over time, teams could build their own opinionated best practices while still keeping every generated skill aligned - it’s still an experiment, and I suspect I’ll discover plenty of flaws along the way, but that’s exactly what makes it fun.  
  
I always find that the most valuable projects I do aren’t the ones that solve today’s problem, but the ones that change how I think about tomorrow’s from what I learn from them.  
  
I’m excited to see where this leads. Right now it feels less like building individual skills and more like building a system that learns how to build better skills over time.  
  
One aspect of Skill Forge that I’m particularly happy with is the distinction between **mechanical validation** and **AI judgement**.  
  
The review process isn’t simply asking an LLM, *“Is this a good skill?”* Instead, the first layer is deliberately deterministic. It performs mechanical checks against a set of objective best practices derived from the [Agent Skills community guidance](https://agentskills.io). These are things that either pass or fail: 
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
  
Another reason I chose this approach is that the mechanical review is based on the best practices emerging from the [Agent Skills community](https://agentskills.io). While the ecosystem is still evolving, this once feels like one of the strongest foundations available today for reusable, composable AI skills. Building on an open community standard means Skill Forge isn’t inventing its own conventions, it starts with shared practices and leaves room for you, your team or your organisations to layer specific unique standards on top.  
  
This combination: a deterministic foundation, AI-assisted refinement, and a continuously evolving set of best practices, this is what makes the whole feedback loop work.  
  
Skill Forge is just the first implementation of a more general architecture.  
  
### So what’s next: beyond Skill Forge  
  
Surprisingly, the most exciting outcome of this experiment isn’t Skill Forge itself, it’s the pattern that emerged.  
  
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
  
Skill Forge started as a destination but became a journey where I discovered along the way, proof that the pattern works.  

If you’re interested, the repositories are public:  
  
* **Skill Forge** explores the skill creation and review pipeline: [Skill Forge](https://github.com/McFuzzySquirrel/skill-forge).  
* **McFuzzy Agent Forge** integrates these capabilities into a broader agent engineering workflow, including the architecture decision describing the integration [McFuzzy Agent Forge](https://github.com/McFuzzySquirrel/mcfuzzy-agent-forge)  
  
This became a much bigger idea than Skill Forge, and I thought  it’s was one worth telling.  

---

**Project:** [Skill Forge on GitHub](https://github.com/McFuzzySquirrel/skill-forge)
