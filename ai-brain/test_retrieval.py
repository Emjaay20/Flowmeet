import unittest
from rag_engine import rag_engine


class RetrievalTests(unittest.TestCase):
    def test_unknown_question_is_not_answered(self):
        result = rag_engine.evaluate_deflection("xylophone quasar marmalade")
        self.assertEqual(result.resolution_status, "HUMAN_ESCALATION_RECOMMENDED")
        self.assertEqual(result.citations, [])

    def test_routing_answer_has_a_real_source(self):
        result = rag_engine.evaluate_deflection("How does lead routing and ICP score work?")
        self.assertGreater(len(result.citations), 0)
        self.assertTrue(any(c.documentation_url == "/docs#routing" for c in result.citations))
        self.assertIn("85", result.direct_answer)


if __name__ == "__main__":
    unittest.main()
