---
title: "Git Guidelines"
description: "Branching model, commit conventions, and pull request workflow"
order: 7
---

# Git & GitHub Guidelines

This guide covers the branching strategy and Git workflows used on this project. Following these practices keeps the codebase organized, prevents accidental changes to the live site, and makes it easy to collaborate with other developers.

> **Prerequisites:**
> - Git is installed and configured (see [Initial Setup Guide](/docs/initial-setup/))
> - You have the project cloned locally
> - You have access to the GitHub repository

---

## How Our Branches Work

This project uses a **three-tier branching model**. Think of it as a series of checkpoints that code must pass through before it reaches the live website:

```
feature/your-work  →  staging  →  main (live site)
       ↑                 ↑            ↑
   You work here    Test here    Production
```

### The Three Branch Types

| Branch | Purpose | Deploys To |
|--------|---------|-----------|
| `main` | Production — the live website | Netlify (auto-deploys) |
| `staging` | Integration and testing — verify changes before going live | Preview URL (optional) |
| `feature/*`, `fix/*`, etc. | Individual work — one branch per task | Nothing (local only until PR) |

### The Golden Rules

1. **Never commit directly to `main`.** The `main` branch represents the live site. Every change to `main` triggers a production deployment. Changes should only reach `main` through a pull request from `staging`.

2. **Never commit directly to `staging`.** The `staging` branch is where completed work is collected and tested together. Changes should only reach `staging` through a pull request from a feature branch.

3. **Always work on a feature branch.** Every change — whether it's a new feature, a bug fix, or a content update — gets its own branch.

> **Why so strict?** Because `main` auto-deploys to the live website. If someone pushes broken code directly to `main`, the live site breaks immediately. The staging branch acts as a safety net — you can test everything there first, and only promote to `main` when you're confident it's ready.

---

## Creating a Feature Branch

### When to Create a Branch

Create a new branch **any time** you're about to make changes. Even small changes (fixing a typo, updating a phone number) should get their own branch. This keeps your work isolated and easy to review.

### How to Create One

First, make sure you're starting from the latest version of `staging`:

```bash
git checkout staging
git pull origin staging
```

Then create your new branch:

```bash
git checkout -b feature/add-faq-section
```

This creates a new branch based on `staging` and switches you to it.

### Branch Naming Conventions

Use a prefix that describes the type of change, followed by a short description in kebab-case (lowercase words separated by hyphens):

| Prefix | Use For | Example |
|--------|---------|---------|
| `feature/` | New functionality or pages | `feature/add-blog-page` |
| `fix/` | Bug fixes | `fix/broken-phone-link` |
| `content/` | Text, image, or data changes | `content/update-faq-answers` |
| `chore/` | Maintenance, cleanup, dependencies | `chore/compress-images` |
| `style/` | Visual/design changes | `style/update-brand-colors` |

> **Tip:** Keep branch names short but descriptive. Someone reading the name should have a general idea of what the branch does.

---

## Making Commits

A **commit** is a snapshot of your changes at a specific point in time. Think of it like saving a checkpoint in a video game — you can always go back to it.

### Staging Your Changes

Before committing, you need to **stage** the files you want to include. This lets you choose exactly which changes go into each commit.

**Stage specific files** (recommended):

```bash
git add src/data/branding.yaml
git add src/styles/global.css
```

**Stage all changed files** (use with caution):

```bash
git add .
```

> **Caution:** `git add .` stages everything that changed, including files you might not intend to commit. It's safer to add files by name so you know exactly what's going in.

**Check what's staged** before committing:

```bash
git status
```

This shows you which files are staged (in green) and which are modified but not yet staged (in red).

### Writing Good Commit Messages

A commit message should describe **what you changed and why**. Write it as a short command, as if you're telling the code what to do:

**Good messages:**

```bash
git commit -m "Add emergency CTA section to homepage"
git commit -m "Fix phone number link on contact page"
git commit -m "Update service area cities for new client"
git commit -m "Replace placeholder logos with client branding"
```

**Avoid these:**

```bash
git commit -m "changes"           # Too vague — what changed?
git commit -m "fixed stuff"       # What stuff? Why?
git commit -m "asdfasdf"          # Not helpful to anyone
git commit -m "WIP"               # Commit when the work is done, not in progress
```

### Keep Commits Focused

Each commit should contain **one logical change**. If you updated the branding colors and also fixed a typo on the About page, make two separate commits. This makes it much easier to understand the project history and undo specific changes if needed.

### Push Your Changes

After committing, **push** your branch to GitHub so it's backed up and visible to others:

```bash
git push origin feature/add-faq-section
```

The first time you push a new branch, Git may suggest a longer command — you can use it, or the above works fine.

> **Tip:** Commit often and push regularly. If your computer crashes or you need to switch to a different task, your work is safe on GitHub.

---

## Pull Requests

### What is a Pull Request?

A **pull request** (PR) is a way of saying: "I've finished my work on this branch — please review it and merge it into the target branch."

Pull requests exist for two reasons:
1. **Review** — Someone (or you yourself) can look over the changes before they're merged, catching mistakes early.
2. **Safety** — Changes don't go into `staging` or `main` until they're explicitly approved.

### Creating a Pull Request (Feature → Staging)

After you've pushed your feature branch to GitHub:

1. Go to the repository on **GitHub**
2. You'll often see a banner saying "your-branch had recent pushes" with a **Compare & pull request** button — click it
3. If you don't see the banner, click the **Pull requests** tab → **New pull request**
4. Set the branches:
   - **base:** `staging` (where you want to merge into)
   - **compare:** your feature branch (where your changes are)
5. Write a clear **title** summarizing the change (e.g., "Add emergency CTA section to homepage")
6. In the **description**, include:
   - What you changed and why
   - Any specific areas to pay attention to during review
   - Screenshots if you made visual changes
7. Click **Create pull request**

### Reviewing and Merging a PR

Once the PR is created:

1. Click the **Files changed** tab to review all the changes
2. Look for anything unexpected — typos, wrong values, files that shouldn't be included
3. If everything looks good, click **Merge pull request** → **Confirm merge**
4. After merging, GitHub will offer to **delete the branch** — click it. The branch has served its purpose and keeping it around just creates clutter.

### Promoting Staging → Main (Going Live)

When the changes in `staging` have been tested and you're ready to push them to the live site:

1. Go to **Pull requests** → **New pull request**
2. Set **base:** `main` and **compare:** `staging`
3. Title it something like: "Deploy: updated branding and FAQ content"
4. Review the full set of changes one more time
5. Merge the PR

This triggers a Netlify deployment. Within a couple of minutes, the live site will reflect the changes.

> **Important:** Treat the `staging → main` PR as the final checkpoint. Double-check that the site looks correct on staging before merging to main. Once it's on main, it's live.

---

## Keeping Your Branch Up to Date

While you're working on a feature branch, other people (or you on a different branch) may have merged changes into `staging`. To avoid conflicts, keep your branch up to date:

```bash
# Switch to staging and get the latest changes
git checkout staging
git pull origin staging

# Switch back to your branch and merge staging into it
git checkout feature/your-branch
git merge staging
```

**When to do this:**

- **Before starting new work** — Always pull the latest `staging` before creating a new branch
- **Before creating a pull request** — Merge `staging` into your branch so the PR is up to date
- **If your PR shows conflicts** — Merge `staging` into your branch, resolve conflicts locally, then push

---

## Common Situations

### "I accidentally committed to main"

Don't panic. If you haven't pushed yet:

```bash
# Move the commit to a new branch instead
git branch fix/accidental-commit
git reset --hard HEAD~1
```

This moves your changes to a new branch and resets `main` back to where it was. Then switch to the new branch and continue working:

```bash
git checkout fix/accidental-commit
```

> **Warning:** If you've already pushed to `main`, talk to your team before trying to fix it — the live site may have already deployed with the change.

### "I have merge conflicts"

A **merge conflict** happens when two branches changed the same lines in the same file, and Git doesn't know which version to keep. It's normal and not dangerous — it just means you need to make a decision.

When a conflict occurs, Git marks the conflicting sections in the file like this:

```
<<<<<<< HEAD
Your version of the code
=======
The other version of the code
>>>>>>> staging
```

To resolve it:
1. Open the file in VS Code — it highlights conflicts and offers buttons to accept one version or the other
2. Choose the correct version (or combine both if needed)
3. Remove the `<<<<<<<`, `=======`, and `>>>>>>>` markers
4. Save the file
5. Stage and commit the resolved file:

```bash
git add path/to/resolved-file
git commit -m "Resolve merge conflict in branding.yaml"
```

> **When in doubt:** If you're not sure which version to keep, ask a teammate. It's better to ask than to accidentally overwrite someone's work.

### "I want to undo my last commit"

If you committed something by mistake and haven't pushed yet:

```bash
git reset --soft HEAD~1
```

This undoes the commit but **keeps your changes staged** — so you haven't lost any work. You can then modify the files and commit again.

### "I need to switch branches but have uncommitted changes"

If you need to switch to a different branch but aren't ready to commit your current work, you can **stash** it — temporarily setting it aside:

```bash
# Save your uncommitted changes
git stash

# Switch branches and do your other work
git checkout staging

# When you come back, restore your changes
git checkout feature/your-branch
git stash pop
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Check current branch | `git branch` |
| See all branches | `git branch -a` |
| Switch to a branch | `git checkout branch-name` |
| Create and switch to new branch | `git checkout -b branch-name` |
| Pull latest changes | `git pull origin branch-name` |
| Check what's changed | `git status` |
| See the actual changes | `git diff` |
| Stage specific files | `git add file1 file2` |
| Stage all changes | `git add .` |
| Commit staged changes | `git commit -m "Your message"` |
| Push to GitHub | `git push origin branch-name` |
| Merge another branch into yours | `git merge branch-name` |
| Stash uncommitted changes | `git stash` |
| Restore stashed changes | `git stash pop` |
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |
| View commit history | `git log --oneline` |

---

## Next Steps

- [Project Hosting Guide](/docs/project-hosting/) — How to deploy the site and connect a domain
- [Project Rebranding Guide](/docs/project-rebranding/) — How to customize branding, colors, and content
