# Obsidian Codex

Private Obsidian plugin distribution for a Codex-powered sidebar with shared vault context, local Codex CLI fallback, session persistence, and `_agent` memory support.

## Installation

1. Create or open this folder in your vault:

   ```text
   .obsidian/plugins/agent-memory-sync/
   ```

2. Copy these files into that folder:

   ```text
   main.js
   styles.css
   manifest.json
   ```

3. Enable `Agent Memory Sync` from Obsidian community plugins.

The plugin will generate its own local `data.json` when it runs. Do not commit or share `data.json`; it belongs to a specific Obsidian installation.

## Requirements

- Obsidian `1.8.0` or newer.
- Desktop usage is recommended for local Codex CLI fallback.
- Codex CLI must be installed and authenticated with ChatGPT if local fallback is used.
- A remote HTTPS backend is required for mobile usage.

## Security Notes

- This repository intentionally excludes runtime state, tokens, session memory, local backend scripts, and vault content.
- `_agent/` is vault data, not plugin source. Do not commit it here.
- `data.json` may contain local preferences, backend URLs, UI scale, prompt customizations, and runtime state. It must remain untracked.
- In `Ejecutar / Sin restricciones`, the agent can act without asking for additional confirmation. The plugin instructs the agent to create backups before editing or deleting files, and plugin-owned note insertion creates a backup first.

## Included Files

- `main.js`: plugin runtime.
- `styles.css`: plugin UI styles.
- `manifest.json`: Obsidian plugin manifest.
