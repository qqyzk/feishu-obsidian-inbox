import unittest

from feishu_obsidian_inbox.feishu import FeishuMessage
from feishu_obsidian_inbox.obsidian import render_messages


class RenderMessagesTest(unittest.TestCase):
    def test_uses_task_items_and_message_comments(self) -> None:
        markdown = render_messages(
            [
                FeishuMessage(
                    message_id="om_1",
                    create_time_ms=1_719_276_000_000,
                    message_type="text",
                    text="hello\nworld",
                )
            ]
        )

        self.assertIn("## 2024-06-25", markdown)
        self.assertIn("- [ ] ", markdown)
        self.assertIn("#飞书", markdown)
        self.assertIn("hello\n  world", markdown)
        self.assertIn("<!-- feishu_message_id: om_1 -->", markdown)


if __name__ == "__main__":
    unittest.main()
