# AGENTS.md

## Working rules
- Read this file first and follow it strictly.
- Do not create pull requests unless explicitly asked.
- Do not commit changes unless explicitly asked.
- Do not push changes unless explicitly asked.
- Default mode is analysis-only.
- Before modifying code, explain the plan and wait for approval.
- If the task is ambiguous, ask clarifying questions before making changes.
- Do not change CI/CD, authentication, secrets, or deployment logic unless explicitly requested.

## Project context
- This is a Salesforce DX repository.
- The Tier 1 helper lives in `.github/scripts/tier1-impact-check.js`.
- Standard project docs are in `README.md`.
- The CI entrypoint is `.github/workflows/tier-1-impact.yml`.

## Environment limits
- GitHub write calls should stay mocked unless the task explicitly requires a real PR comment or check run.
- Salesforce deploy and test flows require Salesforce CLI auth to a Dev Hub or org.
- The current checkout does not include a `force-app/` directory, so metadata validation may be unavailable until metadata is added or restored.
- Asana task creation is optional and should be skipped unless `ASANA_PAT` and `ASANA_PROJECT_GID` are provided.

## Validation
- If you change code, explain what changed.
- Run only the validations available in this environment.
- If validation cannot be completed, clearly say what is missing.

## Response style
- Be concise.
- Prefer a report with findings, risks, and next steps.
- If blocked, say exactly what is missing.
- Never assume missing credentials, services, or metadata exist; report the gap explicitly.