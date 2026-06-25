import unittest

from feishu_obsidian_inbox.feishu import FeishuMessage
from feishu_obsidian_inbox.state import SyncState


def message(message_id: str, create_time_ms: int) -> FeishuMessage:
    return FeishuMessage(
        message_id=message_id,
        create_time_ms=create_time_ms,
        message_type="text",
        text=message_id,
    )


class SyncStateTest(unittest.TestCase):
    def test_filter_new_messages_skips_recent_ids_and_old_messages(self) -> None:
        state = SyncState(
            last_message_create_time_ms=2000,
            recent_message_ids=["seen"],
        )

        self.assertEqual(
            state.filter_new_messages(
                [message("old", 1999), message("seen", 2000), message("new", 2000)]
            ),
            [message("new", 2000)],
        )

    def test_filter_new_messages_skips_system_and_empty_messages(self) -> None:
        state = SyncState()

        self.assertEqual(
            state.filter_new_messages(
                [
                    FeishuMessage(
                        message_id="system",
                        create_time_ms=1000,
                        message_type="system",
                        text="created group",
                    ),
                    FeishuMessage(
                        message_id="empty",
                        create_time_ms=1000,
                        message_type="text",
                        text="",
                    ),
                    message("new", 1000),
                ]
            ),
            [message("new", 1000)],
        )

    def test_record_sync_keeps_recent_message_ids_bounded(self) -> None:
        state = SyncState(recent_message_ids=["a", "b"])

        state.record_sync(
            [message("b", 2000), message("c", 3000), message("d", 4000)],
            recent_message_limit=3,
            recent_sync_limit=2,
            dry_run=False,
        )

        self.assertEqual(state.last_message_create_time_ms, 4000)
        self.assertEqual(state.recent_message_ids, ["b", "c", "d"])
        self.assertEqual(len(state.recent_syncs), 1)


if __name__ == "__main__":
    unittest.main()
