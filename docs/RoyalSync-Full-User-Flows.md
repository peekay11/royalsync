# RoyalSync — Complete User Flows, Roles, Actions & Data Reference

**Royal Square Financial Platform**
Full behavioural specification: every actor, every screen, every button, every action, and the data behind each.

---

## Table of Contents

1. [The Actors (Who Uses the System)](#1-the-actors)
2. [Portal & URL Map](#2-portal--url-map)
3. [Global Concepts (apply everywhere)](#3-global-concepts)
4. [CLIENT PORTAL — Full Flow](#4-client-portal)
5. [ADMIN PORTAL — Full Flow (Advisers & Staff)](#5-admin-portal)
6. [SUPER ADMIN PORTAL — Full Flow (Leadership)](#6-super-admin-portal)
7. [INSURER ONBOARDING PORTAL — Full Flow](#7-insurer-portal)
8. [Cross-Portal Journey: One Application, End to End](#8-cross-portal-journey)
9. [Master Data Dictionary](#9-master-data-dictionary)
10. [Status Lifecycles (State Machines)](#10-status-lifecycles)
11. [Notification Triggers Matrix](#11-notification-triggers)
12. [Button & Action Reference (Every Button)](#12-button--action-reference)

---

## 1. The Actors

Everyone who touches the system, what they are, and where they log in.

| # | Actor | Portal | What they are | Typical daily job |
|---|-------|--------|---------------|-------------------|
| 1 | **Guest / Prospect** | Sales page | Not registered. Just enquiring. | Fills a short form, gets a magic link. |
| 2 | **Client** | Client Portal | An insured person or household. | Views policies, pays, claims, asks AI, sets goals. |
| 3 | **Sales Agent** | Admin Portal | Front-line lead handler. | Captures leads, starts applications, books consultations. |
| 4 | **Adviser** | Admin Portal | Licensed FAIS representative. | Gives advice, builds ROA, inceptions policies. |
| 5 | **Case Manager** | Admin Portal | Claims & servicing specialist. | Runs claims, liaises with insurers, updates clients. |
| 6 | **Branch Manager** | Admin Portal | Runs a branch/team. | Assigns work, watches SLAs, reads commission reports. |
| 7 | **Compliance Officer** | Admin Portal | POPIA/FAIS/FICA guardian. | Audits ROAs, KYC gaps, consent, flags issues. |
| 8 | **Super Admin** | Super Admin Portal | Royal Square leadership / platform owner. | IAM, config, tenants, insurers, analytics, audit. |
| 9 | **Insurer User** | Insurer Portal | External partner (e.g. Santam rep). | Maintains profile, product catalogue, answers quotes. |
| 10 | **System / AI** | (background) | Automated actor. | Sends reminders, runs AI, routes integrations, writes audit rows. |

Every action in the system is performed by one of these actors and is written to the **audit log** with `actor_id`, `actor_type`, timestamp, and before/after state.

---

## 2. Portal & URL Map

| Portal | URL | Who logs in | Auth strength |
|--------|-----|-------------|---------------|
| Sales / Lead | `royalsquare.co.za` | Guests | None (guest session token) |
| Client Portal | `app.royalsquare.co.za` | Clients | Password + optional MFA. PWA, offline-capable. |
| Admin Portal | `admin.royalsquare.co.za` | Staff (agents→managers) | Password + mandatory MFA. |
| Super Admin | `superadmin.royalsquare.co.za` | Leadership | Password + mandatory MFA + IP allowlist + Zero Trust. |
| Insurer Portal | `partners.royalsquare.co.za` | Insurer users | Password + MFA. |

Each portal is a **separate authentication boundary**. The same email can never cross portals without a fresh login. JWTs carry an `aud` (audience) claim scoping them to one portal.

---

## 3. Global Concepts

These apply in every portal.

### 3.1 The universal top bar
Present on every screen:

| Element | What it does |
|---------|--------------|
| **Logo (left)** | Click → go to that portal's dashboard/home. Shows tenant branding. |
| **Search (Cmd/Ctrl+K)** | Opens universal search overlay. Navigation + Data + Action results. |
| **Notification bell** | Badge = unread count. Click → notification panel. |
| **Language switcher** | Globe icon. Changes UI language instantly (13 languages). |
| **Accessibility (Cmd/Ctrl+Shift+A)** | Opens accessibility panel (colour, text size, motion, screen reader). |
| **Profile avatar (right)** | Menu: Profile, Settings, Switch language, Help, **Log out**. |

### 3.2 Universal search behaviour
- **Navigation results** — jump to any screen (<50ms, local index).
- **Data results** — find a record (policy, client, claim, document). Fuzzy-matched; tolerates typos.
- **Action results** — do something directly ("update bank details", "report accident").
- Recent searches and quick actions show before typing.
- Works offline for cached/navigation results.

### 3.3 Every list screen has the same controls
Wherever a table or list of records appears:

| Control | Behaviour |
|---------|-----------|
| Search box | Filters the list live. |
| Column filters | Filter by status, date range, type, owner. |
| Sort | Click column header to sort asc/desc. |
| Pagination / infinite scroll | Virtualised for large lists (1,000+ rows). |
| Row click | Opens the record detail. |
| Bulk select (checkboxes) | Enables bulk actions (notify, assign, export) — permission-gated. |
| Export button | CSV/PDF export — permission-gated, written to audit log. |

### 3.4 Every form behaves the same
- Auto-saves as a draft every 3 seconds.
- Never clears values on a validation error.
- Shows the error next to the offending field **and** a summary at top.
- Shows format hints ("e.g. 9001015009087").
- Chunked, resumable file uploads — a network drop resumes, no re-selection.
- A "Save & continue later" option on multi-step wizards.

---

## 4. CLIENT PORTAL

`app.royalsquare.co.za` — the insured person's experience.

### 4.0 Entry point A — Brand new prospect (Guest → Client)

**Screen: Sales landing page (`royalsquare.co.za`)**

| Element | Action / Result |
|---------|-----------------|
| "Get a quote" button | Opens the **short onboarding wizard** (guest — no account). |
| "I was referred" link | Opens same wizard, pre-fills referral code from URL param. |
| "Log in" link | Goes to Client Portal login. |

**Short onboarding wizard (guest session, auto-saved server-side):**

| Step | What the guest enters | Data captured |
|------|----------------------|---------------|
| 1. Insurance type | Picks: Motor / Home / Life / Funeral / Medical Gap / Business / Travel | `interest_type` |
| 2. Basic details | First name, last name, mobile | `first_name, last_name, mobile` |
| 3. About the risk | E.g. for motor: vehicle make/model/year; for home: property type/suburb | `risk_details JSON` |
| 4. Email capture | Email address | `email` |
| 5. Confirmation | "Check your inbox — we've sent you a link to finish." | Magic link issued |

**What happens behind the scenes:**
- A `lead` record is created; a guest session UUID stored in browser + server.
- A **magic link** email is sent (one-time token, 7-day expiry, single-use).
- The lead appears instantly on the **Admin Portal** lead pipeline (Sales Agent sees it).

**Screen: Magic link clicked → Account activation**

| Element | Action / Result |
|---------|-----------------|
| "Set your password" field | Client sets a real password (min 12 chars). |
| Confirm password | Must match. |
| "Activate account" button | Creates the `user` + `client` records, pre-loads all wizard data, logs them in. |
| (Expired link case) | Shows "Link expired" + "Send me a new link" button. |
| (Already used case) | Redirects to login with "This link was already used — please log in." |

### 4.0 Entry point B — Client created by an adviser
An adviser can create a client in the Admin Portal. The client receives a **welcome email** with a magic link to set their password. Same activation screen as above.

### 4.1 Client login

**Screen: Login**

| Element | Action / Result |
|---------|-----------------|
| Email field | — |
| Password field | — |
| "Remember me" checkbox | 30-day session vs 8-hour session. |
| "Log in" button | Validates. If MFA enabled → MFA step. Else → Dashboard. |
| "Forgot password" link | Sends reset email (one-time token). |
| MFA step (if enabled) | 6-digit TOTP from authenticator app, or SMS OTP. |
| Failed attempts | 5 fails → 15-minute lockout + alert to client email. |

### 4.2 Client navigation (the tabs they see)

| Tab | Icon | Purpose |
|-----|------|---------|
| Dashboard | home | Snapshot of everything. |
| Insurance | shield | All policies. |
| Claims | file-text | Claims and their status. |
| Goals | target | Financial goals & progress. |
| Documents | folder | All documents. |
| Payments | banknote | Payments, mandates, balances. |
| AI Insights | message-circle | The AI assistant. |
| Profile | user | Personal details, dependants, bank. |
| Settings | settings | Notifications, security, language, accessibility. |

### 4.3 Dashboard — what the client sees

**Cards shown (top to bottom):**

| Card | Data displayed | Buttons / actions |
|------|----------------|-------------------|
| **Welcome + alerts** | "Good morning, Sipho." Any urgent alerts (payment failed, KYC expiring, claim update). | Each alert has a CTA (e.g. "Update payment"). |
| **Cover summary** | Total number of active policies; total monthly premium (R). | "View all insurance" → Insurance tab. |
| **Net worth** | Assets − liabilities = net worth (R). Small trend chart. | "See breakdown" → opens detail. |
| **Upcoming payments** | Next debit date, amount, account. | "Change bank details" (starts change request). |
| **Active claims** | Any open claim with status. | "View claim" → Claims tab. |
| **Goals progress** | Top goal with progress bar. | "View goals" → Goals tab. |
| **Ask AI prompt** | "Have a question? Ask your assistant." | Opens AI Insights. |

**Data behind the dashboard:**

| Field | Source table | Notes |
|-------|--------------|-------|
| active_policy_count | policies | status = active |
| total_monthly_premium | policies | SUM(premium_amount) |
| total_assets | client_assets | SUM(value) |
| total_liabilities | client_liabilities | SUM(outstanding) |
| net_worth | (computed) | assets − liabilities |
| next_debit_date/amount | policies / debicheck_mandates | earliest upcoming |
| open_claims | claims | status NOT IN (closed, rejected) |

### 4.4 Insurance tab

**List view — each policy card shows:**

| Field | Example |
|-------|---------|
| Provider + product | "Santam Comprehensive Motor" |
| Policy number | SAN-2024-GG-1234567 |
| Status badge | ✅ In force / ⚠️ Lapsed / ⏳ Pending |
| Premium | R 1,365/month |
| Renewal date | 01 Mar 2027 |
| OUTbonus (if applicable) | "3 claim-free years" |

**Buttons on the list:** `View policy` · `Report a claim` · `Request document` · `Ask AI about this policy`

**Policy detail screen shows:**

| Section | Data |
|---------|------|
| Overview | Provider, policy number, status, inception, renewal, premium, premium model |
| Insured items | Vehicles / property / lives covered — each with details |
| Cover & limits | Cover type, sum insured, excess, section limits |
| Endorsements | Car hire, key replacement, tyre & rim, credit shortfall, etc. |
| Assistance benefits | Roadside, home emergency, medical assist |
| Schedule history | Every version of the policy schedule (dated) |
| Commission disclosure | FAIS-required commission % shown for transparency |
| Documents | Policy schedule, wording, certificate — download each |

**Buttons on detail:** `Download schedule` · `Report a claim` · `Request endorsement change` · `Contact my adviser` · `Ask AI`

### 4.5 Claims tab

**List — each claim shows:** claim ref, type, status, incident date, insurer.

**"Report a claim" flow (wizard):**

| Step | Client enters | Data |
|------|---------------|------|
| 1. Pick policy | Which policy the claim is against | `policy_id` |
| 2. What happened | Incident type, date, time, description | `incident_type, incident_date, description` |
| 3. Where | Location / address | `location` |
| 4. Evidence | Upload photos, docs (chunked, resumable) | `claim_documents[]` |
| 5. Third parties | Other drivers/parties involved (optional) | `claim_third_parties[]` |
| 6. Review & submit | Confirm & e-sign declaration | Creates `claim`, status = `submitted` |

**Claim detail screen shows:** status timeline, assessor details, updates feed (pushed by Case Manager / insurer), documents, settlement info.

**Buttons:** `Add document` · `Message my adviser` · `View settlement letter` (when available).

### 4.6 Goals tab

| Element | Data / action |
|---------|---------------|
| Goal list | Each goal: title, type, target amount, current, progress bar, on-track/at-risk badge. |
| "Add goal" | Wizard: goal type (retirement, education, emergency, house, custom), target amount, target date. |
| Goal detail | Contributions history, projection chart, linked policies/products. |
| "Contribute" | Log/allocate a contribution. |
| "Ask AI about this goal" | Opens AI scoped to that goal. |

### 4.7 Documents tab

| Element | Data / action |
|---------|---------------|
| Document list | Name, type, linked policy, date, size. |
| Filters | By type (schedule, wording, certificate, ID, proof of address, claim doc, ROA). |
| "Upload" | Chunked upload; pick type + link to a policy/claim. |
| Row buttons | `Download` · `Share` (secure link) · `Delete` (soft delete only). |
| "Request a document" | Ask adviser for a specific doc (border letter, tax cert, etc.). |

### 4.8 Payments tab

| Section | Data | Actions |
|---------|------|---------|
| Balance / owed | Any outstanding amount, next debit. | — |
| Payment history | Date, amount, status (collected/failed/reversed), account. | `Download statement` |
| DebiCheck mandates | Active mandates, sponsoring bank, collection day. | `View mandate` |
| Bank accounts | Accounts on file (masked). | `Add account` · `Change primary` (triggers change request → notifies Royal Square) |
| Failed collection | If a debit failed: reason + retry info. | `Retry now` · `Update bank details` |

**Important:** Editing bank/payment details **notifies Royal Square (admin)** and may require re-authorising a DebiCheck mandate.

### 4.9 AI Insights tab

| Element | Behaviour |
|---------|-----------|
| Chat input | Natural language: "How much am I paying for my wife?" |
| Suggested prompts | "What's my net worth?", "Am I covered for hail?", "How much do I owe?" |
| Response | Rendered from AI JSON — icon, colour, metrics, tables, callouts. Never plain text. |
| Source citations | Where a policy answer comes from (document + section). |
| "Speak to my adviser" | Escalates — creates an adviser alert with context. |
| Voice input/output | Optional (accessibility) — speak your question, hear the answer. |

**How the AI answers (two-stage):** structured DB query for numbers (no hallucination) + vector search over policy documents for wording questions. PII is stripped before anything reaches the model.

### 4.10 Profile tab

| Section | Data | Editable? |
|---------|------|-----------|
| Personal | Name, ID/passport (masked), DOB, gender, marital status | Some fields require adviser approval (ID). |
| Contact | Mobile, email, addresses | Yes (change logged). |
| Dependants | Spouse, children — name, relationship, DOB | Yes. |
| Employment | Employer, occupation, income | Yes. |
| Financial profile | Assets, liabilities, income/expenses | Yes (feeds net worth & FNA). |
| Beneficiaries | For life/funeral policies | Yes (change logged, may notify insurer). |

### 4.11 Settings tab

| Group | Options |
|-------|---------|
| **Notifications** | Per-channel toggles: WhatsApp, Email, SMS, In-app. Per-event: renewals, payments, claims, marketing (POPIA consent). |
| **Security** | Change password, enable/disable MFA, view active sessions, log out other devices. |
| **Language** | 13 languages. |
| **Accessibility** | Colour-blind mode, text size, high contrast, reduced motion, dyslexia font, screen-reader mode, voice. |
| **Privacy (POPIA)** | View consents, withdraw consent, request data export, request erasure. |

---

## 5. ADMIN PORTAL

`admin.royalsquare.co.za` — used by Sales Agents, Advisers, Case Managers, Branch Managers, Compliance Officers. What each person sees is **permission-gated** by their group.

### 5.1 Admin login
Password + **mandatory MFA**. Optional IP allowlist (office only). Session 8 hours. Same lockout rules.

### 5.2 Admin navigation (full menu — items appear only if permitted)

| Menu item | Sales Agent | Adviser | Case Mgr | Branch Mgr | Compliance |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leads / Pipeline | ✅ | ✅ | — | ✅ | — |
| Clients | own | own | branch | branch | tenant (read) |
| Applications | ✅ | ✅ | — | ✅ | read |
| Policies | read | ✅ | read | branch | read |
| Claims | — | ✅ | ✅ | branch | read |
| Tasks | own | own | own | branch | — |
| Templates | use | use | use | use | read |
| Notifications | send | send | send | send | — |
| Reports | own | own | own | branch | compliance |
| Commissions | — | own | — | branch | read |

### 5.3 Admin Dashboard

**Widgets:**

| Widget | Data | Action |
|--------|------|--------|
| My tasks today | Count + list of due/overdue tasks. | Click → task. |
| SLA breaches | Anything past its SLA (claims with no update, quotes overdue). | Click → record. |
| New leads | Fresh leads assigned to me / unassigned pool. | "Claim lead" / "Open". |
| Applications in progress | Pipeline by stage. | Click → application. |
| Recent client activity | Clients who logged in, submitted, edited payment. | Click → client. |
| Alerts | KYC expiring, renewals due, failed payments among my clients. | CTA per alert. |

### 5.4 Leads / Pipeline

**Kanban board columns:** `New → Contacted → Qualified → Application started → Quoted → Won / Lost`

| Element | Data | Action |
|---------|------|--------|
| Lead card | Name, interest type, source (referral/sales page/call), age of lead. | Drag between columns; click to open. |
| Lead detail | All captured wizard data, contact history, notes. | `Call` · `WhatsApp` · `Email` · `Convert to client` · `Start application` · `Mark lost` (with reason). |
| "Add lead manually" | For phone-in enquiries. | Creates lead + optional magic link to client. |

### 5.5 Clients

**Client list:** search by name, ID, phone, policy number, email. Columns: name, ID, adviser, # policies, KYC status, risk profile.

**Client detail — tabs the adviser sees:**

| Tab | Data | Key actions |
|-----|------|-------------|
| Overview | Contact, demographics, adviser, KYC status, risk. | `Edit` · `Send message` · `Impersonate view` (permissioned) |
| Policies | All the client's policies. | `New application` · `Endorse` · `Renew` |
| Applications | In-flight applications. | `Continue` · `Send to insurers` |
| Claims | All claims. | `Open claim` · `Add update` |
| Financials | Assets, liabilities, income, net worth. | `Edit` · `Run FNA` |
| KYC | Documents, verification status, expiry, PEP/sanctions result. | `Upload doc` · `Verify` · `Re-screen` |
| Documents | Everything on file. | `Upload` · `Send to client` |
| ROA / Advice | Records of Advice (signed & draft). | `New ROA` · `View` |
| Notes / Timeline | Every interaction + audit trail. | `Add note` |
| Commissions | (Adviser) commission on this client's policies. | — |

### 5.6 Applications (the core money-making flow)

**Application detail — stages & buttons:**

| Stage | What admin does | Buttons |
|-------|-----------------|---------|
| Draft | Complete needs analysis, confirm client data, check KYC. | `Validate KYC` · `Complete FNA` |
| Ready to quote | Choose insurers + a template (built by Super Admin). | `Select insurers` · `Choose template` · `Send to insurers` |
| Awaiting quotes | Watch responses arrive via Integration Gateway. | `View responses` · `Chase insurer` |
| Compare | Scoring engine ranks options (6 dimensions). Annotate "Why recommended". | `Edit recommendation` · `Add note` · `Send to client` |
| Client deciding | Client reviews in their portal; can open AI chat per insurer. | (read-only, monitor) |
| Selected | Client picked an option, e-signed, gave bank details. | `Confirm with insurer` |
| Inception | Confirm start date; receive & store schedule. | `Incept policy` · `Upload schedule` |
| Live | Policy created in client portal; client notified. | `View policy` |

**Data captured on an application:**

| Field | Notes |
|-------|-------|
| application_id, client_id, product_type | |
| needs_analysis JSON | Answers from FNA wizard |
| selected_insurers[] | Which insurers were sent the request |
| template_id | Which quote-request template was used |
| responses[] | Each insurer's quote (normalised canonical format) |
| recommendation JSON | Scores + adviser's "why recommended" text |
| client_selection | Chosen option + timestamp |
| signed_documents[] | ROA, terms, mandate |
| status | See lifecycle §10 |

### 5.7 Claims (Case Manager)

| Element | Data | Action |
|---------|------|--------|
| Claim list | ref, client, policy, insurer, status, days since update. | Filter by status/SLA. |
| Claim detail | Full incident data, documents, third parties, assessor. | `Notify insurer` · `Assign assessor` · `Add update` (pushes to client) · `Upload document` · `Record settlement` · `Close claim` · `Reopen`. |
| Update feed | Every status change, who made it, when. | `Add update` → client gets WhatsApp/email/in-app. |

### 5.8 Tasks

| Element | Data | Action |
|---------|------|--------|
| Task list / board | Title, linked client, due date, priority, status. | `Complete` · `Reassign` · `Comment` · `Snooze`. |
| Task templates | Pre-built (KYC renewal, annual review, claim follow-up). | Auto-created by system on triggers. |
| "New task" | Manual task creation, assign to self or colleague. | |

### 5.9 Templates
Advisers **use** templates; Super Admin **creates** them.

| Type | Use |
|------|-----|
| Quote request | Sent to insurers; auto-fills client data. |
| Client letters | Border letters, welcome, renewal notices. |
| Document requests | Standard lists of docs needed per product. |

Button: `Use template` → auto-populates with the current client's data → review → send.

### 5.10 Notifications (outbound)

| Element | Action |
|---------|--------|
| Compose | Pick channel (WhatsApp/Email/SMS/in-app), recipient(s), template or free text. |
| Bulk send | Select multiple clients (respecting consent) → send. |
| Scheduled | Queue for later. |
| History | Delivery status per message (sent/delivered/read/failed). |

### 5.11 Reports

| Report | Contents |
|--------|----------|
| Portfolio | Policies by type, provider, value; growth over time. |
| Commission | Earned, pending, clawed-back; by adviser/branch. |
| KYC | Verified / expiring / expired counts; who needs action. |
| SLA performance | Quote turnaround, claim update timeliness. |
| Renewals | What's coming up in 30/60/90 days. |
| Lead conversion | Funnel by source and agent. |

Every report: `Export CSV` · `Export PDF` (audit-logged).

---

## 6. SUPER ADMIN PORTAL

`superadmin.royalsquare.co.za` — leadership + platform owner. Password + MFA + IP allowlist + Zero Trust.

### 6.1 Super Admin navigation

| Menu | Purpose |
|------|---------|
| Dashboard | Whole-business health. |
| IAM | Users, groups, permissions, security policies. |
| Compliance | ROA/KYC/consent oversight across the tenant. |
| Analytics | Revenue, portfolio, adviser performance. |
| Tenants | (Platform mode) manage broker tenants, modules, branding. |
| Insurers | Approved insurer list & integration status. |
| Templates | Create/edit/publish all templates. |
| System Config | Notification settings, AI config, module toggles. |
| AI Management | Document corpus, model config, conversation logs. |
| Integration Health | Gateway status, dead-letter queue, retries. |
| Audit Log | Immutable full-platform trail. |

### 6.2 IAM — the control centre

**Users screen:**

| Element | Data | Action |
|---------|------|--------|
| User list | Name, email, group, branch, status, last login. | `Create user` · `Edit` · `Deactivate` · `Reset MFA` (two-person). |
| Create user wizard | Name, email, user type, branch, **assign a group**, optional individual overrides. | Sends welcome/magic link. |
| User detail | Group + permission checkboxes (individual overrides shown as deltas). | Toggle any permission; sensitive ones need two-person sign-off. |

**Groups screen:**

| Element | Data | Action |
|---------|------|--------|
| Group list | Sales Agent, Adviser, Case Manager, Branch Manager, Compliance, Super Admin, + custom. | `Create group` · `Edit`. |
| Group editor | The full permission matrix: **Resource × Action × Scope**. Check what this group can do. | Save; applies to all members. |
| "Create group like Sales" | Clone + adjust — e.g. make a "Telesales" group with narrower rights. | |

**Permission matrix dimensions:**
- **Resources:** clients, policies, claims, documents, tasks, users, reports, templates, iam, audit_log, financial_data, commissions.
- **Actions:** view, create, edit, delete, export, plus resource-specific (inception, endorse, assign, publish, impersonate…).
- **Scopes:** own · branch · tenant · global.

**Security Policies screen:**

| Policy | Configurable |
|--------|--------------|
| MFA requirement | Per user type. |
| Session duration | Admin vs client. |
| Password policy | Length, complexity. |
| IP allowlist | Restrict portals to office IPs. |
| Login lockout | Attempts + lockout duration. |
| Concurrent sessions | Max per user. |

**Two-person sign-off** — these actions require a second Super Admin to approve (held 24h, either can cancel): delete/archive client, bulk PII export, modify another super admin, deactivate user with active policies, reset MFA, change bank mandate outside consent flow, access one user's audit trail.

### 6.3 Compliance oversight

| Widget | Data | Action |
|--------|------|--------|
| ROA status | Signed vs missing per policy sold. | Drill to gaps. |
| KYC gaps | Clients with expired/missing KYC. | Assign remediation tasks. |
| Consent register | POPIA consents per client, withdrawals. | Export. |
| FICA screening | PEP/sanctions hits, risk scores. | Review flagged. |
| Breach log | POPIA breach incidents + 72h notification tracker. | Manage incident. |

### 6.4 Analytics

Revenue (premium under advice, commission), portfolio health, adviser leaderboards, lapse/retention rates, product mix, insurer distribution, lead conversion — all filterable by branch and period.

### 6.5 Insurers (approved list)
Add/approve insurers, view integration method & health, link to their profile submitted via the Insurer Portal, enable/disable them for quoting.

### 6.6 System Config & AI Management
- Global templates (create/publish).
- Notification defaults & channel credentials.
- Module toggles per tenant (plug-and-play).
- AI: document corpus per insurer, model/version config, temperature, view/search all AI conversation logs (FAIS retention).

### 6.7 Integration Health
Live status of every insurer connection, queue depth, retries, **dead-letter queue** (failed messages needing manual intervention) with a "reprocess" action.

### 6.8 Audit Log
Immutable, INSERT-only, partitioned by month. Filter by actor, action, resource, date. Export (two-person for a specific user's trail, to protect privacy).

---

## 7. INSURER PORTAL

`partners.royalsquare.co.za` — external insurers self-onboard and respond to quotes.

### 7.1 Insurer onboarding flow
Royal Square sends an invite link when an insurer wants to be listed.

| Step | Insurer provides | Data |
|------|------------------|------|
| 1. Company profile | Legal name, FSP number, contacts, logo, description of services. | `insurer_profile` |
| 2. Products | Catalogue: product types, cover types, terms, pricing guides, wording docs. | `insurer_products[]` |
| 3. Document requirements | What docs they need from clients per product (e.g. driver's licence, proof of no-claim). | `required_documents[]` |
| 4. Signatures / forms | Standard forms & any required signatures. | `insurer_forms[]` |
| 5. Integration setup | How to receive requests: REST API keys / SFTP creds / email routing. | `integration_config` |
| 6. Submit for approval | Sent to Super Admin for review. | status = `pending_approval` |

### 7.2 Insurer daily use

| Screen | Data | Action |
|--------|------|--------|
| Inbox | New quote requests from Royal Square (canonical format). | `Open request`. |
| Request detail | Client risk data (only what's needed — minimised PII), requested cover. | `Submit quote` · `Decline` (with reason) · `Counter-offer`. |
| Submit quote form | Premium, excess, terms, validity period, endorsement options. | Returns to gateway → normalised → admin notified. |
| Profile | Maintain company info & products. | `Edit`. |
| Messages | Notifications/new requirements pushed from Royal Square. | Reply. |

**Data minimisation:** the insurer only sees the fields necessary to quote — not full PII, not bank details.

---

## 8. Cross-Portal Journey: One Application, End to End

Follow a single motor policy from enquiry to live, showing which actor acts in which portal.

| # | Actor | Portal | Action | Resulting data / event |
|---|-------|--------|--------|------------------------|
| 1 | Guest | Sales page | Fills quote wizard, gives email | `lead` created; magic link sent |
| 2 | System | — | Sends magic link; posts lead to pipeline | Notification + `lead` visible to Sales |
| 3 | Sales Agent | Admin | Sees new lead, calls, qualifies | `lead.status = qualified`; note added |
| 4 | Guest→Client | Client | Clicks link, sets password, activates | `user` + `client` created; wizard data loaded |
| 5 | Client | Client | Completes application details, uploads docs, e-signs consent | `application.status = draft→ready_to_quote` |
| 6 | System | — | Alerts adviser: new application | Adviser notification |
| 7 | Adviser | Admin | Validates KYC, runs FNA, picks 3 insurers + template | KYC checked; `selected_insurers[]` set |
| 8 | Adviser | Admin | Sends to insurers | Gateway queues 3 requests (REST/SOAP/email) |
| 9 | Insurer users | Insurer | Receive requests, submit quotes | 3 `responses[]` normalised to canonical |
| 10 | System | — | Notifies adviser each quote arrived | Adviser sees comparison |
| 11 | Adviser | Admin | Reviews scores, writes "why recommended", sends to client | `recommendation` set; client notified |
| 12 | Client | Client | Compares options; opens AI chat on one insurer to ask a question | AI conversation logged w/ citations |
| 13 | Client | Client | Selects option, e-signs ROA + terms, enters bank details, picks start date | `client_selection` + signed docs + mandate |
| 14 | System | — | Notifies adviser of selection; sets up DebiCheck | `application.status = selected` |
| 15 | Adviser | Admin | Confirms with insurer, receives schedule | `policy` created; schedule stored in R2 |
| 16 | System | — | Policy goes live in client portal; welcome sent | `policy.status = active`; client notified |
| 17 | System | — | Creates recurring tasks: renewal (−60d), annual review, KYC expiry | `tasks[]` scheduled |

Later servicing (any time): client edits bank details → **notifies Royal Square** → adviser re-authorises mandate. Client reports a claim → Case Manager runs the claims flow (§5.7) → updates pushed to client (§4.5).

---

## 9. Master Data Dictionary

The core record types and their key fields. (All tables also carry `tenant_id`, `created_at`, `updated_at`, `deleted_at`.)

### 9.1 Identity & Access
| Table | Key fields |
|-------|-----------|
| users | id, email, password_hash, user_type (client/staff/super_admin), mfa_secret, last_login_at, accessibility_prefs |
| groups | id, name, description |
| permissions | id, resource, action, scope |
| group_permissions | group_id, permission_id |
| user_groups | user_id, group_id |
| user_permission_overrides | user_id, permission_id, grant/revoke |
| user_sessions | id, user_id, device, ip, created_at, expires_at |

### 9.2 Org
| Table | Key fields |
|-------|-----------|
| branches | id, name, region |
| adviser_profiles | user_id, fsp_rep_number, licence_categories, supervisor_id |

### 9.3 Client CRM
| Table | Key fields |
|-------|-----------|
| clients | id, user_id, id_number (enc), first_name, last_name, dob, gender, marital_status, mobile, risk_profile, kyc_status, referral_code, referred_by, assigned_adviser_id |
| client_addresses | client_id, type, line1, suburb, city, province, postal_code |
| client_bank_accounts | client_id, bank, account_number (enc), type, is_primary |
| client_dependants | client_id, first_name, relationship, dob |
| client_employment | client_id, employer, occupation, monthly_income |
| client_assets | client_id, type, description, value |
| client_liabilities | client_id, type, description, outstanding, monthly_repayment |
| client_income_expenses | client_id, category, amount, frequency |

### 9.4 Policies
| Table | Key fields |
|-------|-----------|
| product_providers | id, name, fsp_number, integration_method, status |
| policies | id, client_id, provider_id, policy_number, product_type, status, premium_amount, premium_model, inception_date, renewal_date, outbonus_streak_years, commission_rate, schedule (JSON) |
| policy_assets | policy_id, type, details (JSON) — vehicles/property/lives |
| policy_endorsements | policy_id, type, sum_insured, premium_delta |
| policy_assistance_benefits | policy_id, type, provider, limit |
| policy_schedule_history | policy_id, version, schedule_snapshot, effective_date |

### 9.5 Claims
| Table | Key fields |
|-------|-----------|
| claims | id, policy_id, client_id, reference, incident_type, incident_date, description, location, status, assessor, settlement_amount |
| claim_third_parties | claim_id, name, contact, insurer, vehicle/details |
| claim_updates | claim_id, author_id, message, status_change, created_at |

### 9.6 Applications & Leads
| Table | Key fields |
|-------|-----------|
| leads | id, first_name, last_name, mobile, email, interest_type, risk_details (JSON), source, referral_code, status, assigned_to |
| onboarding_applications | id, client_id, product_type, needs_analysis (JSON), selected_insurers (JSON), template_id, responses (JSON), recommendation (JSON), client_selection (JSON), status |
| referral_rewards | id, referrer_client_id, referred_client_id, reward_type, amount, status |

### 9.7 Goals
| Table | Key fields |
|-------|-----------|
| financial_goals | id, client_id, title, type, target_amount, current_amount, target_date, status |
| goal_clients | goal_id, client_id (shared goals) |
| goal_contributions | goal_id, amount, date, source |
| goal_projections | goal_id, projected_value, projection_date, assumptions (JSON) |

### 9.8 Tasks & Documents
| Table | Key fields |
|-------|-----------|
| task_templates | id, name, trigger, default_priority, sla_days |
| tasks | id, template_id, title, client_id, assigned_to, due_date, priority, status |
| task_comments | task_id, author_id, comment |
| documents | id, client_id, policy_id/claim_id, type, name, r2_key, size, uploaded_by |

### 9.9 Compliance
| Table | Key fields |
|-------|-----------|
| records_of_advice | id, client_id, application_id, content (JSON), signed_at, signature_ref, immutable |
| kyc_records | id, client_id, status, verified_at, expires_at, risk_score, pep_result, sanctions_result |
| kyc_documents | kyc_id, type, r2_key, verified |
| commission_disclosures | id, policy_id, rate, amount, disclosed_at |
| consents | id, client_id, purpose, granted, granted_at, withdrawn_at |

### 9.10 Notifications & Audit
| Table | Key fields |
|-------|-----------|
| notification_templates | id, channel, event, subject, body |
| notification_logs | id, user_id, channel, event, status (sent/delivered/read/failed), sent_at |
| user_notification_preferences | user_id, channel, event, enabled |
| audit_log | id, actor_id, actor_type, action, resource_type, resource_id, before_state, after_state, ip, created_at (partitioned monthly, INSERT-only) |

### 9.11 AI
| Table | Key fields |
|-------|-----------|
| ai_conversations | id, client_id, application_id, insurance_context, status, model_version |
| ai_messages | conversation_id, role, content, response_json, source_chunks_used (JSON), created_at |
| document_chunks | id, provider_id, document_id, section, chunk_text, embedding (vector) |

### 9.12 Insurer Portal
| Table | Key fields |
|-------|-----------|
| insurer_profiles | provider_id, description, contacts, logo, approval_status |
| insurer_products | provider_id, product_type, cover_types, terms, wording_doc |
| insurer_required_documents | provider_id, product_type, document_type |
| insurer_quote_requests | id, application_id, provider_id, canonical_payload (JSON), status |
| insurer_quote_responses | request_id, premium, excess, terms, validity, status |

---

## 10. Status Lifecycles (State Machines)

**Lead:** `new → contacted → qualified → application_started → quoted → won` (or `→ lost` at any point, with reason).

**Application:** `draft → ready_to_quote → awaiting_quotes → comparing → client_deciding → selected → inception → live` (or `→ abandoned` / `→ not_taken_up`).

**Policy:** `pending → active → (lapsed | cancelled | expired | not_taken_up)`. Lapsed can return to `active` on reinstatement.

**Claim:** `submitted → acknowledged → under_assessment → approved | rejected → settled → closed`. Closed can `→ reopened`.

**Task:** `open → in_progress → completed` (or `snoozed`, `cancelled`).

**KYC:** `pending → verified → expired` (re-verify → `verified`), or `→ rejected`.

**AI conversation:** `created → questioning → idle_short → idle_long → (closed_by_client | closed_by_select | expired | escalated)`.

**Insurer profile:** `invited → in_progress → pending_approval → approved` (or `→ rejected`), `approved → suspended`.

---

## 11. Notification Triggers Matrix

| Event | Who is notified | Default channel(s) |
|-------|-----------------|--------------------|
| Magic link issued | Prospect/Client | Email |
| Welcome / account activated | Client | Email + WhatsApp |
| New lead captured | Sales Agent / pool | In-app |
| New application submitted | Adviser | In-app + email |
| Quote received from insurer | Adviser | In-app |
| Recommendation sent | Client | WhatsApp + email + in-app |
| Client selected an option | Adviser | In-app + email |
| Policy went live | Client | WhatsApp + email + in-app |
| Renewal due (60/30/7 days) | Client + Adviser | WhatsApp + email |
| Payment failed | Client + Adviser | SMS + WhatsApp + in-app |
| Bank details changed | Adviser (Royal Square) | In-app + email |
| Claim submitted | Case Manager | In-app + email |
| Claim status update | Client | WhatsApp + email + in-app |
| Claim settled | Client + Adviser | WhatsApp + email |
| KYC expiring (30 days) | Client + Adviser | Email + WhatsApp |
| SLA breach | Branch Manager | In-app |
| Integration failure (dead-letter) | Super Admin | In-app + email |
| Two-person sign-off requested | Second Super Admin | In-app + email |
| MFA OTP | User | SMS |

Every send respects the recipient's per-event, per-channel preferences and POPIA consent (marketing especially).

---

## 12. Button & Action Reference (Every Button)

A consolidated list of every meaningful button/action and exactly what it does.

### Client Portal
| Button | Where | Does |
|--------|-------|------|
| Get a quote | Sales page | Opens guest wizard. |
| Activate account | Magic link page | Creates account, loads wizard data, logs in. |
| Log in | Login | Authenticates → MFA → dashboard. |
| Forgot password | Login | Sends reset link. |
| View policy | Insurance | Opens policy detail. |
| Download schedule | Policy detail | Downloads PDF from R2. |
| Report a claim | Policy/Claims | Starts claim wizard. |
| Request endorsement change | Policy detail | Creates a change request → adviser. |
| Request a document | Documents | Asks adviser for a specific doc. |
| Add document / Upload | Docs/Claim | Chunked resumable upload. |
| Change bank details | Payments | Opens change request → notifies Royal Square. |
| Retry now | Payments (failed) | Re-attempts a failed collection. |
| Add goal | Goals | Goal wizard. |
| Contribute | Goal detail | Logs a contribution. |
| Ask AI | Many places | Opens AI scoped to context. |
| Speak to my adviser | AI | Escalates → adviser alert. |
| Contact my adviser | Policy/Claim | Opens message thread. |
| Withdraw consent / Export / Erase | Settings › Privacy | POPIA actions. |
| Enable MFA | Settings › Security | Sets up TOTP + QR. |
| Log out other devices | Settings › Security | Kills other sessions. |

### Admin Portal
| Button | Where | Does |
|--------|-------|------|
| Claim lead | Leads | Assigns lead to self. |
| Convert to client | Lead | Creates client + magic link. |
| Start application | Lead/Client | Opens application. |
| Mark lost | Lead | Closes lead with reason. |
| Validate KYC | Application | Runs KYC/PEP/sanctions check. |
| Complete FNA | Application | Financial needs analysis wizard. |
| Select insurers | Application | Picks insurers to quote. |
| Choose template | Application | Loads quote-request template. |
| Send to insurers | Application | Queues requests via gateway. |
| Chase insurer | Application | Sends a reminder to insurer. |
| Edit recommendation | Application | Adjusts scores / why-recommended text. |
| Send to client | Application | Publishes options to client portal. |
| Confirm with insurer | Application | Confirms the client's selection. |
| Incept policy | Application | Creates the live policy. |
| Upload schedule | Application/Policy | Stores schedule doc. |
| Endorse | Policy | Adds/changes an endorsement. |
| Renew | Policy | Starts renewal flow. |
| Notify insurer | Claim | Sends claim to insurer. |
| Assign assessor | Claim | Records assessor. |
| Add update | Claim | Posts update → pushes to client. |
| Record settlement | Claim | Logs settlement amount. |
| Close / Reopen claim | Claim | Changes claim status. |
| Use template | Templates | Auto-fills with client data. |
| Send (notification) | Notifications | Dispatches message(s). |
| Bulk send | Notifications | Multi-recipient send (consent-checked). |
| Export CSV / PDF | Reports | Generates & logs export. |
| Add note | Client timeline | Adds a timeline note. |
| Impersonate view | Client | Read-only view as client (permissioned, logged). |

### Super Admin Portal
| Button | Where | Does |
|--------|-------|------|
| Create user | IAM | New user + group + magic link. |
| Reset MFA | IAM | Resets MFA (two-person). |
| Deactivate | IAM | Disables a user (two-person if active policies). |
| Create group | IAM | New role with permission matrix. |
| Create group like… | IAM | Clones an existing group to adjust. |
| Save permissions | IAM | Applies matrix to a group. |
| Approve / Reject insurer | Insurers | Changes insurer approval status. |
| Enable / Disable insurer | Insurers | Toggles availability for quoting. |
| Publish template | Templates | Makes a template available to advisers. |
| Toggle module | System Config | Enables/disables a module for a tenant. |
| Reprocess | Integration Health | Retries a dead-letter message. |
| Approve sign-off | (banner) | Second super admin approves a held action. |
| Cancel sign-off | (banner) | Cancels a held action. |
| Export audit | Audit Log | Exports trail (two-person for one user). |

### Insurer Portal
| Button | Where | Does |
|--------|-------|------|
| Open request | Inbox | Opens a quote request. |
| Submit quote | Request | Returns a normalised quote. |
| Decline | Request | Declines with a reason. |
| Counter-offer | Request | Returns adjusted terms. |
| Edit profile | Profile | Updates company/products. |
| Submit for approval | Onboarding | Sends profile to Super Admin. |

---

*End of document. Every actor, screen, action, button, status, notification, and data field for the RoyalSync platform.*
