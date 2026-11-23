---
title: "When the Engine Was Fine and the UI Wasn't"
date: 2026-11-23 21:52:00 +0200
categories: ["personal", "project"]
tags: ["Knowledge Dungeon", "game engines", "architecture", "headless design", "side projects"]
---

I spent most of this week fighting the Knowledge Dungeon game UI. The mechanics were fine. The presentation wasn't, and I am no expert at that. I am not giving up, however. Even if I was not built to be a designer, I can still try!

<!--more-->

## What I already had

In May I wrote about [turning study notes into an explorable world](/blog/knowledge-dungeon-from-notes-to-explorable-world/). Since then the game picked up a PixiJS cutover, a village hub, fishing, spaced review, statistics, and an accessibility pass. The learning rules grew with it: note validation against a five-criterion rubric, XP and ranks, SM-2 review scheduling, loot, equipment, achievements, and a fishing system with a seeded state machine.

The rules were the part I kept improving. The screen was the part I kept rebuilding.

## Yet another attempt at the game shell

On 22 November I landed a world-first gameplay shell. The world takes the whole viewport, with a thin field rail, one quest card, one primary verb pair, and a single sheet that opens on demand. That commit is 2,006 lines across 19 files, including a 697-line stylesheet.

It did not replace the old interface. It hid the old HUD and the DOM world mirror with `display: none !important` and kept both mounted underneath, because they still carry the commands and the accessible controls. The new look sits on top of the old one.

It works. I can walk around, open a sheet, and clear a room. It still isn't the game I wanted to look at.

## Hold on, the engine is good

The engine was in a good space. Note validation was tested, progression was tested, review and fishing were tested. Every remaining problem I had was presentation, and presentation is the part I keep changing.

That matters because I don't have a visual instinct to build against. When the look is wrong, I don't have a clear next move. I edit CSS over a UI I don't want to keep, and the rules and tests come along for the ride. The work is real, but it doesn't compound.

The rules and the screen were sharing a repository and a build, so neither could move at its own speed.

## Focusing on the engine

I extracted the rules into [knowledge-dungeon-engine](https://github.com/McFuzzySquirrel/knowledge-dungeon-engine), version 0.1.0. It has no runtime dependencies and no React, Pixi, Phaser, or Electron import anywhere in `src/`. A host supplies the screen, the input, and the storage.

The engine owns the subject graph and dungeon generation, the Creator, Scribe, and Archaeologist commands, note validation and artifacts, review scheduling, progression and loot, equipment and achievements, fishing rules, the village, dungeon and village navigation, study sessions, statistics, and the storage contract. It does not own the camera, the sprites, the audio, or the save backend.

The boundary is written down in ten ADRs, and the [host UI guide](https://github.com/McFuzzySquirrel/knowledge-dungeon-engine/blob/main/docs/host-ui-guide.md) says what a host has to build: projection, input mapping, frame loop, accessibility, and durable storage.

The movement model is grid-based. It has no gravity or jumping. A side-scrolling host can use the learning rules, but it brings its own movement and collision. I would rather state that now than have someone discover it later.

## So what happened to all my original work?

The original [knowledge-dungeon](https://github.com/McFuzzySquirrel/knowledge-dungeon) repository is now the reference experiment. It keeps the shell branch, the tests, and the full Pixi application. I'm not adding features to it.

UI work continues from copies of the engine rather than from a dependency on it. An experiment should be disposable. A copy means a UI can change whatever it needs without a version contract, and if it turns out badly I delete it and start another copy.

That has a cost. Saves from the original app don't load in the engine, and there is no browser storage adapter yet. I didn't have work that needed saving, and the original still exists, so the cost was zero this time. The adapter is a problem for the first host that needs to keep data, and I'll deal with it then.

## Moving forward from lessons learned

I am still not the best at UI, but I am trying to get better. The split gives me room to experiment without breaking what works, which is the core engine.

The next interface starts from a copy of the engine. The rules don't move unless I mean them to, and the screen can be thrown away when it's wrong.

Since the engine is here, anyone can grab it and potentially build the game UI and experience they want.

---

**Projects:** [Knowledge Dungeon](https://github.com/McFuzzySquirrel/knowledge-dungeon) · [Knowledge Dungeon Engine](https://github.com/McFuzzySquirrel/knowledge-dungeon-engine)
