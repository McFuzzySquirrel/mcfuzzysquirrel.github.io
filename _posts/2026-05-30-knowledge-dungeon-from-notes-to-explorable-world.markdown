---
layout: post
title: "Knowledge Dungeon: Turning Study Notes into an Explorable World"
date:   2026-05-30 18:30:00 +0200
categories: [personal, project]
tags: [knowledge dungeon, educational gaming, procedural generation, knowledge mapping, repo-dungeon]
---

> *What if notes were not pages to read, but a world to explore?*

I have been building a project called **Knowledge Dungeon**, and it has evolved far beyond a simple study tool.

It started with a question: what if your notes, study material, and knowledge base could become a game world instead of a collection of documents?

The result is a procedurally generated 2D dungeon crawler where the dungeon itself is built from learning content. Notes become explorable areas, concepts become locations, and studying becomes exploration instead of passive reading.

<img
	src="/assets/images/2026-05-30-knowledge-dungeon-from-notes-to-explorable-world/knowledge-squirrel.png"
	alt="Knowledge Dungeon explorer character in a dungeon with map and torch"
	style="max-width: 420px; width: 100%; height: auto; display: block; margin: 1rem auto;"
/>

<!--more-->

## From Repo-Dungeon Idea to Playable Learning World

**A special note**: I am in no way any good at graphics, so dont expect anything groundbreaking in that space ***but it is fun!***

The earliest concept was "repo-dungeon": turning structured information from GitHub public repo(s) and later local git repos into navigable space. At first, this was mostly an experiment in representation. Could content relationships become map topology? Could navigation through a world stand in for navigation through ideas?

As the prototype evolved, it became a playable system with game loops, progression patterns, and interaction mechanics that made learning feel active.

**Knowledge Dungeon** did not start from zero. It was built on top of my earlier experiment, [repo-dungeon](https://github.com/McFuzzySquirrel/repo-dungeon), where I explored how structured information could be transformed into explorable spatial layouts.

That experiment provided the foundation for several core ideas that now power this project:

- Information first, visuals second: generation starts from relationships in the source material, then maps those relationships into navigable world structures.
- Exploration as comprehension: movement and discovery are treated as part of understanding, not just presentation.
- Spatialized knowledge: related concepts are placed in ways that help reveal clusters, boundaries, and paths through a topic.
- Reusable generation pipeline: parsing, relationship modeling, and layout logic from the original experiment were adapted and extended for educational content.

In short, repo-dungeon was the proof of concept. Knowledge Dungeon is the expanded version where the same principle is applied to learning experiences, gameplay systems, and deeper content interaction.

## What Is Built So Far

Here are some of the core features currently in place:

- Procedurally generated dungeon layouts driven by knowledge content.
- A playable RPG-style exploration experience built with web technologies and packaged for desktop.
- Draggable and interactive minimap systems for navigating generated worlds.
- Biomes and themed areas representing different domains of knowledge.
- Artifact, scroll, signpost, and discovery mechanics that turn information into game objects.
- Conversational interaction patterns that let players engage with content in a more natural way.
- Support for transforming static study notes into an experience closer to an adventure game.
- An architecture designed to eventually run on low-cost hardware for education-focused use cases.

## Areas This Brings Together

I love how many long-running interests converged in one project, I have an ongoing belief that everything is connected:

- Conversational learning.
- Knowledge graphs and content relationships.
- Procedural generation.
- Local and affordable computing.
- Educational gaming.
- Open-source experimentation.

Instead of asking learners to adapt to traditional study workflows, the goal is to adapt learning to something naturally engaging: exploration, discovery, progression, and curiosity - while keeping the core benefits of not taking and structured thinking.

## A Practical Spinout: Repo Mapping for Developers

Of course, I cant let it just be one thing and one cool outcome was not part of the game itself, but could be valuable and definately is fun.

While building Knowledge Dungeon, I created reusable SKILL.md that can analyze a software repository and generate a navigable mind map of its structure, relationships, and architecture. Instead of reading hundreds of files line by line to understand an unfamiliar codebase, developers can quickly visualize how parts connect - you can then import it into Knowledge Dungeon!

This becomes a practical second application of the same core idea:

- Helping developers understand their own repositories.
- Accelerating onboarding into existing projects.
- Exploring unfamiliar open-source repositories.
- Discovering architectural patterns and dependencies.
- Creating visual maps of complex codebases.

The underlying principle is the same in both contexts: transform information into something that can be explored instead of simply consumed.

Whether the source material is study notes, a textbook, or a software repository, the objective is consistent: make understanding feel like exploration and discovery.

Knowledge Dungeon is still evolving, but it already demonstrates a practical intersection of game development, knowledge mapping, and education. More importantly, it shows that study material can become a world you walk through, not just a document you read.

---

**Project:** [Knowledge Dungeon on GitHub](https://github.com/McFuzzySquirrel/knowledge-dungeon)
