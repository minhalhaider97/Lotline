# LotLine Website Demo Backend — Vercel-First Implementation Specification

Status: proposed for review before implementation  
Scope: website text-chat and browser-voice demos only  
Deployment target: Vercel Python Functions  
Framework: FastAPI  
Python: 3.12

## 1. Architecture decision

The Vercel backend must remain a lightweight orchestration API. It will validate requests, enforce guardrails and limits, load the two small dealership data files, call Groq, and return structured responses.

It will not run local AI models.

```text
Text:
Browser → Vercel FastAPI → guardrails → Groq chat → output validation → browser

Voice:
Browser MediaRecorder → Vercel FastAPI → Groq Whisper STT
        → transcript guardrails → Groq chat → browser SpeechSynthesis TTS
```

### Why local Faster-Whisper is removed

The earlier CPU plan used Faster-Whisper `small.en`, CTranslate2, model weights, and audio-decoding dependencies. That is reasonable on a persistent VM, but not for the lightweight Vercel deployment requested here because:

- Vercel Functions are ephemeral and may cold start.
- Bundling the model and native inference dependencies makes the function substantially larger.
- Every cold function may need to load the model again.
- CPU inference consumes active function CPU and memory.
- Browser uploads and function responses are each limited to 4.5 MB.
- Vercel Functions cannot act as WebSocket servers.

For this deployment, use Groq’s hosted `whisper-large-v3-turbo` transcription endpoint on the Groq Free plan. Whisper itself is open source; the listed price applies only when paid hosted usage is needed after the free allocation. No Whisper weights, CTranslate2, PyTorch, CUDA, or FFmpeg are bundled into Vercel.

Speech playback uses the browser's built-in Web Speech API (`window.speechSynthesis`). It requires no TTS model, audio-generation API, or server-side audio streaming. If speech synthesis is unavailable in a visitor's browser, the interface continues as text chat and clearly indicates that audio playback is unavailable.

Official references:

- Vercel Function limits: <https://vercel.com/docs/functions/limitations>
- Vercel Python runtime: <https://vercel.com/docs/functions/runtimes/python>
- Vercel FastAPI deployment: <https://vercel.com/kb/guide/ship-a-fastapi-app-on-vercel>
- Groq speech-to-text: <https://console.groq.com/docs/speech-to-text>
- Groq rate limits: <https://console.groq.com/docs/rate-limits>
- Groq text generation: <https://console.groq.com/docs/text-chat>
- Browser SpeechSynthesis: <https://developer.mozilla.org/docs/Web/API/Window/speechSynthesis>

## 2. Goals

- Power the text and voice demos with the same dealership rules and inventory.
- Keep responses grounded in `inventory.json` and `dealership.md`.
- Act as the dealership sales agent without handing ordinary questions to a salesperson.
- Resolve visit dates in `America/Los_Angeles`.
- Return illustrative booking copy without creating a booking record.
- Enforce strong dealership-only guardrails.
- Allow at most two voice messages per browser visitor per 24 hours.
- Reject voice recordings longer than 20 seconds.
- Keep the Vercel bundle, memory use, and CPU work small.
- Require no paid speech infrastructure while usage remains within Groq's Free-plan limits.

## 3. Non-goals

The backend will not:

- Store appointments in a database, calendar, CRM, file, or email system.
- Generate booking confirmation IDs.
- Check real appointment capacity.
- Send email.
- Run Faster-Whisper or any other local ML model.
- Generate or stream server-side TTS audio.
- Bundle FFmpeg or native audio-processing libraries.
- Use WebSockets.
- Accept chat attachments or files.
- Execute SQL, code, shell commands, URLs, or visitor-provided queries.

The approved illustrative visit response is:

> Your test drive for the [vehicle] is booked for [weekday], [month and date], at [time] Pacific Time. We’re located in Hayward, California, and we’ll notify you by email.

No real email is sent in this phase, and the response must never say that an email has already been sent.

## 4. AI models and browser speech

All model IDs remain environment variables.

- Chat: `openai/gpt-oss-20b`
- STT: `whisper-large-v3-turbo`

The backend uses Groq's hosted endpoints for chat and transcription. Vercel performs orchestration only.

TTS uses `SpeechSynthesisUtterance` in the browser and is not a Groq operation. The frontend chooses the best available English voice, preferring an `en-US` voice, and uses a default speaking rate of `1.0` unless the UI explicitly provides a speed control.

### 4.1 Free-plan usage

- Start with the Groq Free plan; upgrading to a paid plan is not required for initial development or a limited public demo.
- At the time of this specification, Groq documents `whisper-large-v3-turbo` Free-plan limits of 20 requests per minute, 2,000 requests per day, 7,200 audio seconds per hour, and 28,800 audio seconds per day.
- Groq accepts audio uploads up to 25 MB on its Free plan, but this application intentionally keeps its stricter 3 MB request limit for Vercel.
- Current Free-plan limits must be verified in the Groq Console before launch because provider quotas can change.
- The application-level limit of two recordings of at most 20 seconds limits each visitor to at most 40 seconds of submitted audio per 24 hours.
- At the documented daily audio allowance, the theoretical ceiling is approximately 720 visitors using both full 20-second recordings; actual capacity can be lower because of request limits, retries, and other organization usage.
- Treat Groq `429` responses as a temporary capacity condition. Return `VOICE_SERVICE_BUSY` and keep text chat available.
- Do not silently switch to a paid model or provider.
- Add billing only after reviewing actual production usage and receiving explicit project approval.

## 5. Stateless conversation design

Vercel functions are stateless and can run on different instances. Do not rely on process memory for conversation continuity.

For each request, the frontend sends:

- `session_id`
- current user message or voice audio
- last six sanitized conversation turns

The backend:

1. Revalidates every supplied turn as untrusted data.
2. Truncates history to six turns and 6,000 total characters.
3. Rebuilds the system prompt from trusted local files.
4. Never accepts a system/tool role from the browser.
5. Never stores conversation history after the request finishes.

Allowed browser history roles:

- `user`
- `assistant`

The backend converts browser history into quoted conversation data under its own trusted system prompt. Browser content cannot replace policy instructions.

## 6. Voice limits

### 6.1 Visitor identity

Set a random signed `lotline_visitor_id` cookie:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` in production
- 24-hour maximum age
- no name, email, phone, or IP inside the cookie

### 6.2 Two-message enforcement

Vercel instances cannot provide a reliable shared in-memory counter. Use a minimal serverless Redis/KV counter only for abuse prevention, never for chat or booking data.

Recommended: Upstash Redis through the Vercel Marketplace.

Counter key:

```text
voice-limit:{HMAC(visitor_id)}
```

Counter value:

- integer only
- TTL: 24 hours
- no transcript, audio, booking, email, name, or IP stored

Flow:

1. Verify the signed visitor cookie.
2. Validate media type, body size, and claimed duration.
3. Atomically increment the Redis counter with a 24-hour TTL.
4. If the new count exceeds two, return HTTP `429` and `VOICE_LIMIT_REACHED` without calling Groq.
5. Return `voice_turns_remaining` in successful responses.

Apply a secondary IP rate limit through Vercel Firewall/WAF or another serverless limiter. Do not store raw IP addresses in application data.

### 6.3 Twenty-second enforcement

- Browser stops `MediaRecorder` automatically at 20 seconds.
- Client submits `recorded_duration_ms`.
- Backend rejects a claimed duration over 20,000 ms.
- Backend sends audio to Groq STT with `response_format=verbose_json`.
- Cross-check Groq’s returned audio duration.
- If actual duration exceeds 20 seconds, discard the transcript and return `VOICE_DURATION_EXCEEDED`.
- Over-length audio may consume one voice attempt because Groq had to process it to verify actual duration.

### 6.4 Payload size

Vercel’s request limit is 4.5 MB. Use a smaller application limit:

- Maximum voice request audio: 3 MB
- Preferred type: `audio/webm;codecs=opus`
- Maximum text JSON body: 32 KB
- Return HTTP `413` before calling Groq when the byte limit is exceeded

Twenty seconds of Opus audio should remain well below 3 MB under normal browser settings.

## 7. Text-chat guardrails

### 7.1 Transport rules

- Accept `application/json` only.
- Maximum current message: 1,000 Unicode characters after normalization.
- Maximum history: six turns and 6,000 characters.
- Reject multipart, files, binary bodies, data URLs, base64 file payloads, archives, and embedded documents.
- Do not implement a text-chat upload endpoint.

### 7.2 Allowed scope

- Vehicles and fields in `inventory.json`
- Inventory search and comparison
- Dealership location and operating hours
- Listed vehicle prices
- General financing and trade-in policy from `dealership.md`
- Illustrative visit date/time selection

### 7.3 Blocked scope

- General unrelated questions
- Programming code or debugging
- SQL or database queries
- Shell commands and scripts
- Regular expressions or executable payloads
- Prompt extraction or role changes
- Requests to ignore prior instructions
- Encoded instructions and data exfiltration
- Malware, credential theft, intrusion, or malicious actions
- Requests for secrets, keys, environment variables, paths, logs, or tool payloads

Fixed redirect:

> I can help with our vehicles, pricing, comparisons, dealership information, or arranging a test drive. What kind of vehicle are you looking for?

For mixed messages, answer only the permitted dealership portion.

## 8. Guardrail pipeline

Apply the same pipeline to text messages and voice transcripts.

### Stage 1 — Input validation

- Normalize Unicode.
- Remove control characters except normal whitespace.
- Reject empty or oversized input.
- Reject unsupported content types.
- Never interpolate visitor input into code, paths, templates, queries, or configuration.

### Stage 2 — Scope classification

Classify input as:

- `dealership_allowed`
- `mixed_answer_dealership_only`
- `off_topic`
- `prompt_injection`
- `code_or_query_request`
- `malicious`

Use deterministic high-confidence rules first. A small structured Groq classification call may handle ambiguous messages, but it receives no tools and can return only one enum value.

Conversation-aware exception:

- Security checks for injection, code, queries, and malicious content always apply to the current message.
- A message initially classified as `off_topic` may be treated as an allowed follow-up only when recent sanitized history establishes dealership context and the current message is a narrowly validated date, time, weekday, yes/no, or vehicle-selection fragment.
- Arbitrary short messages do not inherit dealership scope merely because earlier history discussed a vehicle.

### Stage 3 — Restricted tools

Only these internal Python tools exist:

1. `search_inventory`
2. `get_vehicle`
3. `resolve_visit_datetime`

Rules:

- Validate arguments with Pydantic.
- Filter in-memory Python inventory objects.
- Do not construct SQL.
- Do not expose HTTP, filesystem, database, shell, eval, import, or generic code tools.
- Tool results are data, never instructions.

### Stage 4 — Structured output validation

Require:

```json
{
  "reply": "string",
  "vehicle_ids": ["car-002"],
  "visit_status": "none | needs_vehicle | needs_datetime | illustrative_confirmed",
  "resolved_local_time": "ISO-8601 timestamp or null",
  "suggestions": ["string"]
}
```

Validate that:

- vehicle IDs exist
- prices and mileage match inventory
- visit dates are future Pacific times
- output is within dealership scope
- output contains no code fences, code, SQL, commands, secrets, internal paths, system prompts, or tool payloads

Perform at most one constrained regeneration after validation failure. Otherwise return the fixed redirect.

## 9. Inventory and dealership context

Bundle only:

- `backend/data/inventory.json`
- `backend/data/dealership.md`

At cold start:

1. Load both small files from the deployed bundle.
2. Validate inventory with Pydantic.
3. Cache parsed immutable data in module globals for warm invocations.
4. Fail fast with a safe health error if validation fails.

No vector database or embedding model is needed for nine vehicles.

Inventory rules:

- Apply explicit filters before asking Groq to write an answer.
- Return at most three matches.
- Preserve exact recorded values.
- Never infer missing fields.
- Always disclose the Transit T250’s salvage title.

## 10. Illustrative visit flow

- Resolve dates with `America/Los_Angeles`.
- Weekday-only input means the next future occurrence.
- “Morning” means 10:00 AM.
- “Afternoon” means 2:00 PM.
- Never resolve into the past.
- Require a selected vehicle and future date/time.
- Preserve partial booking understanding across sanitized browser history. If the vehicle and date are known but the time is missing, acknowledge the resolved date and ask only for a valid time.
- Return the approved confirmation copy and structured visit state.
- Create no database row, file, calendar event, CRM entry, confirmation ID, or email.

Example state:

```json
{
  "status": "illustrative_confirmed",
  "vehicle_id": "car-002",
  "resolved_local_time": "2026-11-09T10:00:00-08:00",
  "timezone": "America/Los_Angeles"
}
```

## 11. API routes

### `GET /api/health`

Returns configuration readiness without exposing secrets.

### `POST /api/chat/turn`

Content type: `application/json`

Request:

```json
{
  "session_id": "uuid",
  "message": "Show me automatic sedans under $15,000",
  "history": [
    {"role": "user", "content": "I need a sedan"},
    {"role": "assistant", "content": "What is your budget?"}
  ]
}
```

Response:

```json
{
  "message_id": "uuid",
  "assistant_text": "I found two options...",
  "vehicles": ["car-002", "car-007"],
  "visit": null,
  "suggestions": ["Compare them", "Choose a test-drive time"]
}
```

Use streaming HTTP/SSE only if it materially improves the UI. WebSockets are not used.

### `POST /api/voice/turn`

Content type: `multipart/form-data`

Fields:

- `session_id`
- `recorded_duration_ms`
- `history_json`
- `audio`

Response:

```json
{
  "message_id": "uuid",
  "transcript": "Can I see the Accord Monday morning?",
  "assistant_text": "Your test drive for the 2018 Honda Accord Sport is booked for Monday...",
  "vehicles": ["car-002"],
  "visit": {
    "status": "illustrative_confirmed",
    "resolved_local_time": "ISO-8601 timestamp"
  },
  "voice_turns_remaining": 1
}
```

The frontend speaks `assistant_text` using `SpeechSynthesisUtterance`. The backend does not return generated audio, audio URLs, or TTS tokens.

## 12. Vercel project layout

```text
backend/
├── api/
│   └── index.py                  # exposes FastAPI `app`
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── routes/
│   │   ├── health.py
│   │   ├── chat.py
│   │   └── voice.py
│   ├── models/
│   │   ├── api.py
│   │   └── inventory.py
│   ├── services/
│   │   ├── context.py
│   │   ├── guardrails.py
│   │   ├── inventory.py
│   │   ├── groq_client.py
│   │   ├── voice_limits.py
│   │   └── datetime_resolver.py
│   └── tools/
│       ├── inventory.py
│       └── datetime.py
├── data/
│   ├── inventory.json
│   └── dealership.md
├── tests/
├── requirements.txt
├── pyproject.toml
├── vercel.json
└── BACKEND_IMPLEMENTATION_SPEC.md
```

## 13. Vercel configuration

Recommended `vercel.json` intent:

- route API traffic to `api/index.py`
- Python runtime
- one region near primary users; start with a US West region
- reasonable `maxDuration`, but target normal request completion under 15 seconds
- do not opt into large function bundles

The bundle should remain well below the standard Python function limit. Target less than 100 MB uncompressed.

Vercel environment variables:

```dotenv
APP_ENV=production
FRONTEND_ORIGINS=https://your-frontend.vercel.app

GROQ_API_KEY=
GROQ_CHAT_MODEL=openai/gpt-oss-20b
GROQ_STT_MODEL=whisper-large-v3-turbo

DEALERSHIP_TIMEZONE=America/Los_Angeles
MAX_CHAT_CHARACTERS=1000
MAX_HISTORY_CHARACTERS=6000
MAX_HISTORY_TURNS=6
MAX_AUDIO_SECONDS=20
MAX_AUDIO_BYTES=3145728
VOICE_VISITOR_LIMIT=2
VOICE_LIMIT_WINDOW_SECONDS=86400

VISITOR_COOKIE_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Never expose provider credentials through a `VITE_` variable.

## 14. Minimal dependencies

Initial `requirements.txt`:

```text
fastapi
groq
python-multipart
pydantic
pydantic-settings
orjson
python-dateutil
tzdata
itsdangerous
upstash-redis
tenacity
uvicorn
```

Do not include:

- `faster-whisper`
- `ctranslate2`
- `torch`
- `transformers`
- local Whisper model files
- `ffmpeg-python`
- SQLAlchemy
- database drivers

Pin exact versions after local and Vercel preview validation.

## 15. Frontend integration

### Text

- Send the current message and last six UI turns.
- Do not show file or attachment controls.
- Render structured vehicle results.
- Render the fixed redirect for blocked requests.
- Reset by clearing frontend history; no backend session deletion is needed.

### Voice

- Record Opus/WebM with `MediaRecorder`.
- Display a 20-second countdown.
- Stop automatically at 20 seconds.
- Disable voice after `voice_turns_remaining` reaches zero.
- Show “Voice demo limit reached” after two accepted turns.
- Speak the returned `assistant_text` with `SpeechSynthesisUtterance`.
- Prefer an available `en-US` browser voice and fall back to the browser default.
- Load voice choices after `speechSynthesis.onvoiceschanged` because some browsers populate them asynchronously.
- Change the Play button to Pause while speech is active; support Resume and Restart.
- Call `speechSynthesis.cancel()` on Reset, when starting a new reply, and when leaving the demo.
- Keep the written assistant response visible even when browser speech is unsupported or fails.

## 16. Security and privacy

- Restrict CORS to exact frontend origins.
- Verify signed visitor cookies.
- Use Upstash only for anonymous rate counters with TTL.
- Store no transcripts, messages, booking details, audio, email, name, phone, or raw IP in Redis.
- Do not log raw audio or full user messages in production.
- Redact provider error bodies before logging.
- Validate file signatures and supported audio content types.
- Escape all model output in React; never render model HTML.
- Return stable public error codes, not traces.
- Apply text and IP rate limits through Vercel Firewall/WAF when available.

## 17. Tests

### Inventory and date tests

- every inventory filter
- missing fields
- salvage-title disclosure
- next-weekday resolution
- Pacific DST boundaries
- morning/afternoon defaults
- past-date rejection

### Guardrail tests

- off-topic requests return the fixed redirect
- code, SQL, shell, malware, and injection requests are blocked
- mixed requests answer only the dealership portion
- browser-supplied system/tool roles are rejected
- output validation blocks code fences, secrets, paths, and unrelated content
- files and non-JSON chat requests are rejected

### Voice tests

- first two voice turns succeed
- third voice turn returns `VOICE_LIMIT_REACHED`
- visitor cookie tampering fails
- Redis counter contains no personal or conversation data
- claimed duration over 20 seconds is rejected before Groq
- Groq-reported duration over 20 seconds is rejected after transcription
- request over 3 MB is rejected
- transcript passes through the same guardrails as text
- browser speech starts only after the API returns a validated assistant response
- browser speech cancellation, pause, resume, and restart work
- unsupported SpeechSynthesis falls back to visible text without breaking the conversation

### Vercel tests

- deployment bundle remains under target size
- cold start does not load local models
- no WebSocket dependency exists
- voice JSON responses remain below Vercel limits
- no server-side TTS route or audio response exists
- all routes work across separate stateless invocations

## 18. Implementation phases

### Phase 1 — Lightweight FastAPI foundation

- Vercel entry point
- configuration and CORS
- inventory/context loader
- Pydantic schemas
- health route

### Phase 2 — Guarded text chat

- Groq chat client
- input classifier
- restricted inventory/date tools
- structured output validation
- chat route
- frontend integration

### Phase 3 — Hosted voice

- browser recorder
- Groq Free-plan Whisper STT
- two-turn Upstash limit
- browser SpeechSynthesis playback
- text-only fallback when browser speech is unavailable

### Phase 4 — Deployment hardening

- Vercel preview deployment
- bundle analysis
- WAF/rate limits
- provider timeouts and retries
- end-to-end tests

## 19. Acceptance criteria

- Backend deploys as a standard lightweight Vercel Python Function.
- No local ML model or FFmpeg is bundled.
- Chat and voice use the same trusted dealership context.
- Inventory answers are grounded in `inventory.json`.
- Text chat is dealership-only and rejects files, code, SQL, injections, malicious, and unrelated requests.
- Voice accepts no more than two turns per visitor per 24 hours.
- Voice rejects audio over 20 seconds and 3 MB.
- Visit confirmation is illustrative text only and is never stored.
- No booking database, calendar, CRM, email, or confirmation ID exists.
- Groq performs chat and hosted Whisper STT within the configured Free-plan allocation.
- Browser SpeechSynthesis performs TTS without a backend TTS service.
- No API key reaches the browser.
- No chat, transcript, audio, booking, or contact data is stored in Redis.

## 20. Remaining decisions

1. Confirm the production frontend origin.
2. Create or connect an Upstash Redis instance for anonymous voice counters.
3. Decide whether the UI should expose browser voice and speaking-rate selectors or use automatic defaults.
4. Provide an exact Hayward street address only if the assistant should state more than “Hayward, California.”
