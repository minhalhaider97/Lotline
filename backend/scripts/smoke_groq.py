"""Manual Groq connectivity smoke test. It never prints credentials."""

from fastapi.testclient import TestClient

from app.main import app


def main() -> int:
    with TestClient(app) as client:
        response = client.post(
            "/api/chat/turn",
            json={
                "session_id": "smoke-test",
                "message": "Show me automatic sedans under $15,000",
                "history": [],
            },
        )
    body = response.json()
    print(f"status: {response.status_code}")
    if response.status_code != 200:
        print(f"error_code: {body.get('error', {}).get('code')}")
        return 1
    print(f"vehicles: {body.get('vehicles', [])}")
    print(f"assistant_text: {body.get('assistant_text', '')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
