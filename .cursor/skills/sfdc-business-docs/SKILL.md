---
name: sfdc-business-docs
description: Reads all files in the docs/ folder and generates a business-friendly documentation set in docs-business/, written in Slab page style for non-technical audiences such as Customer Success Managers, Sales Ops, Revenue Ops, Product Managers, and Business Analysts. Use when the user asks to generate business documentation, translate technical Salesforce docs for a business audience, or create docs-business/ from an existing docs/ folder.
disable-model-invocation: true
---

# Salesforce Business Documentation Generator (Slab Style)

## Context

You have already generated technical Salesforce documentation in a `docs/` folder. That folder contains structured Markdown files covering objects, automations, Apex classes, flows, and more.

Your task is to read all files in `docs/` and generate a **second set of documentation** in a new folder called `docs-business/`. This documentation is written in **Slab page style** — clean, prose-driven, readable wiki pages intended for a non-technical business audience: Customer Success Managers, Sales Ops, Revenue Ops, Product Managers, and Business Analysts.

Do NOT modify anything in `docs/`. Only create files in `docs-business/`.

---

## What "Slab Style" Means

A Slab page is a clean internal wiki page. It has these characteristics:

- **Prose-first** — information is written in flowing sentences and short paragraphs, not dumped into tables
- **Fields are grouped by theme** — instead of one giant field table, fields are organized into named groups (e.g. "Identity & Segmentation", "Customer Success", "Commercial") with a short paragraph introducing each group, followed by a compact two-column reference table
- **Relationships are a simple bulleted list** — `**Object name** — what it represents`
- **Automations are plain-English bullets** — describe the *business behavior*, not the technical component that causes it
- **Tips and rules use callout blocks** — `> 💡` for tips, `> ⚠️` for warnings/rules
- **Sections are separated by `---`** — gives visual breathing room
- **"See also" footer** — links to related pages
- **No multi-column tables for narrative content** — tables are only used for compact field references, never for relationships, automations, or rules

---

## Audience

Write every page as if the reader:
- Understands the company's business, deals, and customers deeply
- Has never opened Salesforce configuration or read code
- Wants to understand **what the system does and why**, not how it is built
- Will read this in Slab, Notion, or Confluence

---

## Output Folder Structure

```
docs-business/
  README.md                      ← Plain-English org overview and index
  objects/
    {ObjectLabel}.md             ← One file per custom object
  processes/
    {process-name}.md            ← One file per business process
  automations.md                 ← All automated behaviors in plain English
  glossary.md                    ← Business terms and acronyms
```

---

## Writing Rules

1. **No Salesforce jargon without immediate plain-English translation**
   - "trigger" → "background automation"
   - "record-triggered flow" → "automatic rule that runs when a record is saved"
   - "lookup field" → "link to [object name]"
   - "validation rule" → "rule that blocks saving if [condition]"
   - "picklist" → "dropdown" or just describe the options directly
   - "master-detail" → "belongs to"

2. **Lead with the business purpose** — every section starts with *why it matters*, not *what it is*

3. **Use the company's own language** — keep business terms like "CS Pool", "ARR", "Dedicated CSM", "Hierarchy Segment" since these are real business concepts your audience already uses

4. **API names only in field reference tables** — never in prose, headings, or bullets

5. **Callout blocks for anything actionable**
   - `> 💡 **Tip:**` for practical advice
   - `> ⚠️ **Important:**` for rules that block or restrict actions
   - `> ℹ️ **Note:**` for context that prevents common mistakes

6. **Group fields by theme, not alphabetically** — group related fields together under a meaningful heading like "Segmentation", "CS Assignment", "Usage & Health", "Commercial"

7. **Keep automation bullets behaviorally focused** — "When you remove the Dedicated CSM, the account automatically returns to the CS Pool" not "The AccountTriggerHandler clears CS_Pool__c when Dedicated_CSM__c is null"

---

## Object Page Template

This is the exact structure to use for every file in `docs-business/objects/`. Follow the formatting precisely — this is what makes it look like a Slab page.

---

````markdown
# {Object Label}

{One sentence that says what this record represents in the business.}

{2–4 more sentences. Explain who uses it, what it connects to, and what the most important information on it tracks. Write it like a new employee's onboarding guide — warm, clear, no jargon.}

---

## Fields

> This section covers the fields that matter most to day-to-day work. For a complete technical field list, see the [technical docs](../../docs/objects/{ObjectApiName}.md).

### {Theme Group 1 — e.g. "Identity & Segmentation"}

{1–2 sentence intro explaining what this group of fields tracks and why it matters.}

| Field | API Name | Description |
|-------|----------|-------------|
| {Label} | `{API_Name__c}` | {Business-focused description — what decision or process does this field drive?} |

### {Theme Group 2 — e.g. "Customer Success"}

{1–2 sentence intro.}

| Field | API Name | Description |
|-------|----------|-------------|
| {Label} | `{API_Name__c}` | {Description} |

### {Theme Group 3 — e.g. "Commercial & Billing"}

{1–2 sentence intro.}

| Field | API Name | Description |
|-------|----------|-------------|
| {Label} | `{API_Name__c}` | {Description} |

> 💡 **Tip:** {Any practical tip about working with these fields — e.g. "If the Domain ID is missing, usage data will not appear on this account."}

---

## Relationships

This record connects to:

- **{Related Object Label}** — {what it represents in context, e.g. "all past and current deals for this company"}
- **{Related Object Label}** — {description}
- **{Related Object Label}** — {description}

---

## What Happens Automatically

The system handles these behaviors without any manual action needed:

- When {condition in plain English}, {what happens, in plain English}.
- When {condition}, {result}. {Optional: one sentence on why this matters.}
- Every {schedule/frequency}, {what the system recalculates or updates}.

> ⚠️ **Important:** {Any automatic behavior that could surprise or block someone — e.g. "Removing the Dedicated CSM automatically re-enrolls the account in the CS Pool. You do not need to update CS Pool manually."}

---

## Rules & Restrictions

These rules are enforced by the system and cannot be bypassed:

- {Rule 1 — written as a plain statement of what is blocked or required. E.g. "A new deal cannot be created on an account that is currently on a sales hold without approval from Sales leadership."}
- {Rule 2}
- {Rule 3}

> ⚠️ **Important:** {Highlight the most consequential rule with a callout if needed.}

---

## See Also

- [{Related process page}](../processes/{process}.md)
- [{Related object page}](../objects/{Object}.md)
- [Technical reference](../../docs/objects/{ObjectApiName}.md)
````

---

## Business Process Page Template

````markdown
# {Process Name}

{1–2 sentence summary of what this process achieves and who it affects.}

---

## How It Works

{2–3 sentence narrative overview. Explain the flow of the process in plain English before listing the steps.}

1. **{Step title}** — {Description of what happens. Who does it, or what does the system do automatically?}
2. **{Step title}** — {Description.}
3. **{Step title}** — {Description.}

> 💡 **Tip:** {Practical tip about the process — e.g. "Steps 3 and 4 happen automatically — you don't need to do anything once you save the record."}

---

## Who Is Involved

- **{Role}** — {what they do in this process}
- **{Role}** — {what they do}

---

## What Can Go Wrong

- {Plain-English description of a failure mode or edge case}
- {Another common issue and how to resolve it}

> ⚠️ **Important:** {The most important thing to know to avoid problems.}

---

## Outcome

{1–2 sentences on what the record looks like and what notifications or downstream records are created when the process completes successfully.}

---

## See Also

- [{Related object}](../objects/{Object}.md)
- [{Related process}](../processes/{process}.md)
````

---

## Automations Page Template

````markdown
# What Happens Automatically

This page lists every automatic behavior in Salesforce — things the system does on its own when records are created, updated, or on a schedule. You do not need to trigger these manually.

---

## {Object Label}

- **When {condition}:** {What happens, in plain English.}
- **When {condition}:** {What happens.}
- **Every {schedule}:** {What the system recalculates or syncs.}

> ⚠️ **Important:** {Highlight anything that could surprise someone.}

---

## {Another Object Label}

- **When {condition}:** {What happens.}

---

## Approvals

These processes require a human to approve before the system proceeds.

| Process | What it gates | Who approves |
|---------|--------------|--------------|
| {Name} | {What is blocked until approved} | {Approver role} |
````

---

## README Template

````markdown
# {Org / Project Name} — Business Guide to Salesforce

{3–4 sentences introducing the Salesforce org. What does it support? Which teams use it? What are the most important things tracked there? Written like an internal onboarding doc.}

---

## Key Records

- **[{Object Label}](objects/{Object}.md)** — {one-sentence plain-English description}
- **[{Object Label}](objects/{Object}.md)** — {one-sentence description}

---

## Key Processes

- **[{Process}](processes/{process}.md)** — {one-sentence description}
- **[{Process}](processes/{process}.md)** — {one-sentence description}

---

## Quick Reference

| I want to... | Go here |
|-------------|---------|
| Understand what an Account is | [Account](objects/Account.md) |
| See what happens automatically | [Automations](automations.md) |
| Look up a term | [Glossary](glossary.md) |

---

## Technical Docs

For field-level detail, API names, triggers, Apex, and Flows, see the [technical documentation](../docs/README.md).
````

---

## Glossary Template

````markdown
# Glossary

| Term | What it means |
|------|---------------|
| ARR | Annual Recurring Revenue — the annualized value of a customer's active subscription |
| CSM | Customer Success Manager — the person at our company responsible for a customer relationship post-sale |
| CS Pool | A shared coverage model where a team of CSMs collectively manages accounts, instead of one dedicated CSM per account |
| Dedicated CSM | A specific named CSM assigned to manage one account exclusively |
| {Term found in the repo} | {Plain-English definition written for a business user} |

> Add every acronym, internal term, product term, and business concept used anywhere in the docs. If a term appears in the technical docs without obvious meaning, define it here.
````

---

## Generation Process

1. Read all files in `docs/` — start with `README.md` and `data-model.md` to understand the org
2. For each object in `docs/objects/`, write the business page using the object template above
   - Group fields into 2–4 meaningful themes based on their purpose
   - Write a 1–2 sentence intro for each field group
   - Translate every automation in the technical doc into a plain-English bullet
3. Read `docs/business-processes/` and rewrite each as a process page
4. Read all of `docs/automations/` and compile `docs-business/automations.md`
5. Generate `docs-business/README.md` and `docs-business/glossary.md` last
6. After writing each page, re-read it and ask: **"Would someone who has never seen Salesforce understand every sentence?"** If not, rewrite.
7. Report a summary at the end: how many object pages, process pages, and glossary terms were generated