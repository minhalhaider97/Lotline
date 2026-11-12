# LotLine AI Website and Live Demo — Implementation Specification

**Document status:** Ready for implementation planning  
**Release:** Website Release A  
**Product:** LotLine AI  
**Primary markets:** United States, United Kingdom, and Canada  
**Source material:** `used_car_dealership_ai_saas_complete_plan_updated.pdf` and `01_BRAND_AND_UIUX_STITCH.md`  
**Last updated:** November 5, 2026

---

## 1. Purpose

Build and launch the public LotLine AI marketing website first. This release must include a genuinely usable, clearly labelled sample-dealership demo that demonstrates text chat, browser voice, and—only when a real telephony provider has been configured—a phone-call experience.

The production dealership SaaS application described in the product plan is a separate later system. Release A may visually preview that future product, but it must not implement or imply that the full dealership platform is already available.

This document is the implementation contract for the website. It translates the product plan and existing UX brief into scope, routes, functional behavior, dependencies, interfaces, safeguards, testing requirements, and acceptance criteria.

---

## 2. Product positioning

### 2.1 Positioning statement

> An AI-powered customer engagement and sales intelligence platform for used-car dealerships.

LotLine AI should not be presented as only a chatbot or voice agent. The long-term value is capturing dealership conversations, turning them into structured and traceable customer intelligence, and helping staff take the next best action.

### 2.2 Primary audience

- Independent used-car dealership owners.
- General managers and sales managers.
- Salespeople responsible for lead response and follow-up.
- Small used-car dealership groups evaluating an AI engagement platform.

### 2.3 Website conversion goals

1. A dealership decision-maker understands the value proposition within 10 seconds.
2. A visitor can start the live demo from the hero.
3. A visitor can discover all three demo modes.
4. A qualified prospect can book a meeting in no more than two primary actions from the hero.
5. The site never blurs the distinction between a working sample demo, a product preview, and planned platform functionality.

### 2.4 Primary calls to action

- **Try Live AI** — opens `/demo`, preserving an optional selected mode.
- **Book a Demo** — opens `/book-demo`.

Use these labels consistently. Secondary contextual actions may include **View Product**, **See Pricing**, **Contact Sales**, **Call the Demo Line**, **Start Voice Demo**, and **Send Message**.

---

## 3. Release boundaries

### 3.1 In scope for Website Release A

- Responsive public marketing website.
- SEO-ready public routes and metadata.
- Functional sample-dealership text demo.
- Functional browser voice demo when microphone and selected speech/voice services are available.
- Real phone demo only after a telephony number, disclosure flow, jurisdiction policy, and provider integration have been configured and verified.
- Sample inventory grounded in a controlled structured dataset.
- Short lead/contact forms and meeting scheduling.
- Privacy, terms, cookie settings, and demo-specific privacy disclosures.
- Basic product analytics and conversion attribution with consent controls.
- Error, loading, offline, unsupported-browser, and provider-outage states.
- Product screenshots or interactive visual previews clearly labelled as illustrative until the production SaaS is live.

### 3.2 Explicitly out of scope

The following belong to the later dealership SaaS and must not be built as part of the public website unless separately specified:

- Dealership authentication, workspaces, roles, or tenant administration.
- Production omnichannel inbox.
- Customer 360 database and persistent cross-channel identity resolution.
- WhatsApp, Messenger, Instagram, CRM, DMS, or live dealer-inventory integrations.
- Production customer lead scoring, automations, campaigns, or attribution.
- Staff task management and appointment operations.
- Dealer billing, plan enforcement, or usage ledgers.
- Real customer-data migration or production call-record storage.
- The full FastAPI/PostgreSQL/Redis/LangGraph SaaS architecture.

### 3.3 Allowed future-product previews

Static or locally interactive previews may show the intended dashboard, inbox, customer profile, AI-extracted facts, score explanation, inventory match, and next action. Every preview must display one of these labels:

- **Illustrative product preview**
- **Planned capability**
- **Available in the sample demo**

Do not display a planned capability as available. Do not invent customers, partners, reviews, certifications, response times, ROI, revenue, or conversion claims.

---

## 4. Information architecture and routes

| Route | Purpose | Primary CTA | Release priority |
|---|---|---|---|
| `/` | Explain value, show capabilities, launch demo, convert | Try Live AI | P0 |
| `/product` | Explain the platform vision and capability status | Book a Demo | P0 |
| `/solutions` | Solutions overview | Try Live AI | P1 |
| `/solutions/ai-chat` | Website chat use cases | Try Text Chat | P1 |
| `/solutions/voice-ai` | Browser and phone voice use cases | Try Voice Demo | P1 |
| `/solutions/customer-intelligence` | Structured customer intelligence vision | Book a Demo | P1 |
| `/solutions/automations` | Planned follow-up workflows and safeguards | Book a Demo | P1 |
| `/how-it-works` | Connect, understand, and act narrative | Try Live AI | P1 |
| `/demo` | Full live demo with three modes | Start Demo | P0 |
| `/pricing` | Proposed plans or contact-sales presentation | Book a Demo | P0 |
| `/about` | Mission and company story using verified facts only | Contact Us | P1 |
| `/contact` | Sales/general inquiry form | Send Message | P0 |
| `/book-demo` | Qualification form and scheduler | Schedule Meeting | P0 |
| `/thank-you` | Form/scheduling confirmation and next step | Try Live AI | P0 |
| `/privacy` | Privacy notice | — | P0 before production |
| `/terms` | Website and demo terms | — | P0 before production |
| `/cookies` | Cookie explanation and preference controls | Manage Preferences | P0 before nonessential tracking |
| `/404` | Helpful not-found state | Return Home | P0 |

If schedule or staffing requires a smaller launch, P1 solution pages may initially be anchored sections on `/product`; their final URLs should still be reserved and included in redirects/canonical planning.

### 4.1 Global header

- Logo at left.
- Desktop navigation: Product, Solutions, How It Works, Pricing, Live Demo.
- Persistent **Book a Demo** CTA at right.
- Sticky behavior with a readable solid/blurred background after scroll.
- Mobile menu with focus trapping, Escape-to-close, scroll locking, and visible close control.
- Active route indication must not rely on color alone.

### 4.2 Global footer

- Brand statement.
- Product and solution links.
- Live Demo and Book Demo links.
- Company links: About and Contact.
- Legal links: Privacy, Terms, Cookie Settings.
- Verified contact details only.
- Copyright year generated at build/runtime.
- No unverified partner badges, awards, compliance logos, or social profiles.

---

## 5. Page requirements

## 5.1 Home page

Implement the following sections in this order unless the final UX design explicitly defines a better conversion flow.

### A. Hero

- Eyebrow: **AI-powered customer engagement for dealerships**.
- Headline: **Every conversation. A better chance to sell.**
- Supporting copy must explain capture of chats/calls, lead qualification, customer history, and recommended next actions without claiming all modules are already live.
- Primary CTA: **Try Live AI**.
- Secondary CTA: **Book a Demo**.
- Interactive or staged chat/voice preview showing one realistic vehicle inquiry.
- Visible label: **Interactive sample dealership demo**.
- Preview must not imply that its vehicle, appointment, or financing data belongs to a real dealership.

### B. Demo-mode preview

- Tabs: Text Chat, Browser Voice, Phone Call.
- Each tab explains what can be tested and links to `/demo?mode=text`, `/demo?mode=voice`, or `/demo?mode=phone`.
- Include a compact notice that the demo uses sample dealership and inventory data.
- Phone tab must show **Coming soon** or **Temporarily unavailable** until real PSTN functionality is verified.

### C. Pain points

- Missed after-hours leads.
- Disconnected customer channels.
- Forgotten or inconsistent follow-ups.
- Scattered customer context.

### D. Customer-intelligence journey

Visualize:

`Chat or call → structured buyer facts → explainable lead priority → salesperson action`

Use explicit examples such as vehicle preference, budget range, trade-in interest, financing interest, buying timeline, and test-drive preference. Clearly distinguish directly stated facts from AI inference.

### E. Capability grid

Cover:

- 24/7 AI chat.
- Voice handling.
- Unified inbox.
- Customer 360.
- Inventory matching.
- Follow-up workflows.
- Campaigns.
- Analytics.

Every capability card must use a status badge backed by a single content source: **Demo available**, **Planned platform capability**, or **Contact us**. Status text must be editable without changing component code.

### F. How it works

1. Connect customer channels.
2. Understand what each buyer wants.
3. Turn interest into timely dealership action.

This is a product narrative, not proof that every integration is already available.

### G. Product preview

Show a realistic illustrative dealer interface containing:

- Conversation inbox.
- Customer timeline.
- Extracted facts with source/confidence treatment.
- Explainable lead score or priority.
- Structured inventory match.
- Recommended next action.

Display **Illustrative product preview** continuously or prominently within the section.

### H. Use cases

- After-hours vehicle inquiry.
- Financing question without an approval claim.
- Vehicle availability inquiry using structured sample stock.
- Missed-call follow-up task.
- Test-drive request without claiming a confirmed booking.

### I. Demo and latency

- Offer text, browser voice, and phone modes.
- Show latency only from actual telemetry.
- Define the measured interval in a tooltip, for example: “Time from the end of your speech to the first audible response.”
- If there is not enough valid telemetry, show **Measuring** or omit the number.

### J. Pricing preview

The source plan proposes unvalidated hypotheses:

- Starter: $99/month.
- Growth: $249/month.
- Pro: $499/month.
- Enterprise: custom.

The recommended launch treatment is **Contact Sales** until package scope and margins are validated. If figures are displayed, the section must say **Proposed pricing — subject to pilot validation**, specify USD, and avoid “unlimited” AI claims.

### K. FAQ

Minimum topics:

- What LotLine AI is.
- Who it is for.
- What the live demo uses.
- Whether demo inventory and dealership data are real.
- What happens when a visitor shares contact information.
- Whether the AI can approve financing or complete a vehicle purchase (no).
- Which capabilities are live versus planned.
- How to discuss a dealership pilot.

### L. Final CTA

- Value-focused short headline.
- **Try Live AI** and **Book a Demo**.
- Do not add fabricated urgency, customer counts, or performance statistics.

## 5.2 Product page

- Restate the platform vision.
- Explain conversation capture, structured customer intelligence, grounded inventory answers, next-best actions, and measurement.
- Use a capability status matrix so the visitor can tell what exists in the sample demo and what is planned.
- Explain provenance: the intended platform preserves original messages separately from AI summaries and connects extracted facts to sources, confidence, and timestamps.
- Explain that production inventory answers will come from structured dealer records or verified APIs rather than model memory.
- Preview the future modules without exposing a sign-in or implying production readiness.

## 5.3 Solution pages

Each page must include the relevant dealership problem, intended workflow, demo link where available, guardrails, planned product relationship, and Book Demo CTA.

### AI Chat

- Ground answers in approved sample dealership FAQs and structured sample inventory.
- Demonstrate qualification, inventory filtering, and clear escalation.

### Voice AI

- Explain browser microphone and optional phone experiences separately.
- Include AI disclosure, recording/transcription notice where applicable, interruption behavior, and unsupported-device fallback.

### Customer Intelligence

- Show source-linked facts, timeline, corrections, and explicit-versus-inferred treatment.
- Never imply that the public demo performs persistent cross-channel identity resolution.

### Automations

- Present service follow-up separately from promotional marketing.
- Describe consent checks, suppression, quiet hours, approval, and auditability as planned platform safeguards.

## 5.4 Pricing page

- Use either Contact Sales only or the clearly labelled proposed pricing hypotheses.
- Identify usage-sensitive categories: voice minutes, transcription, model usage, messaging/provider charges, premium integrations, and large campaigns.
- Avoid unsupported savings, ROI, competitor comparisons, “unlimited,” and hidden provider-cost claims.
- Every plan CTA leads to `/book-demo` with the selected plan in attribution, not a fake checkout.

## 5.5 About page

- Use only verified founder/company facts supplied by the project owner.
- Until factual copy exists, use a concise mission-led page and omit invented biographies, office addresses, team photos, funding, or customer counts.

## 5.6 Contact page

Fields:

- Name (required).
- Business email (required).
- Dealership/company name (required).
- Phone (optional).
- Country/location (required).
- Inquiry type (required).
- Message (required).
- Privacy acknowledgement (required where appropriate; not bundled marketing consent).

On success, display a reference or confirmation state, send the data to the configured lead destination, and record only consent-permitted analytics. Preserve user input after recoverable failures.

## 5.7 Book Demo page

Qualification form:

- Name.
- Dealership name.
- Business email.
- Phone (optional).
- Country/location.
- Main challenge.
- Optional estimated monthly lead volume.
- Separate marketing consent checkbox if marketing follow-up is intended.
- Required privacy acknowledgement with links to applicable notices.

After valid submission:

1. Create/send the lead once using an idempotency key.
2. Open the embedded or redirected scheduler.
3. Preserve attribution fields.
4. Show a clear confirmation and `/thank-you` state.
5. Provide a fallback contact method if the scheduler fails.

Do not pre-check consent. Do not make phone mandatory unless a stated sales process genuinely requires it.

---

## 6. Live demo specification

The `/demo` experience is the most important functional page in Release A.

### 6.1 Layout

**Desktop:** left control rail and large right interaction area.  
**Mobile:** full-screen interaction area with accessible tabs/sheets for controls.

Control rail:

- Mode selector.
- Sample dealership identity.
- “Sample inventory” label.
- Suggested prompts.
- Session status.
- Privacy/data-retention link.
- Reset session control.

The query parameter `mode=text|voice|phone` sets the initial tab. Invalid values fall back to text. Mode changes must update history without a full reload and retain only state that is safe and relevant to that mode.

### 6.2 Shared demo rules

- Always disclose that the visitor is interacting with AI.
- Always show **Sample dealership and sample inventory**.
- Do not claim that sample stock is available at a real dealer.
- Do not invent vehicle price, mileage, trim, availability, finance terms, appointment slots, or dealership policy.
- Inventory responses must come from the controlled structured sample dataset.
- If no matching vehicle exists, say so and offer safe alternatives from the dataset.
- Never say financing is approved or likely to be approved.
- Never complete a purchase.
- Never claim an appointment is booked unless a real authorized scheduler returns a confirmed booking. Release A should normally capture a preferred time and explicitly label it as a request.
- Never ask for bank account, card, Social Security, National Insurance, Social Insurance, or other financial account/government identifier data.
- Allow a visitor to reset the session and explain what reset does.
- Handle model/provider failure with a retry action and a non-deceptive fallback.
- The demo must be rate-limited and protected against automated abuse.
- Tool calls and prompts must remain server-side.

### 6.3 Sample dealership fixture

Create a versioned, non-real sample dealership configuration. Minimum fields:

```ts
type DemoDealership = {
  id: string;
  name: string;
  disclosureName: string;
  country: "US" | "GB" | "CA";
  timezone: string;
  currency: "USD" | "GBP" | "CAD";
  businessHours: Record<string, string | null>;
  contact: { phone?: string; email?: string };
  policies: {
    financingExplanation: string;
    tradeInExplanation: string;
    testDriveExplanation: string;
  };
};
```

Use a fictional name cleared for project use. Do not use a real dealership’s branding, inventory, phone number, or claims without written authorization.

### 6.4 Sample inventory fixture

Use JSON, a small database table, or a demo-only service with this minimum schema:

```ts
type DemoVehicle = {
  id: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  price: number;
  currency: "USD" | "GBP" | "CAD";
  mileage: number;
  mileageUnit: "mi" | "km";
  color?: string;
  status: "available" | "reserved" | "sold";
  imageUrl?: string;
  updatedAt: string;
};
```

Requirements:

- Dataset contains enough variety to test make/model, price, body style, transmission, mileage, and alternatives.
- UI displays the fixture’s last-updated context where relevant.
- Results exclude sold vehicles unless explicitly used to demonstrate an unavailable-vehicle response.
- Numeric comparisons happen in application code or structured queries, not in the LLM.
- Vehicle cards render only returned fixture values.
- Images must be owned, licensed, or deliberately generic with documented provenance.

### 6.5 Text chat mode

Required UI:

- Scrollable, role-labelled message history.
- Text input with send control.
- Streaming response display or honest non-streaming loading state.
- Typing/thinking indicator.
- Structured vehicle-result cards.
- Suggested prompts.
- Optional lead-capture step with explicit purpose/consent.
- Error, retry, timeout, offline, and rate-limit states.
- Reset session.
- Screen-reader announcement region for new responses without stealing focus.

Suggested prompts:

- “Do you have an automatic Camry under $22,000?”
- “Can I trade in my Civic?”
- “Can I request a test drive on Saturday?”
- “What financing options are available?”

Conversation behavior:

1. Classify the user’s request.
2. Use only permitted tools: search sample inventory, read approved sample dealership FAQs/policies, capture an optional lead, or request human follow-up.
3. Generate a grounded response from tool output.
4. State uncertainty and limitations.
5. Do not persist contact details unless the visitor deliberately submits them.

### 6.6 Browser voice mode

Required states:

`Idle → Requesting permission → Listening → Thinking → Speaking`

Additional terminal/interruption states:

- Interrupted.
- Stopped.
- Permission denied.
- No input device.
- Unsupported browser.
- Provider unavailable.
- Network error.

Required controls:

- Start microphone.
- Mute/unmute.
- Stop.
- Interrupt while the AI is speaking when the selected provider supports barge-in.
- Transcript show/hide.
- Restart session.
- Input device selection if supported and necessary.

Requirements:

- Microphone access starts only from a user gesture.
- Show a persistent visual state whenever the microphone is active.
- Explain whether audio is streamed, transcribed, retained, or discarded.
- Do not store audio by default for the public demo.
- If transcripts are retained for abuse/security or quality analysis, disclose the exact purpose and retention period before the session starts.
- Transcript content follows the same inventory grounding and safety rules as text mode.
- Reduced-motion users receive a static status indicator instead of an animated orb/waveform.
- Measured speech-start latency may appear only when backed by real session telemetry and accompanied by a definition.

### 6.7 Phone call mode

Phone mode must not simulate a PSTN call and label it as real.

It may be enabled only when all of the following are complete:

- Dedicated provider number is provisioned for the intended country/region.
- Inbound call flow is tested end to end.
- AI disclosure is played.
- Recording/transcription policy is configured.
- Required notice/consent behavior has received jurisdiction-specific legal review.
- Call availability and support ownership are defined.
- The public privacy notice and retention policy match actual behavior.
- Failure routing/fallback is tested.

When enabled, show:

- Country and formatted number.
- **Call the Demo Line** action (`tel:` link on supported devices).
- Carrier/call-rate disclaimer.
- Available hours or 24/7 status based on real configuration.
- What the visitor can test.
- AI disclosure.
- Recording/transcription and retention notice.
- Fallback if the line is unavailable.

Do not offer automated callback until explicit consent capture, jurisdiction checks, provider setup, rate limiting, and abuse protections are complete. If the phone integration is not ready, display a transparent unavailable/coming-soon state and direct visitors to browser voice.

### 6.8 Demo lead capture

Lead capture must be optional and separated from ordinary demo use. Recommended fields are name, business email, dealership name, optional phone, country, and preferred follow-up. Explain why the information is requested.

For Website Release A, do not use submitted contact details to build a persistent “unified customer” timeline. If later identity linking is introduced, the PDF amendment controls: only an exact normalized email or exact E.164 phone match within the same dealership may auto-associate; name, device, IP address, conversation similarity, and vehicle interest must never auto-merge profiles. Consent is never broadened by a match.

### 6.9 Demo session and retention

- Use a random opaque session ID, not contact information, as the browser session identifier.
- Keep conversational state short-lived and scoped to the sample demo.
- Define the actual transcript retention period before launch; recommended default is no persistent transcript retention unless needed for a documented purpose.
- Never place message content or contact details in URLs, analytics properties, logs, or client error reports.
- Reset clears client state and requests deletion/expiry of server-side session state where supported.
- Public copy must match actual infrastructure behavior.

---

## 7. Minimum website/demo architecture

Keep the website deployable independently from the later SaaS.

```text
Browser
  ├─ Public marketing pages
  ├─ Demo UI (text / browser voice / phone status)
  └─ Contact and booking forms
          │
          ▼
Website backend / serverless API
  ├─ Form validation and delivery
  ├─ Demo session and rate limiting
  ├─ LLM orchestration and safe tool allowlist
  ├─ Structured sample-inventory search
  ├─ Approved demo FAQ/policy retrieval
  ├─ Voice-provider token/session creation
  └─ Telephony status/configuration (optional)
          │
          ├─ LLM provider
          ├─ Speech/realtime provider
          ├─ Telephony provider (optional)
          ├─ Scheduler / CRM destination
          └─ Privacy-aware analytics and monitoring
```

### 7.1 Architecture rules

- No provider secret, system prompt, private API key, or unrestricted tool endpoint in the browser bundle.
- The LLM may interpret language and draft replies; application code owns inventory filtering, validation, permissions, session state, and tool execution.
- Use a strict tool allowlist and validate every argument/result.
- Treat all user input and retrieved content as untrusted.
- The demo backend must not share production customer data.
- Use separate environment variables and provider resources for development, preview/staging, and production.
- A later SaaS can replace the demo adapters without forcing a redesign of public pages.

### 7.2 Suggested repository structure

Adapt to the chosen framework, but keep these boundaries:

```text
src/
  app-or-routes/
  components/
    marketing/
    demo/
    forms/
    legal/
    ui/
  content/
  demo-data/
  lib/
    analytics/
    consent/
    demo-client/
    validation/
  styles/
server-or-api/
  demo/
  forms/
  providers/
  security/
public/
tests/
```

---

## 8. Website API contracts

Exact transport may be REST or framework-native server actions. Preserve these logical contracts.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/demo/sessions` | Create an anonymous demo session and return capabilities |
| `POST` | `/api/demo/sessions/{id}/messages` | Send text input and stream/return a grounded response |
| `POST` | `/api/demo/sessions/{id}/reset` | Clear/expire the demo session |
| `POST` | `/api/demo/voice/session` | Create a short-lived browser voice token/session |
| `GET` | `/api/demo/phone/status` | Return enabled state, country, hours, and safe public metadata |
| `POST` | `/api/leads/contact` | Submit contact form |
| `POST` | `/api/leads/book-demo` | Submit demo-booking qualification form |
| `GET` | `/api/health` | Minimal health check without secrets |

### 8.1 Standard error shape

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "The demo is busy. Please try again shortly.",
    "retryable": true,
    "requestId": "opaque-id"
  }
}
```

Never send stack traces, provider responses, API keys, prompts, internal policy, or sensitive request data to the client.

### 8.2 Demo message response

The client contract must support:

- Assistant message ID and text.
- Optional structured vehicle cards.
- Optional safe suggested actions.
- Completion/stream status.
- User-displayable limitation or grounding notice.
- Opaque request ID for support.
- Server-recorded timing fields used to calculate latency accurately.

Do not let the model return arbitrary executable UI instructions or raw HTML.

---

## 9. Frontend requirements and dependencies

The source plan recommends React, Vite, TypeScript, and Tailwind CSS. Use the prepared UX design as the visual source of truth. Pin exact package versions in the lockfile at implementation time; do not copy unverified “latest” version numbers into this specification.

### 9.1 Required categories

| Category | Recommended choice | Why needed |
|---|---|---|
| UI runtime | React + TypeScript | Componentized, type-safe interface |
| Build tool | Vite, unless an SEO/server-rendering framework is selected | Fast development and production builds |
| Routing | React Router for a Vite SPA; framework router if SSR/SSG is selected | Public routes and demo query state |
| Styling | Tailwind CSS plus CSS custom-property design tokens | Implements prepared design consistently |
| Accessible primitives | Radix UI or React Aria, used selectively | Dialogs, menus, tabs, tooltips, focus behavior |
| Forms | React Hook Form | Performant accessible form state |
| Validation | Zod | Shared client/server schemas |
| Server state | Native fetch plus TanStack Query where retries/caching materially help | Demo/provider status and form requests |
| Animation | CSS first; Motion only where design requires it | Reveal/microinteraction behavior with reduced-motion support |
| Icons | Lucide React or the icon set specified by the UX system | Consistent, accessible iconography |
| Sanitization | Avoid raw HTML; DOMPurify only if approved rich text is unavoidable | XSS defense |
| Testing | Vitest + Testing Library + Playwright | Unit, component, and end-to-end coverage |
| Accessibility testing | axe-core / Playwright accessibility checks | Automated WCAG regression checks |
| Lint/format | ESLint + Prettier | Code quality and consistent output |
| Error monitoring | Sentry or equivalent with privacy filters | Production error diagnosis |
| Analytics | Consent-aware provider or privacy-friendly analytics | Funnel and demo measurement |

### 9.2 Framework decision before implementation

Because this is a public acquisition site, server-rendered or statically generated pages are preferable for SEO, link previews, performance, and legal pages. Two valid approaches are:

1. Use a React framework that supports SSG/SSR and server endpoints.
2. Keep Vite for the prepared frontend and pre-render marketing routes, with a separately deployed API.

Choose once the existing UX code is available. Do not rebuild the design solely to change frameworks without a measurable benefit.

### 9.3 Fonts and media

- Use the licensed font chosen by the design; Inter, Manrope, or Plus Jakarta Sans are acceptable candidates.
- Self-host fonts where licensing permits, subset weights, and preload only critical files.
- Use AVIF/WebP with responsive `srcset`, explicit dimensions, and lazy loading below the fold.
- Do not lazy-load the primary hero/LCP image.
- Every meaningful image needs useful alt text; decorative visuals use empty alt text.
- Car/dealership imagery must have documented ownership or licensing.

---

## 10. Backend and external service dependencies for Release A

Select providers during implementation/procurement; keep provider adapters replaceable.

| Capability | Requirement | Notes |
|---|---|---|
| Website/demo API | Minimal server or serverless runtime | Holds secrets and enforces validation/rate limits |
| LLM | Tool-calling/structured-output capable provider | Must pass dealership-domain grounding tests |
| Browser speech/voice | Realtime speech provider or STT + LLM + TTS pipeline | Must support disclosure, interruption requirements, and measured latency |
| Telephony | Provider with target-country number support | Optional until legal/operational requirements are satisfied |
| Sample inventory | Versioned JSON or small demo-only datastore | Structured source of truth |
| FAQ/policy content | Versioned approved documents or structured content | No unrestricted web retrieval |
| Forms | Server-side mail/CRM/lead destination | Must provide idempotency and spam protection |
| Scheduling | Calendar/scheduling provider | Fallback link/contact path required |
| Abuse protection | Rate limiter, bot challenge when risk warrants | Must not make accessible use impossible |
| Analytics | Consent-aware analytics | No transcript/message/contact properties |
| Monitoring | Error tracking, structured logs, uptime checks | Redact PII and provider secrets |
| Hosting/CDN | TLS, custom domains, preview environments, caching | Separate staging and production |
| Secret storage | Host/provider secret manager | Never public environment variables |

### 10.1 Do not install for Release A unless used

The full product plan mentions PostgreSQL/Supabase, Redis, Celery, SQLAlchemy, Alembic, pgvector, LangGraph, object storage, and multi-tenant authentication. These are not automatically website dependencies. Add them only if the chosen live-demo implementation has a concrete need. A small demo should not inherit the full SaaS infrastructure by default.

---

## 11. Content and truthfulness requirements

Maintain a single structured source for capability status, pricing status, contact details, demo availability, and legal copy version.

### 11.1 Prohibited claims

- Fabricated testimonials or customer logos.
- Unverified ROI, revenue, lead-conversion, response-time, accuracy, uptime, or latency numbers.
- Security or regulatory certifications not actually achieved.
- “Compliant with” blanket claims without legal verification.
- “Live inventory” for sample/stale data.
- “Booked” when only a preference/request was captured.
- “Approved” for financing.
- “Unlimited” usage before cost and fair-use validation.
- Real product screenshots presented when they are conceptual mockups.

### 11.2 Preferred language

- “Sample dealership and sample inventory.”
- “Illustrative product preview.”
- “Proposed pricing — subject to pilot validation.”
- “Request a test drive” unless a real scheduler confirms it.
- “Financing information” or “discuss financing,” never approval language.
- “Planned capability” for future modules.

---

## 12. Accessibility requirements

Target WCAG 2.2 AA.

- Full keyboard operation and logical focus order.
- Visible, high-contrast focus indicators.
- WCAG AA contrast in default, hover, active, disabled, and error states.
- Semantic landmarks and heading hierarchy.
- Skip-to-content link.
- Accessible names for icon-only controls.
- Programmatic labels, descriptions, and errors for all fields.
- Error summaries for long forms.
- Tabs follow WAI-ARIA tab keyboard behavior.
- Dialog/mobile menu focus is trapped and restored.
- Status changes use appropriate live regions without excessive announcements.
- Voice visualization has equivalent text status.
- Captions/transcripts for meaningful prerecorded media.
- No required interaction based only on hover, color, drag, audio, or motion.
- Respect `prefers-reduced-motion` and avoid autoplaying audio.
- Touch targets should be at least 44 × 44 CSS pixels where practical.
- Zoom to 200% and responsive reflow must remain usable.

Manual keyboard and screen-reader testing is required; automated scans alone are insufficient.

---

## 13. Responsive behavior

Design and test at minimum:

- Mobile: 390 px reference, with support down to 320 px.
- Tablet: 768 px.
- Desktop: 1440 px.
- Large desktop: verify sensible max-width and line length.

Requirements:

- No horizontal page scroll.
- Header collapses to an accessible mobile navigation.
- Demo becomes a mobile-first full-screen/tabbed experience.
- Vehicle cards and pricing grids stack without losing status labels.
- Tables become cards or horizontally scroll inside clearly labelled regions.
- Sticky controls must not obscure focused inputs or mobile browser chrome.
- Voice controls remain usable with one hand and the on-screen keyboard.

---

## 14. Performance requirements

Targets should be evaluated at the 75th percentile for real users where sufficient data exists:

- LCP ≤ 2.5 seconds.
- INP ≤ 200 ms.
- CLS ≤ 0.1.

Implementation requirements:

- Marketing pages load no voice, telephony, scheduler, or demo provider SDK until requested.
- Code-split the demo and scheduling integrations.
- Optimize hero assets and fonts.
- Reserve media dimensions to prevent layout shift.
- Prefer server/static rendering for public content.
- Cache versioned public assets at the CDN.
- Keep third-party scripts minimal and consent-gated when nonessential.
- Provide skeletons only when they improve clarity; do not conceal slow critical flows.
- Establish a performance budget in CI for JavaScript, CSS, images, and key Lighthouse regressions.

---

## 15. Security and abuse prevention

- HTTPS only; enable HSTS after domain/redirect validation.
- Use a restrictive Content Security Policy and explicit provider allowlists.
- Set `X-Content-Type-Options`, `Referrer-Policy`, frame restrictions, and suitable Permissions Policy.
- Validate and normalize all form/API input server-side.
- Escape rendered user/model content; do not render arbitrary model HTML.
- Protect forms and demo endpoints with IP/session rate limits and adaptive bot controls.
- Use request size and message-length limits.
- Use timeouts, bounded retries, circuit breakers, and provider spending limits.
- Use opaque IDs; do not expose sequential internal identifiers.
- Do not log raw microphone audio, complete transcripts, contact form bodies, or authorization headers by default.
- Redact emails, phones, message content, tokens, and provider payloads from monitoring.
- Scan dependencies and keep the lockfile committed.
- Keep development, preview, and production secrets/resources separate.
- Protect preview deployments from indexing and unauthorized discovery when they contain unreleased content.
- Review prompt-injection resistance: the model cannot modify its tool allowlist, reveal prompts/secrets, fetch arbitrary URLs, or query non-demo data.

---

## 16. Privacy, consent, and legal readiness

The product plan flags United States, United Kingdom, and Canadian requirements. This specification is an engineering checklist, not legal advice. Obtain jurisdiction-specific legal review before public launch, especially before enabling call recording, transcription, text/phone marketing, or callbacks.

### 16.1 Required website behavior

- Publish privacy and terms pages based on actual data flows and providers.
- Explain demo transcript/audio handling before collection.
- Separate inquiry response from marketing consent.
- Do not pre-check consent controls.
- Record consent text version, source, purpose, time, and evidence where required.
- Make cookie preferences available from every page.
- Block nonessential tracking until required consent exists.
- Support a contact path for data access, correction, and deletion requests.
- Define retention periods for lead forms, demo sessions, analytics, and logs.
- Keep the public notice synchronized with provider or retention changes.

### 16.2 Cookie categories

- Strictly necessary.
- Analytics.
- Marketing, only if actually used.

The site must function when analytics/marketing cookies are declined. Store consent state without dark patterns and allow later changes.

### 16.3 Phone/voice gate

Before enabling phone mode, verify AI disclosure, recording/transcription notice, consent basis, target-state/province/country rules, retention, access control, and provider terms. When uncertain, do not record and keep the mode disabled until reviewed.

---

## 17. SEO and discoverability

- Unique title and meta description for every indexable route.
- Canonical URL for every public page.
- Open Graph and social metadata with approved brand images.
- `sitemap.xml` containing canonical public pages.
- `robots.txt`; exclude preview/staging, internal API, and noncanonical states.
- Structured data only when factually supported. Likely types: `Organization`, `WebSite`, `SoftwareApplication` or `Service`, `FAQPage`, and `BreadcrumbList` as applicable.
- Do not add aggregate ratings, offers, or reviews without real evidence.
- Semantic internal links and useful link labels.
- Server-render or pre-render meaningful public content.
- Demo query modes use one canonical `/demo` URL unless a deliberate SEO strategy says otherwise.

---

## 18. Analytics and conversion measurement

Analytics must be documented, consent-aware, and free of conversation/contact content.

### 18.1 Core events

- `cta_try_live_ai_clicked` with source section.
- `cta_book_demo_clicked` with source section.
- `demo_viewed`.
- `demo_mode_selected` with mode.
- `demo_session_started` with mode.
- `demo_prompt_submitted` with prompt category only, never raw prompt.
- `demo_response_completed` with mode, success/failure, and bucketed timing.
- `demo_reset`.
- `voice_permission_result` with granted/denied/unsupported.
- `phone_cta_clicked` without the visitor’s phone number.
- `contact_form_submitted` with success/failure only.
- `book_demo_form_submitted` with success/failure and non-sensitive attribution.
- `scheduler_opened` and `scheduler_completed` where supported.
- `cookie_preferences_updated`.

### 18.2 Attribution fields

Capture only when permitted:

- UTM source, medium, campaign, content, and term.
- Landing page.
- Referrer domain.
- First-touch and latest-touch timestamps.
- CTA/source section.
- Requested plan or solution.

Do not send names, emails, phone numbers, messages, transcripts, or full IP addresses to analytics.

### 18.3 Website success metrics

- Hero-to-demo click-through rate.
- Demo start and completion rate by mode.
- Demo error/provider-failure rate.
- Voice permission success and fallback rate.
- Book-demo CTA and form completion rate.
- Qualified meeting completion rate.
- Core Web Vitals and accessibility error rate.
- Measured demo latency with methodology documented.

These are website metrics, not proof of dealership sales outcomes.

---

## 19. UI states and component requirements

Every interactive component must have:

- Default.
- Hover where relevant.
- Focus-visible.
- Active/selected.
- Disabled.
- Loading.
- Empty.
- Success.
- Validation error.
- Network/provider error.

Minimum shared components:

- Header and mobile navigation.
- Footer.
- Button/link variants.
- Section/container primitives.
- Capability/status badge.
- Tabs.
- Accordion/FAQ.
- Form controls, consent checkbox, error summary, success panel.
- Modal/dialog and tooltip.
- Toast or inline notification pattern.
- Vehicle result card.
- Chat message and typing indicator.
- Voice orb/status and waveform alternative.
- Demo control rail.
- Product-preview frame with illustrative label.
- Pricing card with proposed-pricing disclosure.
- Cookie preference banner/panel.
- Error boundary and 404 state.

Use design tokens from the prepared UX design. The current brief specifies these starting colors:

- Dark navy/near black: `#08111F`.
- Deep slate: `#111D2D`.
- Electric blue: `#377DFF`.
- Icy cyan: `#63D6F5`.
- Off-white: `#F6F8FC`.

Validate all token combinations for contrast before implementation.

---

## 20. Testing requirements

### 20.1 Unit and component tests

- Capability status rendering.
- Pricing disclosure behavior.
- Validation schemas.
- Inventory filters and numeric comparisons.
- Vehicle card mapping uses fixture data only.
- Demo state transitions.
- Latency calculation/definition.
- Consent and analytics gating.
- Error mapping and retry behavior.

### 20.2 Integration tests

- Text message → permitted tool call → grounded response.
- No-match inventory response.
- Sold/unavailable vehicle handling.
- Provider timeout/failure.
- Voice permission denied and unsupported browser.
- Reset clears expected client/server state.
- Form idempotency prevents duplicate leads.
- Scheduler unavailable fallback.
- Phone mode cannot expose a number while disabled.

### 20.3 End-to-end tests

- Header and mobile menu navigation.
- Hero → text demo → suggested prompt → vehicle results → reset.
- Voice mode permission and fallback paths using browser mocks where required.
- Book-demo form → scheduler/confirmation → thank-you.
- Contact form success and recoverable failure.
- Cookie decline leaves the site functional and blocks nonessential analytics.
- Legal/footer links.
- Keyboard-only completion of critical flows.
- Mobile layouts at 390 px and desktop at 1440 px.

### 20.4 AI evaluation set

Create a repeatable dealership-domain test set covering:

- Exact make/model/budget/transmission queries.
- Near matches and no matches.
- Sold vehicle questions.
- Trade-in explanation.
- Financing questions and attempts to obtain approval.
- Test-drive requests and attempts to force a fake confirmation.
- Requests for nonexistent policies or inventory.
- Requests for prohibited financial identifiers.
- Prompt-injection attempts and requests for system prompts/secrets.
- Unsupported/off-topic questions and escalation.
- US/UK/Canada currency and mileage-unit consistency.

For every release, evaluate grounding, tool correctness, refusal/limitation behavior, and whether all displayed vehicle facts exactly match the fixture.

### 20.5 Manual launch checks

- Real-device Safari, Chrome, Edge, and Firefox coverage as supported.
- iOS and Android microphone behavior.
- Screen reader and keyboard review.
- Slow network and offline behavior.
- Real provider outage/fallback rehearsal.
- Link, metadata, robots, sitemap, and social-card checks.
- Legal copy checked against actual providers and retention.
- No placeholder copy, fake metrics, test numbers, or development secrets.

---

## 21. Environments and configuration

Use local, preview/staging, and production environments.

Suggested environment variables; exact names may change with the chosen stack:

```text
PUBLIC_SITE_URL=
PUBLIC_APP_ENV=

LLM_API_KEY=
LLM_MODEL=
DEMO_MAX_MESSAGES=
DEMO_SESSION_TTL_SECONDS=

VOICE_PROVIDER=
VOICE_API_KEY=
VOICE_MODEL_OR_AGENT_ID=

PHONE_DEMO_ENABLED=false
PHONE_DEMO_COUNTRY=
PHONE_DEMO_PUBLIC_NUMBER=
PHONE_DEMO_HOURS=

LEAD_DESTINATION_API_KEY=
SCHEDULER_URL=

ANALYTICS_ENABLED=false
ANALYTICS_SITE_ID=
SENTRY_DSN=
```

Rules:

- Only explicitly public, non-sensitive values may use client-exposed prefixes.
- `PHONE_DEMO_ENABLED=false` by default in every new environment.
- Validate required variables on startup/build.
- Never silently fall back from production to test credentials.
- Do not commit `.env` files containing secrets.

---

## 22. Implementation sequence

### Phase 0 — Inputs and decisions

- Receive/export the final UX screens, tokens, assets, and interaction notes.
- Confirm preferred frontend framework based on the supplied design/code.
- Confirm factual company/contact copy.
- Choose the sample dealership identity and licensed vehicle imagery.
- Choose providers for LLM, browser voice, forms/CRM, scheduler, analytics, hosting, and monitoring.
- Decide transcript/audio retention and have legal copy drafted.
- Decide whether phone mode is launch-critical or launches disabled.

### Phase 1 — Foundation

- Create project structure, routes, tokens, shared components, quality tooling, and CI.
- Add metadata, sitemap/robots strategy, error boundaries, cookie controls, and legal page shells.
- Build content/config sources for capability, pricing, and demo availability status.

### Phase 2 — Marketing website

- Implement Home, Product, Pricing, Contact, Book Demo, Thank You, legal pages, footer, and responsive navigation.
- Add solution pages or approved anchored equivalents.
- Integrate validated forms and scheduling fallback.

### Phase 3 — Text demo

- Build versioned sample dealership/inventory fixtures.
- Implement demo session API, permitted tools, grounded responses, UI states, reset, rate limiting, and evaluation tests.
- Add optional lead capture without persistent customer-timeline claims.

### Phase 4 — Browser voice

- Integrate selected voice provider behind a server-created short-lived session.
- Implement the full state machine, transcript controls, interruption if supported, privacy notice, reduced-motion fallback, and measured latency.
- Complete real-device testing.

### Phase 5 — Phone demo, only if ready

- Complete provider, legal, disclosure, retention, hours, abuse, and fallback requirements.
- Enable through configuration only after launch checklist approval.

### Phase 6 — Hardening and launch

- Run E2E, accessibility, performance, security, AI evaluation, and content-truthfulness reviews.
- Verify analytics consent and redaction.
- Verify production forms, scheduler, DNS/TLS, monitoring, budget alerts, and rollback.
- Launch and monitor demo failure rate, spend, latency, and conversion.

---

## 23. Definition of done

Website Release A is complete only when:

- All P0 routes are responsive and production-ready.
- The prepared UX is implemented with documented intentional deviations only.
- A visitor understands the offering in under 10 seconds in usability review.
- **Try Live AI** opens a working, labelled sample demo.
- Text demo answers inventory questions only from the structured fixture.
- Text demo does not invent stock, prices, finance approval, or bookings.
- Browser voice either works through all required states or is transparently unavailable with a useful fallback.
- Phone mode is either genuinely operational and legally/operationally reviewed or clearly disabled; it is never simulated as PSTN.
- All product previews and planned capabilities are labelled.
- Pricing is Contact Sales or clearly marked as proposed and unvalidated.
- Forms validate server-side, prevent duplicates, preserve recoverable input, and reach the verified destination.
- Privacy, terms, cookie preferences, demo data handling, and retention descriptions match reality.
- Nonessential tracking respects consent.
- Critical flows pass keyboard, screen-reader, mobile, E2E, and provider-failure tests.
- Core Web Vitals targets are met or documented launch exceptions are approved.
- Monitoring, redaction, rate limiting, provider budgets, and rollback are configured.
- There are no placeholder secrets, test phone numbers presented as live, fabricated claims, unlicensed assets, or production customer data.

---

## 24. Decisions still required from the project owner

These decisions should be made before their related implementation phase; they do not block initial component/page work.

1. Which frontend format will the prepared UX arrive in: design file, exported code, or both?
2. Which framework/hosting platform should be used after reviewing that asset?
3. What verified company name, legal entity, contact email, and jurisdiction belong in legal pages?
4. What fictional sample dealership name and default country/currency should the demo use?
5. Which LLM and browser voice providers should be evaluated?
6. Is the phone-call demo required for initial launch, or may it launch as coming soon?
7. Will demo transcripts be discarded immediately or retained for a defined quality/security period?
8. Which CRM/email destination receives contact and booking leads?
9. Which scheduling provider/calendar should Book Demo use?
10. Should proposed prices be displayed, or should launch pricing remain Contact Sales?
11. Which analytics/cookie approach is approved?
12. Which country is the first active market for legal and demo defaults?

Until answered, implement safe defaults: fictional US sample dealership, USD, no persistent transcript retention, phone mode disabled, Contact Sales pricing, and no nonessential analytics.

