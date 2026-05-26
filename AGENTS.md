## Cursor Cloud specific instructions

- This checkout is a Salesforce DX repository plus the GitHub Actions Tier 1 impact helper in `.github/scripts/tier1-impact-check.js`; standard Salesforce project docs are in `README.md`, and the CI entrypoint is documented in `.github/workflows/tier-1-impact.yml`.
- The Tier 1 helper is the only runnable local application code currently present. It makes live GitHub write calls when `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `PR_NUMBER`, and `PR_HEAD_SHA` are set, so use a mocked GitHub API harness for local development unless you intentionally want to update a real PR comment/check run.
- Salesforce org deploy/test flows require Salesforce CLI auth to a Dev Hub or org. The current checkout does not include a `force-app/` directory, so Salesforce metadata conversion/deploy validation has no source to process until metadata is added or restored.
- Asana task creation is optional for the Tier 1 helper; it is skipped unless `ASANA_PAT` and `ASANA_PROJECT_GID` are provided.
