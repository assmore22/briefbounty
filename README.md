# BriefBounty

## Live Links

- App: https://briefbounty.vercel.app
- Repository: https://github.com/assmore22/briefbounty
This repository contains a complete GenLayer Studionet project: frontend, contract source, deployment metadata and local verification scripts.

A GenLayer-powered creative-brief bounty protocol.

## BriefBounty Brief

This repo is organized for review: the app can be opened locally, the contract source is present, and the deployed Studionet address is pinned in `deployment.json`.

- Folder: `projects/project-11-briefbounty`
- Frontend shape: Next/Vite-style app folder
- Contract source: `contracts/BriefBounty.py`
- Build status: next build OK (9 routes, 0 type/lint errors); contract 37504 bytes schema-valid; all 11 write methods executed on-chain; 17 read methods power the UI; RainbowKit+wagmi+viem+genlayer-js; D3 score rosette + GSAP tear-sheet overlays...
- Logo asset: FontAwesome newspaper (faNewspaper) + plain text wordmark 'BriefBounty'

## Protocol Mechanics

8 record types (Brief/ConceptSubmission/CreativeAssessment(embedded)/Ranking/Challenge/Appeal/CreatorProfile/AuditRecord) in DynArray[str] per type + TreeMap profiles + u256 clock; 11 write + 17 view methods; nondet assess/challenge/appeal resolution via gl.nondet.web.render + gl.nondet.exec_prompt inside gl.eq_principle.prompt_comparative; brief lifecycle draft->open->reviewing->ranked->challenged->appealed->awarded->archived; concept lifecycle submitted->assessed->shortlisted/revision_requested/rejected/low_effort->challenged->appealed->finalist->awarded; rubric-driven scoring (originality/brand-fit/feasibility/low-effort-risk) with min-score shortlist gate; deterministic clamped reputation; emulated owner/creator/open/ranked/status indexes + audit trail.

- Primary source: `contracts/BriefBounty.py` (37,504 bytes)
- Public write/action methods: 11
- Read methods: 17
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, indexed storage, append-only collections

Typical flow: `create_brief` -> `open_brief` -> `submit_concept` -> `resolve_challenge` -> `challenge_concept` -> `file_appeal` -> `archive_brief`

Useful reads: `get_brief`, `get_concept`, `get_ranking`, `get_challenge`, `get_appeal`, `get_profile`, `get_recent_briefs`, `get_open_briefs`

## Deployment Evidence

- Network: studionet (61999)
- Contract: [0xDee016d4f9C1160f05D75b51Dd996cda9003d80b](https://explorer-studio.genlayer.com/contracts/0xDee016d4f9C1160f05D75b51Dd996cda9003d80b)
- Deploy tx: [0x989e4370...04648a](https://explorer-studio.genlayer.com/tx/0x989e43705bdc34e421a1bf49bc34fa2537ea483b7fa65c14272b32a8b904648a)
- Deployed at: 2026-06-22T18:27:04.828Z
- Smoke writes recorded: 11

Smoke coverage:

- create_brief: [0xeea96efb...5eee28](https://explorer-studio.genlayer.com/tx/0xeea96efbd0cbf7d0b571587b60090b6feb68e3973643d4ef3c403dcbfd5eee28)
- open_brief: [0x9f6a38bc...3c0b64](https://explorer-studio.genlayer.com/tx/0x9f6a38bc670981ceb28833d6ba173cb9bb55c81259236ac4f63df9013b3c0b64)
- submit_concept: [0xc102b045...a06cfa](https://explorer-studio.genlayer.com/tx/0xc102b0451794fbdab44c84855cb680ba1e28d15bdc87e5240a0ed8c5aaa06cfa)
- assess_concept: [0x73c0e60a...c9446e](https://explorer-studio.genlayer.com/tx/0x73c0e60a642ba5a00eb51f135380bc47843dbb1a5d4cc77cb08f69ed72c9446e)
- publish_ranking: [0xd7024cab...143b89](https://explorer-studio.genlayer.com/tx/0xd7024cabbc8e9095db9dae934663d5fe6b026d7b8a6947f8ab9bd10094143b89)
- challenge_concept: [0x0598ebf3...81ef0f](https://explorer-studio.genlayer.com/tx/0x0598ebf33b326dbf9d021e08f56888bc2771ae9d2e4ae347597cd34aa781ef0f)

## Local Review Path

```powershell
cd <this-repository-folder>
npm install
npm run dev
```

Open the dev server URL printed by npm.

## Secret Handling

The repo is designed for public GitHub/Vercel release. Keep `.env`, `.vercel/`, wallet vaults, private keys and local dashboard state out of git. The publisher script enforces these ignore rules before it pushes.
