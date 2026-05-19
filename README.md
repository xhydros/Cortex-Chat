# Cortex Chat

Cortex Chat is an unofficial desktop-only Obsidian plugin that adds an AI chat sidebar with vault context, note references, PDF text extraction, session history, shared `_cortex` memory, and backups for assistant-assisted edits.

This plugin is not affiliated with Obsidian, OpenAI, or Codex.

## Features

- Chat with an assistant using the active note, outgoing links, `@` references, shared memory, and recent sessions.
- Review a per-response context manifest that shows which notes, references, memory files, sessions, and related-note candidates were used.
- Toggle context sources from the chat workbench before sending, including active note, links, mentions, folders, memory, recent sessions, and local related notes.
- Pin previous assistant answers as explicit context, then remove individual context sources from the workbench before sending.
- Use lightweight local related-note retrieval when enabled; the persistent index lives in `_cortex/index/vault-keywords.json` and is bounded by settings.
- Preview assistant insertions with a diff-style view before they touch a note, with automatic backups and approved-change logs before applying.
- Load context from Markdown notes and text-based PDFs.
- Use `Planner / Copilot` for read-only analysis and `Execute / Unrestricted` for action-oriented work.
- Store sessions, memory candidates, outbox files, and backups in `_cortex/`.
- Optionally use the local Codex CLI as a desktop fallback.

## Requirements

- Obsidian `1.8.0` or newer.
- Obsidian desktop. Mobile is intentionally unsupported.
- Optional: Codex CLI installed and authenticated with ChatGPT if local fallback is used.
- Optional: a backend URL if you run a backend under your control.

## Installation

### Community plugins

After approval in the Obsidian community directory, install `Cortex Chat` from Obsidian:

```text
Settings -> Community plugins -> Browse -> Cortex Chat -> Install -> Enable
```

The plugin creates its own local `data.json` on first run.

### BRAT or manual testing

For beta testing, install with BRAT from this repository or copy the release files into:

```text
.obsidian/plugins/cortex-chat/
```

Required release files:

```text
main.js
manifest.json
styles.css
```

## Security and Privacy

Cortex Chat does not include client-side telemetry, ads, or analytics.

The plugin may access:

- The active Obsidian vault, including notes and user-configured folder roots.
- `_cortex/` inside the vault for shared memory, sessions, candidates, outbox files, and backups.
- `_cortex/index/vault-keywords.json` for the optional local RAG keyword index.
- `~/.cortex-chat` for local runtime state that should not sync through Obsidian Sync.
- `~/.codex/config.toml` only if the user explicitly enables Codex vault trust.
- Temporary OS folders for local Codex prompt and output files.
- Network URLs configured by the user for a backend.
- Codex/OpenAI services indirectly through the authenticated local Codex CLI.

Do not commit or publish:

- `data.json`
- `_cortex/`
- `.obsidian/`
- local runtime folders
- backend runtime files
- tokens, secrets, logs, sessions, backups, or vault content

Technical folders such as `node_modules`, `.git`, `.obsidian`, `_cortex`, `dist`, `build`, `.cache`, `.vite`, and `coverage` are ignored as context sources.

Use Context exclusions in settings for vault-specific private paths or patterns that should never be attached to a prompt or indexed for related-note retrieval.

## Work Modes

- `Planner / Copilot`: read, analyze, summarize, and propose without modifying vault files unless the user clearly asks.
- `Execute / Unrestricted`: can produce action-oriented output. User-visible note insertions still use the approval preview by default and create backups plus `_cortex/outbox/approved-changes` logs before applying.

## Prompt Profiles and Commands

Settings include prompt profiles for Researcher, Editor, Planner, and Safe executor. The composer also supports quick commands:

```text
/summarize
/rewrite
/extract-actions
/build-context
```

## Development

`lib/` contains the maintainable CommonJS source modules. Obsidian loads `main.js`, so `main.js` is generated as a self-contained runtime.

If you keep the source repository inside a synced vault, `_cortex-chat/` is a convenient local folder name because it sits next to `_cortex/`. This is only a development convention. The installed plugin folder must remain:

```text
.obsidian/plugins/cortex-chat/
```

After changing files in `lib/`, run:

```bash
node scripts/bundle-main.js
```

Before publishing a release:

```bash
node scripts/bundle-main.js
node --check main.js
node scripts/prepare-release.js
```

Attach `main.js`, `manifest.json`, and `styles.css` to the GitHub release whose tag matches `manifest.version`.
