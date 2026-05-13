# Codex Chat

Private Obsidian plugin distribution for a Codex-powered chat sidebar with shared vault context, local Codex CLI fallback, session persistence, and `_agent` memory support.

## Installation

1. Clone or copy this repository into this folder in your vault:

   ```text
   .obsidian/plugins/codex-chat/
   ```

2. Copy these files into that folder:

   ```text
   main.js
   styles.css
   manifest.json
   ```

3. Enable `Codex Chat` from Obsidian community plugins.

The plugin will generate its own local `data.json` when it runs. Do not commit or share `data.json`; it belongs to a specific Obsidian installation.

On first desktop run, the plugin also creates a local device identity automatically:

- a stable device id based on the computer name plus a random suffix
- a strong random device token
- a local registration against the backend at `127.0.0.1`

Users should not paste random values into token fields. Device tokens are stored in Obsidian SecretStorage when available, or in plugin-local runtime state outside the vault as a fallback.

## Migration from the Legacy Plugin

`Codex Chat` keeps using `_agent/` as the vault data contract, so shared memory, sessions, candidates, outbox, and backups do not need to move.

On first load, the plugin attempts to import compatible settings from prior Codex Chat identities and local runtime state. The old plugin folder is not deleted automatically.

## Requirements

- Obsidian `1.8.0` or newer.
- Desktop usage is recommended for local Codex CLI fallback.
- Codex CLI must be installed and authenticated with ChatGPT if local fallback is used.
- A remote HTTPS backend is required for mobile usage.

## Security Notes

- This repository intentionally excludes runtime state, tokens, session memory, local backend scripts, and vault content.
- `_agent/` is vault data, not plugin source. Do not commit it here.
- `data.json` may contain local preferences, backend URLs, UI scale, prompt customizations, and runtime state. It must remain untracked.
- Backend device registrations live in local runtime files such as `backend/.runtime/devices.json`; do not commit them.
- In `Ejecutar / Sin restricciones`, the agent can act without asking for additional confirmation. The plugin instructs the agent to create backups before editing or deleting files, and plugin-owned note insertion creates a backup first.

## Included Files

- `main.js`: plugin runtime.
- `styles.css`: plugin UI styles.
- `manifest.json`: Obsidian plugin manifest.
