---
title: "Initial Setup"
description: "Step-by-step guide to setting up your development environment"
order: 1
---

# Initial Setup Guide

Welcome! This guide will walk you through everything you need to install and configure before you can run this project on your computer. No prior experience is required — we'll explain each tool along the way.

By the end of this guide, you'll have the project running locally in your browser.

---

## Prerequisites

Before working with the project code, you'll need to install a few tools. Follow each section in order.

### 1. Install Git

**Git** is a version control system — it tracks changes to your code over time and lets multiple people collaborate on the same project without overwriting each other's work. Nearly every software project uses Git.

**Download and install:**

- Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
- Download the installer for your operating system
- Run the installer and **use the default options** — the defaults work well for most setups

**Open a terminal:**

You'll use a terminal (also called a command line) to run commands throughout this guide.

- **Windows**: Search for **"Git Bash"** in the Start menu (installed with Git) or use **Windows Terminal**
- **Mac**: Open the **Terminal** app (found in Applications > Utilities)

**Verify the installation** by running this command in your terminal:

```bash
git --version
```

You should see something like `git version 2.x.x`. The exact version number doesn't matter.

**Configure your identity:**

Git needs to know who you are so it can label your changes. Run these two commands, replacing the placeholder text with your own name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

> **Note:** This email doesn't need to be verified — it's simply attached to your commits as an identifier. If you have a GitHub account, using the same email is a good practice.

---

### 2. Install Node.js

**Node.js** is a JavaScript runtime — it lets you run JavaScript code outside of a web browser. This project is built with Astro, which uses Node.js to build the website files, run the development server, and process assets like images.

**Download and install:**

- Go to [https://nodejs.org](https://nodejs.org)
- Download the **LTS** (Long Term Support) version — this is the stable, recommended version
- Run the installer and use the default options

> **Tip:** You'll see two download buttons on the Node.js homepage — **LTS** and **Current**. Always choose **LTS** unless you have a specific reason not to.

**Verify the installation:**

```bash
node --version
```

You should see something like `v22.x.x` (or newer).

Node.js comes bundled with **npm** (Node Package Manager), a tool used to install third-party code libraries. Verify it's available:

```bash
npm --version
```

---

### 3. Install pnpm

**pnpm** is a package manager, similar to npm but faster and more disk-efficient. This project uses pnpm instead of npm because it installs dependencies more quickly and enforces stricter rules that help avoid subtle bugs.

**Install pnpm globally** using npm (which you just installed with Node.js):

```bash
npm install -g pnpm
```

**Verify the installation:**

```bash
pnpm --version
```

> **Important:** All commands in this project use `pnpm`, not `npm`. If a command starts with `pnpm`, don't substitute `npm` — they are not interchangeable for this project.

---

### 4. Install a Code Editor

A **code editor** is a specialized text editor designed for writing code. Unlike a basic text editor (like Notepad), a code editor provides syntax highlighting, auto-completion, error detection, and other features that make development significantly easier.

**Recommended: Visual Studio Code (VS Code)**

- Download from [https://code.visualstudio.com](https://code.visualstudio.com)
- Run the installer and use the default options

**Recommended extensions:**

Extensions add extra functionality to VS Code. After installing VS Code, open it and install these extensions:

1. Click the **Extensions** icon in the left sidebar (it looks like four squares)
2. Search for and install each of the following:

| Extension | What It Does |
|-----------|-------------|
| **Astro** | Adds support for `.astro` files (syntax highlighting, formatting, IntelliSense) |
| **Tailwind CSS IntelliSense** | Auto-completes Tailwind CSS class names as you type |
| **Prettier** | Automatically formats your code to keep it clean and consistent |

---

## Clone & Run the Project

Now that your tools are installed, you can download and run the project.

### 1. Clone the Repository

**Cloning** downloads a copy of the project from the remote repository (e.g., GitHub) to your computer.

Open your terminal, navigate to the folder where you want the project to live, and run:

```bash
git clone <repository-url>
```

> **Note:** Replace `<repository-url>` with the actual URL of the project's Git repository. You can get this from the repository page on GitHub by clicking the green **"Code"** button and copying the URL.

Then move into the project folder:

```bash
cd astro-local-business-template
```

---

### 2. Install Dependencies

The project relies on many third-party libraries (called **dependencies**). These aren't included in the repository — you need to install them once after cloning.

Run this command from inside the project folder:

```bash
pnpm install
```

This reads the project's `package.json` file, downloads all required libraries, and stores them in a `node_modules/` folder. This may take a minute or two the first time.

---

### 3. Start the Dev Server

The **development server** builds the website and serves it locally so you can view it in your browser. It also watches for file changes and automatically refreshes the page when you save edits.

Start it with:

```bash
pnpm dev
```

After a few seconds, you should see output like:

```
  🚀 astro  vX.X.X started in Xms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

Open your browser and go to **[http://localhost:4321](http://localhost:4321)** to see the site.

**To stop the dev server**, press `Ctrl + C` in the terminal.

---

### 4. Verify Everything Works

Run through this quick checklist to make sure your setup is correct:

- [ ] The homepage loads at `localhost:4321` without errors
- [ ] You can see styled text, images, and navigation
- [ ] No red error messages appear in your terminal
- [ ] No red error messages appear in your browser's developer console (press `F12` to open it)
- [ ] Making a small text change in a `.astro` file and saving it causes the browser to refresh automatically

If everything checks out, you're all set!

---

## Other Useful Commands

Here are the other commands available in this project. You don't need these right now, but they'll be helpful as you work:

| Command | What It Does |
|---------|-------------|
| `pnpm build` | Creates a production-ready build in the `./dist/` folder |
| `pnpm preview` | Serves the production build locally for testing |
| `pnpm astro check` | Runs TypeScript and Astro component diagnostics |
| `pnpm images:optimize` | Resizes and compresses images dropped in `temp_images/`, outputting web-ready versions to `temp_images/optimized/` |

For a complete reference, see the project's [README.md](../README.md).

---

## Next Steps

Now that the project is running, continue with the next onboarding guides:

- **[Project Rebranding Guide](/docs/project-rebranding/)** — How to update company name, contact info, and site content
- **[Project Rebranding Guide — Color Scheme](/docs/project-rebranding/#step-2-customize-the-color-scheme)** — How to customize the color scheme and design tokens
- **[Content Updates Guide — Creating a New Service Page](/docs/content-updates/#creating-a-new-service-page)** — How to create and edit service pages
