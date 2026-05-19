# Cortex Chat

Cortex Chat is an unofficial desktop-only Obsidian plugin that adds an AI chat sidebar with vault context, `@` references, PDF text extraction, local Codex CLI fallback, session history, shared `_cortex` memory, and backups for agent-assisted edits.

This plugin is not affiliated with Obsidian or OpenAI.

## Features

- Chat with Codex using the active note, outgoing links, `@` references, shared memory, and recent sessions.
- Load text from Markdown notes and text-based PDFs.
- Use `Planificador / Copiloto` for read-only planning and `Ejecutar / Sin restricciones` for action-oriented work.
- Store sessions, memory candidates, outbox data, and backups in `_cortex/`.
- Run on desktop with an optional local Codex CLI fallback.

## Requirements

- Obsidian `1.8.0` or newer.
- Obsidian desktop. Mobile is intentionally unsupported.
- Codex CLI installed and authenticated with ChatGPT if local fallback is used.
- Optional backend URL if you run a backend under your control.

## Installation

For beta testing, install with BRAT or copy the release files into:

```text
.obsidian/plugins/cortex-chat/
```

Required release files:

```text
main.js
manifest.json
styles.css
```

Enable `Cortex Chat` from Obsidian community plugins. The plugin creates its own local `data.json` on first run.

## Security and Privacy

Cortex Chat does not include client-side telemetry, ads, or analytics.

The plugin may access:

- The active Obsidian vault, including notes and configured folder roots.
- `_cortex/` inside the vault for shared memory, sessions, candidates, outbox data, and backups.
- `~/.cortex-chat` for local runtime state that should not sync through Obsidian Sync.
- `~/.codex/config.toml` only if the user explicitly enables Codex vault trust.
- Temporary OS folders for local Codex prompt/output files.
- Network URLs configured by the user for a backend.
- Codex/OpenAI services indirectly through the authenticated local Codex CLI.

Do not commit or publish:

- `data.json`
- `_cortex/`
- `_agent/` legacy data backups from previous private builds
- `.obsidian/`
- local runtime folders
- backend runtime files
- tokens, secrets, logs, sessions, or vault content

Technical folders such as `node_modules`, `.git`, `.obsidian`, `_cortex`, `_agent`, `dist`, `build`, `.cache`, `.vite`, and `coverage` are ignored as context sources.

## Legacy Data Migration

If the vault contains legacy `_agent/` data and `_cortex/` does not exist yet, Cortex Chat copies `_agent/` to `_cortex/` on startup. The legacy `_agent/` folder is preserved as a backup and is not used as the primary write target after migration.

## Work Modes

- `Planificador / Copiloto`: read, analyze, summarize, and propose without modifying vault files unless the user clearly asks.
- `Ejecutar / Sin restricciones`: can act without additional confirmation. File edits and deletions must create backups first.

## Development

`lib/` contains the maintainable CommonJS source modules. Obsidian loads `main.js`, so `main.js` is generated as a self-contained runtime.

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
