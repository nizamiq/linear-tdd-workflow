Your task is to create a Product Requirements Document (PRD) based on our previous discussion.
First, carefully review the discussion and reflect insightfully on the main points and ideas that were mentioned.
Next, use the template provided below to structure the PRD according to the required format.

```
# Agentic AI Coding Agent — Complete PRD (Template)

## Document Control
- Version: [v0.x]
- Owner: [Name/Team]
- Approvers: [Security Lead], [Platform Lead], [Compliance], [Product]
- Stakeholders: [IC Devs], [SRE], [QA], [DX], [Risk/Legal]
- Status: [Draft/Review/Approved]

<scope>
- In‑Scope: [Repos/Products], [Environments], [Languages]
- Out‑of‑Scope (Non‑Goals): [e.g., direct prod merges by agent, secret rotation]
</scope>

---

<context>

# 1) Overview
- **Problem**: [What engineering bottleneck are we solving?]
- **Who**: [IC devs, SREs, QA, Support Triage…]
- **Value**: [Quantify: MTTR ↓, PR cycle time ↓, % tests added ↑]
- **Autonomy Level (v1)**: [Plan‑only | Propose PR | Auto‑execute in sandbox with approvals]
- **Constraints**: GitHub‑first DevOps, **strict TDD**, enterprise security & compliance, **RBAC + multi‑tenancy**, **automated machine‑readable docs**.

# 2) Business Requirements (SMART)

## 2.1 Functional (SMART)
- **FR‑01 Stack Recommendation**
  - **S**: Generate an end‑to‑end technology stack proposal with 1 primary + 2 alternatives per layer (runtime, framework, data, infra, observability, security).
  - **M**: ≥90% recommendations include evidence & quantified trade‑offs (latency, cost, risk) in a PR.
  - **A**: Uses indexed internal ADRs/docs + public references (policy‑filtered).
  - **R**: Reduces decision churn; creates an ADR for each choice.
  - **T**: Per request, p95 total generation ≤ **45s**; PR created in one CI run.

- **FR‑02 PR‑First Delivery**
  - Agent produces **PRs** with: ADR(s), BoM table, control‑mapping matrix, test plan, rollback note.

- **FR‑03 Strict TDD Enforcement**
  - Every change includes failing tests first (red) → minimal patch (green) → refactor.
  - **M**: 100% PRs add/update tests proving value; CI blocks refactors lacking characterization tests.

- **FR‑04 Guarded Automation**
  - Agent may open/modify PRs, trigger sandbox tests, and generate artifacts; **cannot merge** to protected branches.

- **FR‑05 Security‑Aware Output**
  - For each stack item, include supply‑chain assurances (SBOM, signing/provenance), known CVEs, and recommended controls.

- **FR‑06 Change Impact**
  - Emit an impact analysis (affected repos/jobs/secrets) with accuracy ≥95% on first run.

## 2.2 Non‑Functional (SMART)
- **NFR‑01 Availability**: Recommender & gateway 99.9% monthly.
- **NFR‑02 Latency**: Plan generation p95 ≤ 45s; evidence compilation p95 ≤ 20s.
- **NFR‑03 Cost**: p95 inference cost per task ≤ configurable budget [$X].
- **NFR‑04 Observability**: 100% services instrumented with OpenTelemetry; missing‑telemetry budget ≤1%.
- **NFR‑05 Auditability**: 100% agent actions/tool calls/diffs logged, tamper‑evident, retained ≥90 days.
- **NFR‑06 Compliance Targets**: Map SDLC to NIST SSDF; app verification to OWASP ASVS L2+; supply chain targets SLSA L3.
- **NFR‑07 Docs Coverage**: ≥95% of public APIs/events have machine‑readable schemas; CI fails below threshold.
- **NFR‑08 RBAC Performance**: P99 authorization decision ≤ 25 ms at ≥500 RPS.
- **NFR‑09 Multi‑Tenancy Isolation**: Zero cross‑tenant data access enforced at app and DB (RLS) layers.

# 3) Core Features (Agentic)
For each feature, fill the following subsections.

### 3.x [Feature Name]
- **What it does**: [e.g., “Root‑cause failing tests, propose minimal patch.”]
- **Why it matters**: [metric impact]
- **How it works (Agent Loop)**:
  - *Perception*: [repo/code search, CI logs ingestion, doc retrieval]
  - *Reasoning*: [planner → executor → reviewer; reflective critique]
  - *Action Tools*: [code_search, code_patch, run_tests, sbom_generate, open_pr]
  - *Verification*: [diff bounds, unit tests, static analysis]
- **Guardrails & Approvals**: [write scope, required reviews, size limits]
- **Success Metrics**: [DoD for this feature]

# 4) User Experience
- **Personas**: Dev IC, Tech Lead, QA, SRE, Eng Manager, Security, Auditor.
- **Entry Points**: GitHub App (PRs/Issues), CLI, VS Code, Slack slash command.
- **Key Flows**:
  1) **Bugfix Flow**: invoke → plan → tests (red) → patch → tests (green) → PR with reasoning & risk.
  2) **Refactor Flow**: scope proposal → impact analysis → staged PRs + migration guide.
  3) **Recommendation Flow**: constraints in → ranked options → ADR PR + BoM + control mapping.
- **UX Considerations**: show plans/diffs/test logs; surface cost/latency/confidence; clear “undo”.

</context>

---

<PRD>

# 5) Technical Architecture (High‑Level)

## 5.1 Components
- **Orchestrator**: state machine for plan → act → verify; budgets & retries.
- **LLM Gateway**: provider plugins, tool mediation, redaction, quotas, validation.
- **Stack Recommender**: constraints → evidence → ranked options + ADRs.
- **Code Indexer**: embeddings + symbol graph; hybrid search.
- **Sandbox Runner**: ephemeral, no‑egress execution for tests/scans.
- **Policy & Compliance Engine**: RBAC/ReBAC decisions; SDLC control checks.
- **GitHub Integration**: PRs, Checks, branch protection, Environments, OIDC deploys.
- **Evidence/Audit Store**: artifacts (diffs, logs, SBOMs, attestation) with hashes.
- **Report UI**: PR annotations + portal for proposals, metrics, and audits.

## 5.2 Recommended Platform & BoM (fill)
| Layer | Primary Choice | Rationale | Alt #1 | Alt #2 |
|---|---|---|---|---|
| Language/Runtime | [Python 3.12] | [reason] | [TS/Node] | [Go] |
| Web/API | [FastAPI / Express] | [reason] | [Spring] | [NestJS] |
| Data | [Postgres 16] | [reason] | [MySQL] | [MongoDB] |
| Vector Search | [pgvector] | [reason] | [Qdrant] | [Weaviate] |
| Orchestration | [Temporal] | [reason] | [Airflow] | [Argo] |
| CI/CD | **GitHub Actions** | GitHub‑first | — | — |
| Security Scanning | **CodeQL / Dependabot / Secret scanning** | [reason] | — | — |
| SBOM/Prov | [Syft/Grype + Sigstore/Cosign] | [reason] | [CycloneDX tools] | — |
| Runtime | [Kubernetes + gVisor/Kata] | [reason] | [Nomad] | — |
| IaC/Policy | [Terraform/Helm + OPA] | [reason] | [Pulumi] | — |
| Telemetry | **OpenTelemetry** | [reason] | — | — |

## 5.3 Data Model (interface‑level)
- **Task**: `id, repo, branch, goal, constraints, budgets, owner, created_at`
- **Plan**: `steps[], tools[], approvals[], risk_score, compliance_targets`
- **Action**: `tool, params, observation, cost_tokens, duration_ms, status`
- **Artifact**: `{PR|SBOM|TEST_LOG|REPORT|DIFF}, uri, hash, created_at`
- **ControlMapping**: `standard, control_id, evidence_refs[]`
- **Auth**: `actor_id, tenant_id, roles[], groups[], scopes[]`

## 5.4 Tools (define as contracts; avoid impl)
- `code_search(query, scope) → {files[], snippets[], symbols[]}`
- `code_patch(file_path, unified_diff, rationale) → {patch_id, lines_changed, risk_level}`
- `run_tests(target, shard?, timeout) → {summary, failing[], artifacts_uri}`
- `sast_scan(profile) → {findings[], severity_histogram}`
- `sbom_generate(target) → {sbom_uri, packages[], licenses[]}`
- `open_pr(title, body, branch, reviewers[]) → {pr_number, links[]}`

## 5.5 Security & Compliance (design)
- **SSDLC**: PR gates for CodeQL, SCA, secret scanning; required reviews; change windows.
- **Supply Chain**: SBOM per build; signed artifacts; provenance attestations (SLSA target).
- **Data Protection**: PII/secrets redaction at sinks; tenant/key scoping; retention windows.

## 5.6 Observability
- **Traces/Metrics/Logs**: OTel SDKs everywhere; collector fan‑out.
- **Semantic Conventions**: include `tenant_id`, `org_id`, `actor_type`, `decision`, `policy_id`.
- **Dashboards**: plan latency, PR time‑to‑signal, flake rate, cost per task.

---

# 6) Development Roadmap (Scope only; no timelines)
- **Phase 0 — Foundations**
  - LLM Gateway, GitHub App (read‑only), Indexer, Sandbox Runner, OTel baseline, Evidence Store.
  - DoD: plan‑only comments on issues/PRs with budgets & rationale.

- **Phase 1 — PR Generator (Guarded Writes)**
  - Structured patches; unit tests in sandbox; PRs with risk summaries.
  - DoD: ≤300 LOC diffs, tests green, required checks pass, evidence attached.

- **Phase 2 — Reviewer & Policy**
  - Static analysis, license/SBOM checks, policy‑as‑code gates; multi‑language expansion.

- **Phase 3 — Autonomy within Guardrails**
  - Budgeted multi‑step refactors; staged PRs; limited CI re‑runs; artifact summarization.

- **Phase 4 — Scale & DX**
  - VS Code/Slack integrations; knowledge memory; cost optimization.

---

# 7) Logical Dependency Chain
1) **Guardrails before writes** → 2) **Index/search before planning** → 3) **Planning before patching** → 4) **Patching before testing** → 5) **Testing before PR** → 6) **Policy before autonomy** → 7) **Multi‑repo/CI orchestration**.

---

# 8) DevOps & TDD Policy (GitHub‑first)
- **Branch Protection**: required status checks (unit/component/CodeQL/SCA/secrets), required reviews, linear history; block direct pushes to `main`.
- **GitHub Actions**: reusable workflows: `plan.yml`, `test.yml`, `security.yml`, `sbom.yml`, `deploy.yml` (non‑prod); runners ephemeral; OIDC to cloud.
- **TDD Enforcement**: PR template fields (failing test link, minimal patch rationale, risk, rollback); CI blocks PRs with net‑zero test deltas.

**Acceptance (SMART)**
- 100% protected branches enforce checks.
- 100% PRs include new/updated tests or explicit “docs‑only” tag with lint gates.
- All security scans must be green for merge.

---

# 9) RBAC & Multi‑Tenancy (Enterprise‑grade)

## 9.1 Requirements (SMART)
- **TEN‑01**: No cross‑tenant data access (deny‑by‑default at service and DB). Tested in unit/integration/policy tests every PR.
- **RBAC‑01**: Roles with least privilege for: Platform Admin, Tenant Admin, Project Admin, Developer, Auditor, Agent. Permission matrix shipped & tested.
- **SSO/SCIM‑01**: Support OIDC/SAML SSO and SCIM 2.0 for lifecycle; IdP groups map to roles.
- **AUTHZ‑Perf**: P99 decision ≤ 25 ms at ≥500 RPS.
- **Audit‑01**: Immutable audit for all authZ decisions & admin actions; exportable to SIEM.

## 9.2 High‑Level Design
- **Identity**: External IdP (OIDC/SAML), SCIM sync for users/groups; tokens carry `tenant_id`, `roles`, `groups`.
- **Authorization**:
  - Coarse **RBAC** for platform/admin surfaces.
  - Fine‑grained **ReBAC** (Zanzibar‑style) for resources (SpiceDB/OpenFGA class).
  - **ABAC/policy** for sensitive ops (OPA/Rego or Cedar).
- **Data Isolation**:
  - Pooled Postgres with **Row‑Level Security (RLS)** using `tenant_id`; default‑deny policies.
  - Optional **cell‑based** (silo) for high‑isolation tenants.
- **Enforcement**: PDP/PEP split; gateway/service SDKs enforce; every decision logged.
- **Observability**: OTel with `tenant_id`, `resource`, `decision`, `latency_ms`.

## 9.3 Permission Matrix (Template)
| Role | Scope | Can Read | Can Write | Can Admin | Notes |
|---|---|---:|---:|---:|---|
| Platform Admin | All tenants | ✓ | ✓ | ✓ | Break‑glass only |
| Tenant Admin | Tenant | ✓ | ✓ | ✓ | No cross‑tenant |
| Project Admin | Project | ✓ | ✓ | — | Manage roles within project |
| Developer | Project | ✓ | PR‑only | — | No direct merges |
| Auditor | Tenant | ✓ | — | — | Export audit only |
| Agent (Service) | Project | ✓ (least) | PR‑only | — | Scoped tokens |

**Acceptance (SMART)**
- Deny‑by‑default checks for absent relationships.
- RLS enforced on 100% tenant tables; cross‑tenant test suite passes (all denied).
- AuthZ perf SLO verified in CI perf stage.

---

# 10) Mandatory Project Structure & Documentation (Agent‑Ready)

## 10.1 Repository Baseline
/ /apps|/services// /src /tests /docs # service-local docs; agent manifests live here /schemas # OpenAPI/JSON Schema/AsyncAPI/GraphQL SDL /infra # Terraform/k8s manifests (policy-tested) /.github/workflows # CI (TDD, SAST, SCA, docs build, SBOM, attestations) /docs # portal docs (MkDocs Material; cross-links to schemas/ADRs) /adr # Architecture Decision Records (MADR format) CODEOWNERS CONTRIBUTING.md SECURITY.md LICENSE README.md
## 10.2 Machine‑Readable Contracts (required)
- **HTTP APIs**: OpenAPI **3.1** (JSON/YAML) with JSON Schema **2020‑12**.
- **Async/Event APIs**: **AsyncAPI 3.x** for topics/queues, bindings, payloads.
- **GraphQL (if used)**: publish SDL; enable introspection for trusted clients.
- **Agent Tools**: **Model Context Protocol (MCP)** tool descriptors for every tool/action the agent exposes (discovery, parameters, scopes).
- **Observability**: OTel semantic attributes documented; `tenant_id`, `org_id`, `actor_type`, `policy_id` required where relevant.

## 10.3 Docs Automation (Docs‑as‑Code)
- **Portal**: MkDocs Material builds on PR and main; previews per PR.
- **API Reference**: Redoc/Redocly generate from OpenAPI 3.1.
- **Versioning**: Conventional Commits → SemVer releases; changelog generated.
- **Drift Control**: CI lints schemas; breaking‑change detector; doc build failure blocks merge.

**Acceptance (SMART)**
- ≥95% public endpoints/events documented (CI gate).
- 100% services publish OpenAPI/AsyncAPI/GraphQL (as applicable) + MCP manifests.
- PRs produce docs previews; broken links & schema lint fail.

---

# 11) Evaluation & Metrics
- **Success Metrics**: Time‑to‑Meaningful‑Edit (TME), % tasks solved, regression rate @7/30 days, cost per successful task, PR cycle time, test coverage delta.
- **Golden Task Suite**: Replayed issues/PRs; synthetic failing tests; dependency upgrades.
- **Test Strategy**:
  - Unit: planner, tool contracts, authZ relationships/policies (allow/deny), RLS cross‑tenant denial.
  - Contract: OpenAPI/AsyncAPI/SDL against running services; schema drift.
  - Agent: MCP discovery/invocation; tool signature stability.
  - Security: CodeQL, secret scanning, SCA; SBOM/provenance presence.
  - Performance: authZ P99 ≤ 25 ms; indexing latency; plan p95 ≤ 45s.

---

# 12) Risks & Mitigations
- **Prompt/Tool Injection** → Tool allowlists, output validation, offline/no‑egress sandboxes, human gate.
- **Over‑broad Diffs** → Hard diff limits; staged PRs; mandatory review.
- **Flaky/Slow Tests** → Sharding, retries, flake quarantine; fail‑fast thresholds.
- **Model Cost/Latency Spikes** → Budgets, caching, small‑model routing.
- **Compliance Drift** → Control‑matrix updated via PR; CI policy checks on controls.
- **RLS Foot‑guns** → Default‑deny policies; enforced `tenant_id` binding in DB sessions; migration linters.

---

# 13) Acceptance Criteria (Global)
- A constraints request (“GitHub‑first, strict TDD, enterprise compliance, RBAC/multi‑tenancy”) yields a PR with: BoM, ranked options & trade‑offs, ADR(s), control‑mapping matrix, TDD plan, rollback note — within the defined latency budgets.
- Merge blocks enforced: tests green, CodeQL/SCA/secret scans pass, docs build and schema lint pass.
- OTel telemetry present for 100% components; dashboards show SLOs and per‑task cost.
- RBAC & RLS tests verify deny‑by‑default and cross‑tenant isolation.

---

# 14) Appendix

## 14.1 Compliance Mapping (template)
| Standard | Control Focus | Evidence Source |
|---|---|---|
| NIST SSDF 800‑218 | Secure SDLC | PR checks, policy files, ADRs |
| OWASP ASVS L2+ | App security verification | Test plans, PR checklists, SAST results |
| SLSA (target L3) | Supply‑chain integrity | SBOMs, signed provenance, verification logs |

## 14.2 ADR Template (MADR)
- Title/ID/Status/Date/Decision Drivers/Considered Options/Decision/Pros & Cons/Consequences/Links.

## 14.3 PR Templates (checklist)
- ☐ Failing test link(s)  
- ☐ Minimal patch summary  
- ☐ Risk summary + rollback plan  
- ☐ Security scan status  
- ☐ Docs & schema updates (OAS/AsyncAPI/SDL/MCP)  
- ☐ Control mapping updated

## 14.4 Glossary
- **ADR** (Architecture Decision Record), **MCP** (Model Context Protocol), **RLS** (Row‑Level Security), **ReBAC** (Relationship‑based Access Control), **SLO/SLA**, **SBOM**, **SLSA**.

</PRD>

**How to use this template**
	1	Duplicate it into /architecture/PRD.md (or your docs portal).
	2	Fill the bracketed fields/tables; delete any not applicable sections.
	3	Wire the **acceptance checks** (CI gates) before work begins so success is measurable from day one.
```

Please ensure the PRD is comprehensive, clear, and accurately reflects the discussion points.

