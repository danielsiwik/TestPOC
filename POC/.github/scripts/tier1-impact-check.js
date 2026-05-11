const fs = require("fs");
const path = require("path");

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const prAuthor = process.env.PR_AUTHOR || "unknown";
const prHeadSha = process.env.PR_HEAD_SHA;
const configPath = process.env.CONFIG_PATH || ".github/tier1/tier1-config.json";
const outputDir = ".github/tier1/output";

if (!token) throw new Error("Missing GITHUB_TOKEN");
if (!repository) throw new Error("Missing GITHUB_REPOSITORY");
if (!prNumber) throw new Error("Missing PR_NUMBER");
if (!prHeadSha) throw new Error("Missing PR_HEAD_SHA");

const [owner, repo] = repository.split("/");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function appendOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    map.set(keyFn(item), item);
  }
  return Array.from(map.values());
}

function normalizeChangeType(status) {
  if (status === "added") return "add";
  if (status === "removed") return "delete";
  return "update";
}

function loadConfig(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const cfg = JSON.parse(raw);

  cfg.objects = cfg.objects || [];
  cfg.fields = cfg.fields || [];
  cfg.blocking = Boolean(cfg.blocking);
  cfg.checkName = cfg.checkName || "Tier 1 Impact";
  cfg.commentMarker = cfg.commentMarker || "<!-- tier1-impact-check -->";
  cfg.architectTeamSlug = cfg.architectTeamSlug || "";

  return cfg;
}

async function gh(url, options = {}) {
  const response = await fetch(`https://api.github.com${url}`, {
    method: options.method || "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API ${response.status} ${response.statusText}: ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function paginate(url) {
  const all = [];
  let page = 1;

  while (true) {
    const chunk = await gh(`${url}${url.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < 100) break;
    page += 1;
  }

  return all;
}

function detectMetadataImpact(file, config) {
  const fieldMatch = file.filename.match(/objects\/([^/]+)\/fields\/([^/]+)\.field-meta\.xml$/);
  if (fieldMatch) {
    const objectName = fieldMatch[1];
    const fieldName = fieldMatch[2];
    const fullName = `${objectName}.${fieldName}`;
    const isTier1 = config.fields.some((f) => f.fullName === fullName);

    if (isTier1) {
      return {
        source: "metadata",
        componentType: "field",
        name: fullName,
        changeType: normalizeChangeType(file.status),
        file: file.filename
      };
    }
  }

  const objectMatch = file.filename.match(/objects\/([^/]+)\/[^/]+\.object-meta\.xml$/);
  if (objectMatch) {
    const objectName = objectMatch[1];
    const isTier1 = config.objects.some((o) => o.apiName === objectName);

    if (isTier1) {
      return {
        source: "metadata",
        componentType: "object",
        name: objectName,
        changeType: normalizeChangeType(file.status),
        file: file.filename
      };
    }
  }

  return null;
}

function splitPatchLines(patch) {
  const added = [];
  const removed = [];

  if (!patch) return { added, removed };

  for (const line of patch.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) continue;
    if (line.startsWith("+")) added.push(line.slice(1));
    if (line.startsWith("-")) removed.push(line.slice(1));
  }

  return { added, removed };
}

function buildMatchers(config) {
  const objectMatchers = config.objects.map((obj) => {
    const aliases = uniqueBy([obj.apiName, ...(obj.aliases || [])], (x) => x).filter(Boolean);
    return {
      componentType: "object",
      name: obj.apiName,
      patterns: aliases.map((alias) => new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(alias)}([^A-Za-z0-9_]|$)`))
    };
  });

  const fieldMatchers = config.fields.map((field) => {
    const aliases = uniqueBy(
      [field.fullName, field.apiName, ...(field.aliases || [])],
      (x) => x
    ).filter(Boolean);

    return {
      componentType: "field",
      name: field.fullName,
      patterns: aliases.map((alias) => new RegExp(`(^|[^A-Za-z0-9_])${escapeRegExp(alias)}([^A-Za-z0-9_]|$)`))
    };
  });

  return [...objectMatchers, ...fieldMatchers];
}

function detectCodeReferenceImpacts(file, matchers) {
  const impacts = [];
  const { added, removed } = splitPatchLines(file.patch);

  const linesToCheck = [
    ...added.map((line) => ({ line, changeType: "add" })),
    ...removed.map((line) => ({ line, changeType: "delete" }))
  ];

  for (const entry of linesToCheck) {
    for (const matcher of matchers) {
      const matched = matcher.patterns.some((regex) => regex.test(entry.line));
      if (!matched) continue;

      impacts.push({
        source: "code-reference",
        componentType: matcher.componentType,
        name: matcher.name,
        changeType: entry.changeType,
        file: file.filename
      });
    }
  }

  return uniqueBy(
    impacts,
    (x) => `${x.source}|${x.componentType}|${x.name}|${x.changeType}|${x.file}`
  );
}

function buildComment(report, config, shouldBlock) {
  const statusLine = report.hasImpact
    ? (shouldBlock ? "⚠️ Tier 1 impact detected — merge blocking is enabled." : "⚠️ Tier 1 impact detected.")
    : "✅ No Tier 1 impact detected.";

  const rows = report.impacts.length
    ? report.impacts.map(
        (impact) =>
          `| ${impact.name} | ${impact.componentType} | ${impact.source} | ${impact.changeType} | \`${impact.file}\` |`
      ).join("\n")
    : "| None | - | - | - | - |";

  return `${config.commentMarker}
## Tier 1 Impact Report

${statusLine}

- PR: #${report.prNumber}
- Author: @${report.author}
- Timestamp: ${report.timestamp}
- Blocking mode: ${shouldBlock ? "enabled" : "disabled"}

| Component | Kind | Source | Change | File |
|---|---|---|---|---|
${rows}
`;
}

async function upsertPrComment(body, marker) {
  const comments = await paginate(`/repos/${owner}/${repo}/issues/${prNumber}/comments`);
  const existing = comments.find((comment) => comment.body && comment.body.includes(marker));

  if (existing) {
    await gh(`/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: "PATCH",
      body: { body }
    });
    return existing.id;
  }

  const created = await gh(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    body: { body }
  });

  return created.id;
}

async function requestArchitectReview(teamSlug) {
  if (!teamSlug) return;

  try {
    await gh(`/repos/${owner}/${repo}/pulls/${prNumber}/requested_reviewers`, {
      method: "POST",
      body: {
        team_reviewers: [teamSlug]
      }
    });
  } catch (error) {
    console.warn(`Could not request team review: ${error.message}`);
  }
}

async function createCheckRun(config, report, shouldBlock) {
  const conclusion = report.hasImpact
    ? (shouldBlock ? "failure" : "neutral")
    : "success";

  const title = report.hasImpact
    ? (shouldBlock ? "Tier 1 impact detected (blocking)" : "Tier 1 impact detected")
    : "No Tier 1 impact";

  const summary = report.hasImpact
    ? `Detected ${report.impacts.length} Tier 1 impact(s) in PR #${report.prNumber}.`
    : `No Tier 1 impact detected in PR #${report.prNumber}.`;

  const text = report.impacts.length
    ? report.impacts.map((impact) => `- ${impact.name} (${impact.componentType}, ${impact.source}, ${impact.changeType}) in ${impact.file}`).join("\n")
    : "No impacted components.";

  await gh(`/repos/${owner}/${repo}/check-runs`, {
    method: "POST",
    body: {
      name: config.checkName,
      head_sha: prHeadSha,
      status: "completed",
      conclusion,
      output: {
        title,
        summary,
        text
      }
    }
  });
}

async function main() {
  ensureDir(outputDir);

  const config = loadConfig(configPath);
  const matchers = buildMatchers(config);
  const files = await paginate(`/repos/${owner}/${repo}/pulls/${prNumber}/files`);

  const impacts = [];

  for (const file of files) {
    const metadataImpact = detectMetadataImpact(file, config);
    if (metadataImpact) impacts.push(metadataImpact);

    const isMetadataFile =
      file.filename.endsWith(".field-meta.xml") ||
      file.filename.endsWith(".object-meta.xml");

    if (!isMetadataFile) {
      impacts.push(...detectCodeReferenceImpacts(file, matchers));
    }
  }

  const uniqueImpacts = uniqueBy(
    impacts,
    (x) => `${x.source}|${x.componentType}|${x.name}|${x.changeType}|${x.file}`
  );

  const hasImpact = uniqueImpacts.length > 0;
  const shouldBlock = hasImpact && Boolean(config.blocking);

  const report = {
    prNumber,
    author: prAuthor,
    timestamp: new Date().toISOString(),
    headSha: prHeadSha,
    hasImpact,
    impacts: uniqueImpacts
  };

  const comment = buildComment(report, config, shouldBlock);

  fs.writeFileSync(path.join(outputDir, "tier1-comment.md"), comment, "utf8");
  fs.writeFileSync(path.join(outputDir, "tier1-audit.json"), JSON.stringify(report, null, 2), "utf8");

  await upsertPrComment(comment, config.commentMarker);

  if (hasImpact && config.architectTeamSlug) {
    await requestArchitectReview(config.architectTeamSlug);
  }

  await createCheckRun(config, report, shouldBlock);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, comment);
  }

  appendOutput("has_impact", hasImpact ? "true" : "false");
  appendOutput("should_block", shouldBlock ? "true" : "false");
  appendOutput("impact_count", String(uniqueImpacts.length));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});