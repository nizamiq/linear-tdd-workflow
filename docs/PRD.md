# Agentic AI Coding Agent — PRD (v1.3, Concurrency & Tool‑Permissions)

## 0) Document Control

* **Version:** v1.3 (Concurrency + Tool‑Permissions)
* **Owner:** Engineering Excellence Team
* **Approvers:** Security Lead, Platform Lead, Compliance, Product
* **Stakeholders:** IC Devs, SRE, QA, DevEx, Risk/Legal
* **Status:** Active Development
* **Repository:** `linear-tdd-workflow`

---

## 1) Scope

**In‑Scope (v1.3):**

* **Languages:** JavaScript/TypeScript, Python
* **Environments:** Development, Staging, CI/CD
* **Repositories:** Up to **3 concurrent**; ≤ **200k LOC** each
* **Operations:** Code assessment, Fix Pack implementation, pipeline recovery, pattern learning
* **Integrations:** Linear.app, GitHub (GitFlow), MCP tools

**Out‑of‑Scope (v1.3):**

* Direct production merges by agents
* Secret rotation/credential management
* Infrastructure provisioning beyond CI/CD
* DB migrations & feature/API additions without explicit approvals (FIL‑2/3)

**Concurrency Principle (new):**
System supports up to **10 concurrent sub‑agents** per repository for non‑destructive, independent tasks; overflow is queued by **STRATEGIST** to respect cost caps and path‑locks. Shared‑state or feature work (FIL‑2/3) runs **sequentially** under Suggest‑Only + approval gates. (Details: §7 Concurrency Model.)

**Least‑Privilege Tools (new):**
Every sub‑agent declares an explicit **`tools:`** allow‑list in `.claude/agents/*.md`. Default‑deny for write‑capable tools and external MCPs unless explicitly listed. (Details: §6.4 Security & Tool Permissions.)

**TDD Non‑Negotiable:**
All changes follow **RED→GREEN→REFACTOR**, with **diff coverage ≥ 80%** on changed lines and **mutation‑smoke ≥ 30%** on changed files. (Details: §8 DevOps & TDD Policy.)

---

## 2) Executive Overview

**Problem.** Teams lose velocity to maintenance, technical debt, flaky pipelines, and inconsistent standards.
**Target Users.** IC Developers, Tech Leads, SRE, QA, Eng Managers, Security
**Value (targets).**

* Maintenance time ↓40%
* PR cycle time ↓30–35%
* MTTR (pipeline) ↓50%
* +20pp coverage on touched code
  **Autonomy.** **Guided automation**: agents raise PRs with full evidence; humans approve merges. Sandbox execution only.

---

## 3) Business Requirements (SMART)

### 3.1 Functional

**FR‑01 — Continuous Code Assessment**

* **S:** Multidimensional analysis (complexity, maintainability, security, performance) with actionable issues to Linear
* **M:** ≥ 80% actionable; ≤ 10% FP; issues include severity, effort, acceptance criteria
* **A:** AST/CFG analysis; pattern detection; security scans
* **R:** Drives debt reduction and consistent quality
* **T:** First run p95 ≤ 12 min (JS/TS), ≤ 15 min (Py) for ~150k LOC; incremental p95 ≤ 3 min

**FR‑02 — TDD Enforcement**

* **S:** Every change follows RED→GREEN→REFACTOR; tests precede code
* **M:** **Diff coverage ≥ 80%**; **mutation‑smoke ≥ 30%** on changed files; commit tags `[RED]`→`[GREEN]`→`[REFACTOR]` or PR labels
* **A:** Jest/Vitest/pytest; StrykerJS/mutmut; coverage reporters
* **R:** Prevents regressions and enables safe refactors
* **T:** Test creation p50 ≤ 5 min per Fix Pack

**FR‑03 — Fix Pack Implementation**

* **S:** Implement **pre‑approved** low‑risk improvements via atomic PRs
* **M:** ≤ 300 LOC per PR; ≥ 8 accepted Fix Pack PRs/day/repo
* **A:** Language codemods (ts‑morph/jscodeshift/LibCST/Bowler), linters/formatters
* **R:** Reduces maintenance burden with high safety
* **T:** Implementation p50 ≤ 15 min (compute), excluding human review

**FR‑04 — Pipeline Recovery (GUARDIAN)**

* **S:** Detect and fix CI flakiness/failures autonomously
* **M:** ≥ 90% auto‑recovery; rollback rate ≤ 0.3% (7‑day)
* **A:** Failure signature library; targeted playbooks (rerun, quarantine, lockfile fix, revert)
* **T:** Detect ≤ 5 min; recover ≤ 10 min p95

**FR‑05 — Linear Integration**

* **S:** Bi‑directional sync for findings, sprints, and PR links
* **M:** 100% tracked; latency ≤ 2 s p95
* **A:** Webhooks + API; issue templates and action plan phases

**FR‑06 — Pattern Learning (SCHOLAR)**

* **S:** Extract and validate codemods/test templates from successful PRs
* **M:** ≥ 2 validated patterns/month; ≥ 25% reuse; efficiency +10% MoM

**FR‑07 — Sub‑Agent Concurrency (new)**

* **S:** Run up to **10** concurrent **read‑heavy** or **independent** tasks (e.g., partitioned assessment, linting, static reviews, test runs) per repo; queue overflow
* **M:** Orchestration overhead ≤ 5%; resource utilization ≥ 75%
* **A:** STRATEGIST sharding by path/package; per‑path locks; cost‑aware scheduling
* **R:** Higher throughput without conflicts
* **T:** Concurrency plan computed ≤ 1.5 s p95 (control plane)

**FR‑08 — Tool Permission Enforcement (new)**

* **S:** Each sub‑agent declares **`tools:`** allow‑list; default‑deny for write/MCP tools
* **M:** 100% sub‑agents have explicit tool scopes; zero write attempts outside allow‑list
* **A:** `.claude/agents/*.md` front‑matter; policy check in CI; pre‑deployment permission tests
* **R:** Principle‑of‑least‑privilege and clear blast‑radius limits
* **T:** Policy evaluation ≤ 1 s p95 (status check)

**FR‑09 — Feature‑Control Guardrails (FIL)**

* **S:** Block new **public APIs/routes/DB/env/major deps** (FIL‑2/3) unless `FEAT‑APPROVED` + RFC + CODEOWNERS
* **M:** 100% FIL‑2/3 merges require approvals; 0 unauthorized feature merges
* **A:** PR diff classifier (policy‑as‑code); required status checks
* **T:** Classification ≤ 2 s p95 (CI)

### 3.2 Non‑Functional

* **NFR‑01 Availability:** **99.0%** (Beta), **99.5%** (GA) for core services
* **NFR‑02 Performance:** Assessment p95 ≤ 12/15 min; Fix Pack p50 ≤ 15 min; control‑plane p95 ≤ 1.5 s
* **NFR‑03 Cost:** ≤ $2.5k per repo/month; **cost‑per‑accepted‑fix** median ≤ $3, p95 ≤ $5; throttling on breach
* **NFR‑04 Security:** Read‑only default; PR‑only writes; 90‑day audit trail; compliance targets (NIST/OWASP/SLSA)
* **NFR‑05 Observability:** 100% components instrumented (traces, logs, metrics); dashboards for throughput, rollback rate, cost/fix

---

## 4) Core Features & Agent Capabilities

**AUDITOR — Clean‑Code Assessment.** Multi‑dimensional analysis; emits CLEAN‑XXX issues with acceptance criteria & remediation steps; supports action‑plan phases. (Dimensions/flow: see Clean‑Code Assessment doc.)

**EXECUTOR — Fix Packs (strict TDD).** Applies small, safe changes with RED→GREEN→REFACTOR evidence; includes coverage/mutation deltas and rollback plan in PR.

**GUARDIAN — Pipeline Intelligence.** Watches CI events/logs; classifies failures; applies playbooks; quarantines flakiness; verifies green. Targets in FR‑04.

**STRATEGIST — Orchestration.** Schedules and shards workloads; applies path locks to prevent conflicts; maintains cost caps; updates Linear planning; manages concurrency queues.

**SCHOLAR — Pattern Learning.** Extracts codemods/test templates from accepted PRs; validates on blinded repos; curates catalog; tracks adoption & efficiency gains.

**Focused sub‑agents (parallelizable):** TESTER, VALIDATOR, LINTER, TYPE‑CHECKER, SECURITY, DEPENDENCY, PERF, DOCS, REVIEWER, RELEASE — each with narrow scope, read‑heavy by default, and explicit `tools:` lists to enable safe parallelism. (See §10 Appendix A.)

---

## 5) User Experience & Workflows

**Primary touchpoints:** GitHub PRs/status checks/comments, Linear tasks & cycles, CLI/commands, and (optionally) a dashboard. Quick‑start and command map live in the Reference Hub.

**Key flows:**

1. **Assessment → Backlog:** `/assess-code-quality --scope=changed` shards the repo; AUDITOR creates CLEAN‑XXX issues in Linear with acceptance criteria. Parallel fan‑out/fan‑in is handled by STRATEGIST.
2. **Fix Pack (TDD):** `/implement-task CLEAN-123 --test-first` orchestrates TESTER (RED), EXECUTOR (GREEN), and REFACTOR, then VALIDATOR gates (coverage/mutation). PR includes evidence and rollback plan.
3. **Pipeline Recovery:** `/monitor-pipeline --full` triggers GUARDIAN to analyze failures and apply playbooks; escalates on repeated failures.
4. **Learning Loop:** `/analyze-fixes --window=7d` has SCHOLAR extract/validate patterns and update the catalog; adoption is reported weekly.

---

## 6) Technical Architecture

### 6.1 Components

* **Orchestrator (Node/TS):** state machines + queue (BullMQ/Redis)
* **Language Workers:** `js_ts_worker` (Node 20); `python_worker` (Py 3.12)
* **Agents:** AUDITOR, EXECUTOR, GUARDIAN, STRATEGIST, SCHOLAR (+ sub‑agents)
* **Evidence Store:** audit logs, diffs, test artifacts, metrics, pattern catalog
* **Integrations:** GitHub (webhooks/API), Linear (webhooks/API), MCP tools

### 6.2 Sharding & Locks (Concurrency)

* **Sharding:** STRATEGIST partitions by path/package/workspace; launches up to **10** parallel sub‑agents for read‑heavy tasks.
* **Locks:** path‑scoped locks prevent overlapping writes; EXECUTOR enforces ≤ 1 PR per module at a time.
* **Queuing:** overflow enqueued; aging & priority respected; budgets constrain concurrency.

### 6.3 Data Model (interface level)

* **Assessment:** `{id, repo_id, timestamp, issues[], metrics, score}`
* **Issue/Task:** `{id, category, severity, effort, location, description, acceptance_criteria[]}`
* **FixPack/PR:** `{id, task_id, commits[], tests_added, coverage_delta, mutation_score, rollback}`
* **Pattern:** `{id, template, success_rate, usage_count}`

### 6.4 Security & Tool Permissions (new emphasis)

* **Least privilege:** every sub‑agent declares **`tools:`** allow‑list in `.claude/agents/*.md`.
* **Default‑deny:** write‑capable tools and external MCPs blocked unless listed.
* **Policy check:** CI status check validates declared tools vs. attempted tool usage.
* **RBAC:** GitHub/Linear permissions enforced at API layer; CODEOWNERS for approvals.
* **Audit:** Evidence Store tracks tool invocations and approvals for 90 days.

### 6.5 Observability

* **Traces:** tool calls, agent decisions, queue timings
* **Metrics:** throughput, p95 job times, rollback rate, cost/fix, utilization
* **Dashboards:** assessment health, Fix Pack velocity, pipeline uptime, pattern adoption

---

## 7) Concurrency Model

**Allowed for parallelism (default):** assessment partitions, lint/format, static review, type‑check on changed files, unit tests on shards, security scans, doc generation, pattern mining (read‑only).
**Avoid parallelism (sequential with approvals):** cross‑cutting refactors; new APIs/routes/DB/env/major dependency upgrades (FIL‑2/3); stepwise migrations.
**Caps:** up to **10** sub‑agents per repo concurrently; per‑path locks on write tasks; cost‑aware throttling.
**Fairness & Safety:** work‑stealing within repo; circuit breaker if cost/sla breaches; GUARDIAN monitors job failures and pauses shards as needed.

---

## 8) DevOps & TDD Policy (GitHub‑first)

**Branch Protection (GitFlow):** required checks on PRs to `develop/main`:

* `tdd-gates` (diff coverage ≥ 80%), `mutation-smoke` (≥ 30%), `lint`, `typecheck`, `security-scan`, `policy-fil`, `reviewer-summary`
* 1+ human review; **no** direct pushes to `main` (agent merges not allowed)

**Commit/PR protocol:** `[RED]` → `[GREEN]` → `[REFACTOR]` (or PR labels if squashed); PR template includes failing‑test link, coverage delta, mutation score, rollback plan.

**Pre‑commit hooks:** language‑specific lint/format/tests; secret detection; JSON/YAML validation.

---

## 9) RBAC & Multi‑Tenancy

* **Identity:** GitHub App per org; OAuth for users
* **Authorization:** GitHub teams/permissions; Linear workspace scoping
* **Isolation:** repository‑scoped data & locks
* **Audit:** immutable per‑tenant trail (90‑day retention)

---

## 10) Documentation & Contracts

* **Reference Hub:** quick start, command map, doc navigation
* **Workflows:** TDD protocol; Clean‑Code Assessment; Product Requirements
* **`.claude` directory:** sub‑agent specs with **`tools:`** lists; workflow guides; MCP tool docs
* **Templates:** Linear issue templates (Fix Packs), PR template, RFC template for FIL‑2/3 changes

---

## 11) Evaluation & Metrics

* **Assessment quality:** actionable ≥ 80%; FP ≤ 10%; SLA compliance
* **Throughput:** ≥ 8 accepted Fix Packs/day/repo; ≤ 300 LOC/PR
* **Safety:** rollback rate ≤ 0.3% (7‑day); 0 unauthorized FIL‑2/3 merges
* **TDD:** diff coverage ≥ 80%; mutation‑smoke ≥ 30% (changed files)
* **Ops:** availability ≥ 99.0% (Beta), ≥ 99.5% (GA); MTTR (pipeline) ≤ 10 min p95
* **Cost:** median ≤ $3 / accepted fix; p95 ≤ $5; budget guardrails enforced
* **Learning:** ≥ 2 validated patterns/month; ≥ 25% reuse

---

## 12) Risks & Mitigations

* **Concurrent write conflicts →** path locks, one‑PR‑per‑module rule, STRATEGIST queue
* **Scope creep (features) →** FIL classifier; `FEAT‑APPROVED` gate; RFC workflow
* **False positives in assessment →** rule tuning; dedupe; human sampling
* **Pipeline flakiness →** GUARDIAN quarantine & playbooks; retries bounded
* **Cost overruns →** per‑repo budgets; concurrency throttles; cache/incremental runs

---

## 13) Acceptance Criteria (Global)

* System identifies actionable issues and lands **≥ 8** accepted Fix Pack PRs/day/repo
* **0** unauthorized FIL‑2/3 merges; rollback rate **≤ 0.3% (7‑day)**
* Pipeline **≥ 95%** uptime; MTTR ≤ 10 min p95
* **100%** agent PRs pass TDD gates (diff coverage ≥ 80%, mutation‑smoke ≥ 30%)
* Pattern library grows by **≥ 2/month**; reuse ≥ 25%
* Complete audit trail and dashboards (assessment → PR → merge)

---

## 14) Roadmap (from current v1.3 → world‑class)

**Phase A — Concurrency Foundations (Weeks 1–4)**

* Shardable assessment runner (AUDITOR fan‑out/fan‑in)
* STRATEGIST: path‑locks & concurrency caps; cost budgets
* CI: `policy-fil` status check (diff classifier)
  **Gate:** 10‑way assessment shards; 0 conflicts; FIL enforced

**Phase B — TDD Gates at Scale (Weeks 5–8)**

* TESTER/VALIDATOR pipelines; diff coverage & mutation‑smoke on changed files
* PR template & commit/label enforcement `[RED]/[GREEN]/[REFACTOR]`
  **Gate:** 100% agent PRs meet TDD gates; throughput ≥ 8/day/repo

**Phase C — Guardian Playbooks (Weeks 9–12)**

* Flake quarantine; lockfile repair; revert bot; escalation rules
  **Gate:** MTTR ≤ 10 min p95; ≥ 90% auto‑recovery

**Phase D — Pattern Engine (Weeks 13–16)**

* SCHOLAR extraction & blinded validation; catalog + adoption reporting
  **Gate:** ≥ 2 validated patterns/month; ≥ 25% reuse

**Phase E — Enterprise Polish (Weeks 17–20)**

* Dashboards (cost/fix, rollback rate, concurrency utilization)
* Policy packs; CODEOWNERS/RFC automation; audit exports
  **Gate:** Availability ≥ 99.5%; budgets observed; GA ready

---

## Appendices

### A) Agent/Sub‑Agent Quick Reference (keywords only)

* **Core:** AUDITOR (scan), EXECUTOR (Fix Pack), GUARDIAN (CI SRE), STRATEGIST (orchestrate), SCHOLAR (patterns)
* **Sub‑agents:** TESTER (RED), VALIDATOR (gates), LINTER, TYPE‑CHECKER, SECURITY, DEPENDENCY, PERF, DOCS, REVIEWER, RELEASE

### B) Command Surface (examples)

* `/assess-code-quality`, `/implement-task`, `/monitor-pipeline`, `/coordinate-agents`, `/analyze-fixes`

### C) CI Status Checks (short list)

* `tdd-gates`, `mutation-smoke`, `lint`, `typecheck`, `security-scan`, `policy-fil`, `reviewer-summary`

### D) `.claude/agents/<name>.md` (front‑matter skeleton)

```yaml
name: executor
tools: [Read, Write, Bash, git, jest, pytest, jscodeshift, libCST]  # minimal set
fil:
  allow: [FIL-0, FIL-1]
  block: [FIL-2, FIL-3]
locks:
  scope: path
  patterns: ["src/**", "packages/*/src/**"]
concurrency:
  maxParallel: 2
```

---

## Source Alignment (where this PRD draws from)

* **Reference Hub**: quick start, command/navigation standards
* **Clean‑Code Assessment**: dimensions, workflow, action plan & phases
* **Product Requirements**: scope, metrics, autonomy, throughput & SLAs
* **TDD Protocol**: RED→GREEN→REFACTOR, diff coverage & mutation gates, CI examples

---

