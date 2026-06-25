from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


class FeishuError(RuntimeError):
    pass


@dataclass(frozen=True)
class FeishuMessage:
    message_id: str
    create_time_ms: int
    message_type: str
    text: str
    sender_id: str | None = None

    @property
    def created_at(self) -> datetime:
        return datetime.fromtimestamp(self.create_time_ms / 1000, tz=timezone.utc)


@dataclass(frozen=True)
class FeishuChat:
    chat_id: str
    name: str
    description: str = ""


class FeishuClient:
    def __init__(self, *, api_base: str, app_id: str, app_secret: str) -> None:
        self.api_base = api_base.rstrip("/")
        self.app_id = app_id
        self.app_secret = app_secret

    def list_chat_messages(
        self,
        *,
        chat_id: str,
        start_time_ms: int | None,
        page_size: int,
    ) -> list[FeishuMessage]:
        token = self._tenant_access_token()
        messages: list[FeishuMessage] = []
        page_token: str | None = None

        while True:
            params = {
                "container_id_type": "chat",
                "container_id": chat_id,
                "page_size": str(page_size),
            }
            if start_time_ms:
                # Feishu expects second-level Unix timestamps for this endpoint.
                params["start_time"] = str(max(0, start_time_ms // 1000 - 1))
            if page_token:
                params["page_token"] = page_token

            result = self._request_json(
                "GET",
                "/im/v1/messages",
                token=token,
                query=params,
            )
            data = result.get("data", {})
            for item in data.get("items", []):
                messages.append(_parse_message(item))

            if not data.get("has_more"):
                break
            page_token = data.get("page_token")
            if not page_token:
                break

        messages.sort(key=lambda message: (message.create_time_ms, message.message_id))
        return messages

    def list_chats(self, *, page_size: int) -> list[FeishuChat]:
        token = self._tenant_access_token()
        chats: list[FeishuChat] = []
        page_token: str | None = None

        while True:
            params = {
                "page_size": str(page_size),
            }
            if page_token:
                params["page_token"] = page_token

            result = self._request_json(
                "GET",
                "/im/v1/chats",
                token=token,
                query=params,
            )
            data = result.get("data", {})
            for item in data.get("items", []):
                chats.append(
                    FeishuChat(
                        chat_id=str(item.get("chat_id") or ""),
                        name=str(item.get("name") or ""),
                        description=str(item.get("description") or ""),
                    )
                )

            if not data.get("has_more"):
                break
            page_token = data.get("page_token")
            if not page_token:
                break

        return [chat for chat in chats if chat.chat_id]


    def _tenant_access_token(self) -> str:
        result = self._request_json(
            "POST",
            "/auth/v3/tenant_access_token/internal",
            body={"app_id": self.app_id, "app_secret": self.app_secret},
        )
        token = result.get("tenant_access_token")
        if not token:
            raise FeishuError("Feishu response did not include tenant_access_token")
        return str(token)

    def _request_json(
        self,
        method: str,
        path: str,
        *,
        token: str | None = None,
        query: dict[str, str] | None = None,
        body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = f"{self.api_base}{path}"
        if query:
            url = f"{url}?{urllib.parse.urlencode(query)}"

        headers = {"Content-Type": "application/json; charset=utf-8"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        request = urllib.request.Request(
            url,
            data=json.dumps(body).encode("utf-8") if body is not None else None,
            headers=headers,
            method=method,
        )

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise FeishuError(f"Feishu HTTP {exc.code}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise FeishuError(f"Feishu request failed: {exc.reason}") from exc

        code = payload.get("code", 0)
        if code != 0:
            message = payload.get("msg") or payload.get("message") or "unknown error"
            raise FeishuError(f"Feishu API error {code}: {message}")
        return payload


def _parse_message(item: dict[str, Any]) -> FeishuMessage:
    raw_create_time = item.get("create_time") or item.get("update_time") or 0
    try:
        create_time_ms = int(raw_create_time)
    except (TypeError, ValueError):
        create_time_ms = 0

    body = item.get("body") or {}
    content = body.get("content", "")

    return FeishuMessage(
        message_id=str(item.get("message_id") or ""),
        create_time_ms=create_time_ms,
        message_type=str(item.get("msg_type") or "unknown"),
        text=_extract_text(content, str(item.get("msg_type") or "")),
        sender_id=_extract_sender_id(item.get("sender")),
    )


def _extract_text(content: str, message_type: str) -> str:
    if not content:
        return ""

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return content.strip()

    if message_type == "text":
        return str(parsed.get("text", "")).strip()
    if message_type == "post":
        return _extract_post_text(parsed).strip()

    compact = json.dumps(parsed, ensure_ascii=False, separators=(",", ":"))
    return f"[{message_type}] {compact}"


def _extract_post_text(content: dict[str, Any]) -> str:
    parts: list[str] = []
    for block in content.get("content", []):
        for item in block:
            text = item.get("text")
            if text:
                parts.append(str(text))
    return "\n".join(parts)


def _extract_sender_id(sender: Any) -> str | None:
    if not isinstance(sender, dict):
        return None

    sender_id = sender.get("id")
    if isinstance(sender_id, dict):
        return (
            sender_id.get("user_id")
            or sender_id.get("open_id")
            or sender_id.get("union_id")
        )
    if sender_id:
        return str(sender_id)
    return None
