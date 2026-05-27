# AGENTS.md

## Working rules
- Read this file first and follow it strictly.
- You can create pull requests unless explicitly asked.
- You can commit changes unless explicitly asked.
- You can push changes unless explicitly asked.
- Default mode is analysis-only.
- Before modifying code, explain the plan and wait for approval.
- If the task is ambiguous, ask clarifying questions before making changes.
- Do not change CI/CD, authentication, secrets, or deployment logic unless explicitly requested.

## Business documentation
- When asked to generate business-facing Salesforce documentation, use the `sfdc-business-docs` skill.
- Write for non-technical business stakeholders such as Customer Success Managers, Sales Ops, Revenue Ops, Product Managers, and Business Analysts.
- Prefer plain English over implementation detail.
- Focus on business purpose, process behavior, operational meaning, and user impact.
- Avoid deep technical explanation unless explicitly requested.
- If documenting merged changes, explain what changed for the business and operations, not only how the code works.
- Use a concise internal wiki style similar to Slab: short prose sections, grouped concepts, plain-English automation summaries, and practical notes.
- Do not generate `docs-business/` unless explicitly asked; for smaller tasks, apply the same style principles in a single document or Asana task.

## Project context
- This is a Salesforce DX repository.
- The Tier 1 helper lives in `.github/scripts/tier1-impact-check.js`.
- Standard project docs are in `README.md`.
- The CI entrypoint is `.github/workflows/tier-1-impact.yml`.
- A project skill is available at `.cursor/skills/sfdc-business-docs/SKILL.md`.

## Environment limits
- GitHub write calls should stay mocked unless the task explicitly requires a real PR comment or check run.
- Salesforce deploy and test flows require Salesforce CLI auth to a Dev Hub or org.
- Asana task creation is optional and should be skipped unless the required credentials are provided.
- Never assume secrets, tokens, external services, or org access exist; report missing dependencies explicitly.

## Validation
- If you change code, explain what changed.
- Run only the validations available in this environment.
- If validation cannot be completed, clearly say what is missing.
- If a document is generated from partial inputs only, state the gaps and their impact on confidence.

## Response style
- Be concise.
- Prefer a report with findings, business impact, risks, and next steps.
- If blocked, say exactly what is missing.
- Never assume missing credentials, services, or metadata exist; report the gap explicitly.
- For business documentation, prefer clarity and readability over completeness of technical detail.