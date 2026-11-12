import re
import unicodedata
from dataclasses import dataclass
from typing import Literal

from app.errors import APIError
from app.models.api import HistoryTurn


FIXED_REDIRECT = (
    "I can help with our vehicles, pricing, comparisons, dealership information, "
    "or arranging a test drive. What kind of vehicle are you looking for?"
)

Scope = Literal[
    "dealership_allowed",
    "mixed_answer_dealership_only",
    "off_topic",
    "prompt_injection",
    "code_or_query_request",
    "malicious",
]

ALLOWED_TERMS = re.compile(
    r"\b(car|cars|vehicle|vehicles|inventory|price|pricing|budget|mileage|miles|"
    r"sedan|suv|van|hatchback|ford|honda|mazda|bmw|lexus|transit|accord|"
    r"mazda3|x1|is 250|rx 350|dealership|hours|location|hayward|test[ -]?drive|"
    r"visit|appointment|book|schedule|financ|trade[ -]?in|automatic|transmission|"
    r"feature|title|vin|color|hello|hi|hey|thanks|thank you|monday|tuesday|"
    r"wednesday|thursday|friday|saturday|sunday|today|tomorrow|morning|afternoon)\b",
    re.IGNORECASE,
)
PROMPT_INJECTION = re.compile(
    r"(ignore (all |any )?(previous|prior|system)|reveal (the )?(system|prompt)|"
    r"developer message|hidden instructions|change (your )?role|jailbreak|"
    r"act as|you are now|override (your )?instructions|print.*environment)",
    re.IGNORECASE | re.DOTALL,
)
CODE_QUERY = re.compile(
    r"(```|\b(select|insert|update|delete|drop|alter)\s+.+\b(from|into|table)\b|"
    r"\b(sql|javascript|typescript|python|powershell|bash|shell command|regex|"
    r"source code|api call|curl)\b|<script|\beval\s*\(|\bexec\s*\()",
    re.IGNORECASE | re.DOTALL,
)
MALICIOUS = re.compile(
    r"\b(malware|ransomware|steal (a )?(password|credential)|credential theft|"
    r"sql injection|xss|exploit|reverse shell|keylogger|phishing|ddos|exfiltrat)\b",
    re.IGNORECASE,
)
OUTPUT_FORBIDDEN = re.compile(
    r"(```|<script|\b(api[_ -]?key|system prompt|environment variable|"
    r"internal file path|tool payload)\b)",
    re.IGNORECASE,
)
CONTEXTUAL_FOLLOWUP = re.compile(
    r"^\s*(?:"
    r"(?:this|next)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|"
    r"october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)|"
    r"(?:january|february|march|april|may|june|july|august|september|october|"
    r"november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+\d{1,2}|"
    r"\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|"
    r"(?:at\s*)?\d{1,2}(?::\d{2})?\s*(?:am|pm)|"
    r"morning|late\s+morning|afternoon|late\s+afternoon|"
    r"yes|yes please|no|the first one|the second one|that one|this one"
    r")[.!?\s]*$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class GuardResult:
    scope: Scope
    normalized: str


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKC", value)
    normalized = "".join(
        char
        for char in normalized
        if char in "\n\t" or unicodedata.category(char) not in {"Cc", "Cf"}
    )
    return re.sub(r"[ \t]+", " ", normalized).strip()


def validate_message(value: str, max_characters: int) -> str:
    value = normalize_text(value)
    if not value:
        raise APIError(422, "EMPTY_MESSAGE", "Please enter a message.")
    if len(value) > max_characters:
        raise APIError(413, "MESSAGE_TOO_LONG", "The message is too long.")
    if value.startswith(("data:", "UEsDB", "JVBER", "iVBOR")):
        raise APIError(415, "FILES_NOT_ACCEPTED", "Files are not accepted in chat.")
    return value


def sanitize_history(
    history: list[HistoryTurn], max_turns: int, max_characters: int
) -> list[HistoryTurn]:
    clean: list[HistoryTurn] = []
    total = 0
    for turn in history[-max_turns:]:
        content = normalize_text(turn.content)
        if not content:
            continue
        remaining = max_characters - total
        if remaining <= 0:
            break
        content = content[:remaining]
        total += len(content)
        clean.append(HistoryTurn(role=turn.role, content=content))
    return clean


def classify_scope(value: str) -> GuardResult:
    has_allowed = bool(ALLOWED_TERMS.search(value))
    if MALICIOUS.search(value):
        scope: Scope = "malicious"
    elif PROMPT_INJECTION.search(value):
        scope = "prompt_injection"
    elif CODE_QUERY.search(value):
        scope = "code_or_query_request"
    elif has_allowed:
        scope = "dealership_allowed"
    else:
        scope = "off_topic"

    if has_allowed and scope in {
        "prompt_injection",
        "code_or_query_request",
        "malicious",
    }:
        scope = "mixed_answer_dealership_only"
    return GuardResult(scope=scope, normalized=value)


def is_contextual_dealership_followup(value: str, history: list[HistoryTurn]) -> bool:
    """Allow a narrow date/time/selection fragment only inside dealership context."""
    if not CONTEXTUAL_FOLLOWUP.fullmatch(value):
        return False
    recent_context = "\n".join(turn.content for turn in history[-6:])
    return bool(ALLOWED_TERMS.search(recent_context))


def output_is_safe(value: str) -> bool:
    return not OUTPUT_FORBIDDEN.search(value)
