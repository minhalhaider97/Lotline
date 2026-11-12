# UI/UX — Google Stitch master design brief

## Paste into Google Stitch
Design a premium, conversion-focused, highly polished B2B SaaS website and a matching future dealership application for **LotLine AI**, an AI customer engagement and sales intelligence platform built for independent used-car dealerships. Primary customers: dealership owners, general managers, sales managers, and salespeople in the US, UK, and Canada. Design should feel modern, trustworthy, fast, sophisticated and automotive-specific, without generic robot imagery or gimmicky AI visuals.

### Reference direction
Take inspiration (not pixel-for-pixel copying) from https://www.useflai.com/ for its conversion-driven hero, interactive conversation examples, automotive focus and demo CTAs; https://wesetai.com/ for additional visual exploration; and https://novaco.ai/ for premium automotive AI positioning. Do not copy logos, trademarks, exact wording, proprietary assets or layouts. Reference-site details not accessible should not be assumed.

### Visual language
- Dark navy/near-black #08111F, deep slate #111D2D, electric blue #377DFF, icy cyan #63D6F5, off-white #F6F8FC. Use light sections strategically for contrast.
- Large expressive geometric sans headings (e.g. Inter/Manrope/Plus Jakarta Sans); crisp compact UI labels, spacious grids, 12–20px corners, thin luminous borders, understated blur/glass and soft shadows.
- Use authentic used-car dealership imagery and tasteful car silhouettes, dashboards and conversation cards; no misleading dealer logos.
- Subtle scroll reveals, microinteractions, waveform animation and glowing active states; reduced-motion fallback.
- Design at desktop 1440px, tablet 768px and mobile 390px. Maintain WCAG AA contrast, keyboard focus, accessible labels.

### Public website sitemap
Home, Product, Solutions (AI Chat / Voice AI / Customer Intelligence / Automations), Live Demo, Pricing, About, Contact, Book Demo, Privacy, Terms, Cookie Settings. Header: logo left; Product, Solutions, How It Works, Pricing, Live Demo; Book a Demo CTA right. Sticky header, clean mobile menu.

### Home page sections — design all
1. Hero: eyebrow 'AI-powered customer engagement for dealerships'; headline 'Every conversation. A better chance to sell.' Subheading explaining capture of chats/calls, qualification, customer history and next actions. CTAs 'Try Live AI' and 'Book a Demo'. Right: elegant interactive chat/voice preview with a car inquiry and lead facts appearing in real time. Add honest 'Interactive sample dealership demo' label.
2. Three demo tabs (Text Chat / Browser Voice / Phone Call) with prominent launch controls and compact privacy notice; route to dedicated /demo for full experience.
3. Pain points: missed after-hours leads, disconnected channels, forgotten follow-ups, scattered customer context.
4. 'One conversation, complete customer intelligence' visual journey: chat/call → structured buyer facts → lead score → salesperson action.
5. Product capabilities grid: 24/7 AI chat, voice handling, unified inbox, Customer 360, inventory matching, follow-up workflows, campaigns and analytics. Distinguish available demo from planned platform modules until launched.
6. Interactive three-step 'How it works': connect channels, understand buyers, turn interest into appointments.
7. Product preview: realistic dealer dashboard with conversation inbox, customer profile timeline, AI-extracted facts, score explanation, inventory match and next action. Clearly label illustrative UI until product is live.
8. Use-case storytelling: after-hours inquiry, financing question, vehicle availability, missed call, test-drive request.
9. Demo/latency section with text, voice and phone options; display only actually measured timings and definitions.
10. Pricing: Starter $99, Growth $249, Pro $499, Enterprise custom are *illustrative starting hypotheses*, mark 'Proposed pricing — subject to pilot validation' or show 'Contact Sales' until validated.
11. FAQ, final CTA, comprehensive footer with legal/contact links. Do not invent reviews, partner badges, ROI or compliance certifications.

### Dedicated /demo page — most important screen
Two-column desktop: left control rail (mode selector, sample dealership, suggested prompts, live session status, reset), right large interactive AI interface. Mobile uses full-screen tabbed interface.
**Text mode:** scrollable role-labelled messages, typing indicator, response streaming, inventory result cards, lead capture consent and clear error/retry. Example prompts: 'Do you have an automatic Camry under $22,000?', 'Can I trade in my Civic?', 'Can I book a test drive on Saturday?', 'What financing options are available?' The AI must not invent stock, approval or bookings.
**Browser voice mode:** large animated microphone orb and waveform, states Idle → Requesting permission → Listening → Thinking → Speaking → Interrupted/Stopped/Error; mute, stop, transcript toggle, restart, device failure and unsupported browser states. Show measured speech start latency with an explanatory tooltip, not an invented number. Support interruption/barge-in if the selected provider supports it.
**Phone call mode:** dedicated phone number (country and call-rate disclaimer), 'Call the demo line' action; optionally request a callback ONLY after verified consent, jurisdiction checks and provider setup. Show what the visitor can test, hours/availability, AI disclosure, recording notice, and a fallback if telephony is unavailable. Never pretend a simulated call is a real PSTN call.
**Demo trust/guardrails:** 'Sample dealership and sample inventory'; clear data retention notice; never ask for financial account numbers; no actual purchase or appointment booking unless connected to a real authorized scheduler; reset session button.

### Conversion UX
Persistent Book Demo CTA, short lead form (name, dealership, business email, phone optional, location, main challenge, consent checkbox), confirmation screen, calendar scheduling, thank-you page, CRM-ready attribution. CTA text should be consistent.

### Future SaaS design system
Create a separate application UI kit: left sidebar Dashboard, Conversations, Customers, Leads, Inventory, Appointments, Automations, Campaigns, Analytics, Settings. Dashboard: KPI cards and trend charts. Inbox: channel list + message thread + customer context panel. Customer 360: identity header, score, permissions, budget, preferences, timeline, facts with provenance and correction. Campaigns: eligibility preview, exclusions, approvals. Use restrained density, filters, bulk actions, empty/loading/error states. This is DESIGN ONLY during Release A.

### Stitch deliverables
Generate desktop and mobile screens for Home, Live Demo (3 states/modes), Product, Pricing, Book Demo, Contact, plus a future SaaS dashboard, inbox and Customer 360 screen. Include tokens, component inventory, hover/focus/error/empty states, and developer handoff notes.

### Success criteria
A dealership owner understands the value in under 10 seconds, can find and actually try three demo modes, and can book a meeting in two clicks from the hero. Clear separation of real features and roadmap.
