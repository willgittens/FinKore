# SPDX-License-Identifier: MPL-2.0
# Tests embedded evidence indexing and stale-binding detection; does not define
# or execute financial behavior.
import copy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_review_traceability as tool


class ReviewTraceabilityTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.repo = Path(temporary.name)
        self.report = 'experts/reviews/reports/001-example.md'
        self.index = 'experts/reviews/traceability.json'
        self.markdown = 'experts/reviews/traceability.md'
        self.report_text = ('# Consultation\n\n<a id="er-0001-f01"></a>\n### Preserve original facts\n\n'
                            'Analyst-only assertion.\n\n<a id="interview"></a>\n## Interview\n\n'
                            'An explicitly attributed interview.\n\n<a id="er-0001-q01"></a>\n'
                            '### 1. What happened?\n\n**Answer**\n\nWe retained a different item.\n\n'
                            '<a id="er-0001-q02"></a>\n### 2. Question-only phrase?\n\n'
                            '**Answer**\n\nWe retained the original entry.\n')
        self.write(self.report, self.report_text)
        self.target = {'id': 'CORE-003.3', 'layer': 'coredoc', 'title': 'Preserve original facts',
                       'path': 'docs/coreDoc/core-doc.md', 'anchor': 'core-0033-preserve-original-facts',
                       'statement': 'An evolution SHALL preserve the original.', 'clause_sha256': 'a' * 64}
        self.contract = {'core_version': 'Test baseline', 'files': {}, 'targets': {self.target['id']: self.target}}
        report = {'id': 'ER-0001', 'specialist': 'Example Specialist', 'scope': 'Operational adjustments',
                  'path': self.report, 'interview_anchor': 'interview', 'question_count': 2,
                  'original_language': 'en', 'interview_language': 'en', 'translation_status': 'original',
                  'publication_status': 'not_recorded', 'reviewed_report_sha256': tool.sha(self.report_text.encode())}
        section, _, _ = tool.interview_content(self.report_text, report)
        report['reviewed_interview_sha256'] = tool.sha(section.encode())
        self.document = {'schema_version': tool.VERSION, 'curation': {'description': 'Bounded comparison.',
            'reports': [report],
            'mappings': [{'id': 'ER-0001-F01', 'report_id': 'ER-0001', 'report_anchor': 'er-0001-f01',
                          'claim': 'Explain the original and its correction', 'reviewed_on': '2026-11-19',
                          'evidence': [{'question': 2, 'quote': 'We retained the original entry.'}],
                          'bindings': [{'target_id': self.target['id'], 'relationship': 'already_addressed',
                                        'evidence_role': 'supports_rationale', 'explanation': 'Reconstruction needs the original.',
                                        'limits': 'No inspected banking implementation.', 'reviewed_clause_sha256': 'a' * 64}]}]},
            'resolved': None}
        self.save()
        reader = patch.object(tool, 'read_contract', side_effect=lambda repo: copy.deepcopy(self.contract))
        reader.start()
        self.addCleanup(reader.stop)

    def write(self, relative, value):
        path = self.repo / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(value if isinstance(value, bytes) else value.encode())

    def save(self):
        self.write(self.index, tool.encoded(self.document))

    def test_bidirectional_index_preserves_explicit_evidence_roles_and_scope(self):
        result = tool.build(self.repo)
        self.assertEqual(result['resolved']['by_target'], {'CORE-003.3': ['ER-0001-F01']})
        self.assertEqual(result['resolved']['by_report'], {'ER-0001': ['ER-0001-F01']})
        record = result['resolved']['records'][0]
        self.assertEqual(record['status'], 'reviewed')
        self.assertEqual(record['independent_validation'], 'pending_validation')
        self.assertEqual(record['publication_status'], 'not_recorded')
        self.assertEqual(record['translation_status'], 'original')
        self.assertEqual(record['bindings'][0]['evidence_role'], 'supports_rationale')
        self.assertEqual(result['curation'], self.document['curation'])
        markdown = (self.repo / self.markdown).read_text()
        self.assertIn('reports/001-example.md#er-0001-f01', markdown)
        self.assertIn('reports/001-example.md#er-0001-q02', markdown)
        self.assertIn('../../docs/coreDoc/core-doc.md#core-0033', markdown)

    def test_checks_and_lookups_write_nothing_and_never_discover_unregistered_sources(self):
        self.write('experts/reviews/reports/999-unregistered.md', 'PRIVATE UNREGISTERED TEXT')
        self.write('spec/unchanged.md', 'Contract must remain unchanged.')
        tool.build(self.repo)
        before = {str(p): p.read_bytes() for p in self.repo.rglob('*') if p.is_file()}
        tool.build(self.repo, check=True)
        tool.build(self.repo, preview=True)
        after = {str(p): p.read_bytes() for p in self.repo.rglob('*') if p.is_file()}
        self.assertEqual(before, after)
        self.assertNotIn('PRIVATE UNREGISTERED TEXT', (self.repo / self.markdown).read_text())
        self.assertEqual(set(result for result in tool.build(self.repo, preview=True)['resolved']['inputs']), {self.report})

    def test_report_interview_and_clause_changes_require_recheck_without_reapproval(self):
        mutations = [lambda: self.write(self.report, self.report_text.replace('Analyst-only assertion.', 'Changed analyst argument.')),
                     lambda: self.write(self.report, self.report_text.replace('We retained the original entry.', 'We removed the original entry.')),
                     lambda: self.target.update(clause_sha256='b' * 64)]
        for mutate in mutations:
            with self.subTest(mutate=mutate):
                self.write(self.report, self.report_text)
                self.target['clause_sha256'] = 'a' * 64
                self.save()
                mutate()
                result = tool.build(self.repo)
                self.assertEqual(result['resolved']['records'][0]['status'], 'needs_recheck')
                self.assertEqual(result['curation'], self.document['curation'])
                before = (self.repo / self.index).read_bytes()
                with self.assertRaisesRegex(ValueError, 'semantic recheck'):
                    tool.build(self.repo, check=True)
                self.assertEqual(before, (self.repo / self.index).read_bytes())

    def test_quote_must_be_in_the_declared_answer_not_the_question_or_analysis(self):
        for evidence in [{'question': 1, 'quote': 'We retained the original entry.'},
                         {'question': 3, 'quote': 'We retained the original entry.'},
                         {'question': 2, 'quote': 'Question-only phrase'},
                         {'question': 2, 'quote': 'Analyst-only assertion.'},
                         {'question': 2, 'quote': 'An invented quotation.'},
                         {'question': 2, 'quote': '   '}]:
            with self.subTest(evidence=evidence):
                self.document['curation']['mappings'][0]['evidence'] = [evidence]
                self.save()
                result = tool.build(self.repo)
                self.assertFalse(result['resolved']['records'][0]['quotes_verified'])
                self.assertNotIn('> ' + evidence['quote'], (self.repo / self.markdown).read_text())

    def test_missing_report_finding_interview_question_or_target_withholds_current_status(self):
        for kind in ('finding', 'interview', 'question', 'report', 'target'):
            with self.subTest(kind=kind):
                self.write(self.report, self.report_text)
                self.contract['targets'] = {self.target['id']: self.target}
                self.save()
                if kind == 'finding':
                    self.write(self.report, self.report_text.replace('<a id="er-0001-f01"></a>', ''))
                elif kind == 'interview':
                    self.write(self.report, self.report_text.split('<a id="interview"></a>')[0])
                elif kind == 'question':
                    self.write(self.report, self.report_text.split('<a id="er-0001-q02"></a>')[0])
                elif kind == 'report':
                    (self.repo / self.report).unlink()
                else:
                    self.contract['targets'] = {}
                result = tool.build(self.repo)
                self.assertEqual(result['resolved']['records'][0]['status'], 'needs_recheck')

    def test_rejects_duplicate_ids_targets_and_unregistered_report_references(self):
        mutations = [lambda d: d['curation']['mappings'].append(copy.deepcopy(d['curation']['mappings'][0])),
                     lambda d: d['curation']['reports'].append(copy.deepcopy(d['curation']['reports'][0])),
                     lambda d: d['curation']['mappings'][0]['bindings'].append(copy.deepcopy(d['curation']['mappings'][0]['bindings'][0])),
                     lambda d: d['curation']['mappings'][0].update(report_id='ER-9999')]
        original = copy.deepcopy(self.document)
        for mutate in mutations:
            self.document = copy.deepcopy(original)
            mutate(self.document)
            self.save()
            with self.assertRaises(ValueError):
                tool.build(self.repo)

    def test_schema_rejects_invented_acceptance_spec_targets_and_external_source_fields(self):
        mutations = [lambda m: m['bindings'][0].update(relationship='accepted'),
                     lambda m: m['bindings'][0].update(target_id='AUDIT-APPEND-001'),
                     lambda m: m['bindings'][0].update(evidence_role='certifies_conformance'),
                     lambda m: m['evidence'][0].update(question=0),
                     lambda m: m['evidence'][0].update(pages=[2]),
                     lambda m: m.update(report_anchor='invented')]
        original = copy.deepcopy(self.document)
        for mutate in mutations:
            self.document = copy.deepcopy(original)
            mutate(self.document['curation']['mappings'][0])
            self.save()
            with self.assertRaisesRegex(ValueError, 'schema validation'):
                tool.build(self.repo)

    def test_rejects_symlink_escape_before_reading_or_writing_evidence(self):
        outside = tempfile.TemporaryDirectory()
        self.addCleanup(outside.cleanup)
        private = Path(outside.name) / 'private.md'
        private.write_text(self.report_text)
        (self.repo / self.report).unlink()
        (self.repo / self.report).symlink_to(private)
        before = (self.repo / self.index).read_bytes()
        with self.assertRaisesRegex(ValueError, 'escapes'):
            tool.build(self.repo)
        self.assertEqual(before, (self.repo / self.index).read_bytes())
        self.assertFalse((self.repo / self.markdown).exists())

    def test_rejects_duplicate_question_anchors_and_unlabelled_answers(self):
        for text in (self.report_text + '\n<a id="er-0001-q02"></a>\n### 2. Repeated?\n\n**Answer**\nDuplicate.\n',
                     self.report_text.replace('**Answer**', '**Unattributed text**'),
                     self.report_text.replace('### 2. Question-only phrase?', '### 3. Incorrect number?')):
            self.write(self.report, text)
            self.save()
            with self.assertRaises(ValueError):
                tool.build(self.repo)

    def test_translation_status_is_explicit_and_not_automatically_approved(self):
        report = self.document['curation']['reports'][0]
        report.update(original_language='pt', translation_status='editorial_translation')
        self.save()
        result = tool.build(self.repo)
        self.assertEqual(result['resolved']['records'][0]['translation_status'], 'editorial_translation')
        self.assertEqual(result['resolved']['records'][0]['independent_validation'], 'pending_validation')
        report['translation_status'] = 'original'
        self.save()
        with self.assertRaisesRegex(ValueError, 'translated interview'):
            tool.build(self.repo)

    def test_check_detects_interrupted_or_hand_edited_generated_output(self):
        tool.build(self.repo)
        self.write(self.markdown, 'Interrupted output\n')
        with self.assertRaisesRegex(ValueError, 'stale'):
            tool.build(self.repo, check=True)
        self.assertEqual((self.repo / self.markdown).read_text(), 'Interrupted output\n')
        tool.build(self.repo)
        tool.build(self.repo, check=True)


if __name__ == '__main__':
    unittest.main()
