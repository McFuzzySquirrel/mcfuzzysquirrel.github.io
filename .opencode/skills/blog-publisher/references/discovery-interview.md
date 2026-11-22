# Discovery interview

Read the material first. Then ask in rounds of three or four questions. Skip
anything the author already answered. The goal is a confirmed story brief, not a
completed questionnaire.

## 1. Find the story

- What happened that made this worth writing now?
- What did you believe before this, and what do you believe now?
- What was the turning point?
- What did you try that did not work?
- What number, error, screenshot, or result makes this credible?
- What should the reader be able to do or decide after reading?

## 2. Find the reader

- Who is this for: another builder, a teammate, a beginner, a future you?
- What do they already know, and what can you skip?
- What misconception should this correct?
- What would make them stop reading?

## 3. Find the evidence

- Which repo, PR, commit, benchmark, screenshot, or note should I use?
- Which details are private, client-owned, or under NDA?
- Are there collaborators, users, or sources to credit or omit?
- Which claims need a measurement or a concrete example?

## 4. Find the shape

- Is this a build story, experiment log, reflection, tutorial, announcement, or
  postmortem?
- What is the one-sentence premise?
- What are the two to four sections?
- Should it end on a result, a lesson, or a next step?
- How long should it be: a short note or a full build story?

## 5. Find the boundaries

- What should stay out?
- Is any of this unreleased, client-owned, or sensitive?
- Should this be a draft? `draft: true` hides it from production builds, not
  from the repository.
- Does anyone need to review it before it goes live?

## 6. Find the packaging

- What direction should the title take?
- Which categories fit: `personal`, `project`, `update`, `workflow`, `tools`,
  or something else?
- Which tags should people filter by?
- Are there screenshots, diagrams, terminal output, or photos? What should the
  alt text say?
- Which repo, demo, related posts, or references should be linked?
- Is this part of a series?

## 7. Branch by post type

### Build story

- What was the original problem or constraint?
- What did you build first, and what changed after real use?
- Which decision had the biggest consequences?
- What broke in a way that taught you something?
- What would you do differently on the next build?
- What is the before-and-after evidence?

### Experiment or spike

- What was the hypothesis?
- How did you test it?
- What did you measure, and what were the numbers?
- What surprised you?
- What is still unproven?
- What is the next experiment?

### Reflection or opinion

- What triggered the reflection?
- What changed in how you think?
- What evidence supports the new view?
- What is the strongest counterargument?
- What should the reader do differently?

### Tutorial or how-to

- Where is the reader starting from?
- What do they need before they begin?
- What are the actual steps, in order?
- Where do people usually get stuck?
- How does the reader know it worked?
- What should they do when it fails?

### Project announcement

- What does it do, in one sentence?
- Who is it for?
- What is new or different?
- How can someone try it?
- What are the limitations?
- What happens next?

### Postmortem

- What did you expect to happen?
- What actually happened?
- What was the timeline?
- What was the root cause?
- What fixed it?
- What prevents a repeat?

## 8. Close the interview

Write the brief in this shape:

```text
Title:
Premise:
Reader:
Takeaway:
Sections:
Evidence to include:
Leave out:
Images and links:
Categories:
Tags:
Draft or publish:
```

Ask: "What is wrong or missing?" Do not scaffold or draft until the author
confirms the brief, unless they explicitly say "just write it."

If the author says "just write it," state the assumptions you are making and
draft. Do not keep interviewing.

## Question quality

- Ask one thing per question.
- Prefer "what changed?" over "can you tell me about...?"
- Ask for a number, example, or decision when an answer is vague.
- Do not ask for a fact that is already in the reference.
- Do not ask more than four questions in a round.
- Quote the line or artifact that prompted the question.
- If the author is tired of questions, state assumptions and draft.
