# SPDX-License-Identifier: MPL-2.0
# Tests shared evidence normalization, isolation and change detection without
# defining or executing financial behavior.
import copy
import io
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import build_expert_traceability as tool
import evidence_profiles as profiles
from expert_common import encoded, read_contract, sha


def samples():
    binding = {'target_id': 'CORE-003.3', 'relationship': 'already_addressed',
               'evidence_role': 'supports_rationale', 'explanation': 'Preserve the link to original facts.',
               'reviewed_clause_sha256': 'a' * 64}
    research = {'schema_version': '1.0.0', 'curation': {'mappings': [{
        'id': 'MAP-0001', 'review_id': 'REV-0001', 'claim': 'Academic claim',
        'curation_status': 'pending_evidence', 'checked_source': None, 'evidence_ids': ['EVD-0001'],
        'conditions_and_limits': 'Selected passages only.',
        'bindings': [{**binding, 'reviewed_clause': {'sha256': 'a' * 64}}]}]},
        'resolved': {'research_sources': {}, 'records': [{
            'mapping_id': 'MAP-0001', 'status': 'pending_evidence', 'recheck_reasons': [],
            'review_id': 'REV-0001', 'work_ids': ['work:shared-study'], 'origin_ids': ['session/FND-0001'],
            'source_readiness': 'needs_more_evidence', 'source_assessment': 'preliminary',
            'unreviewed_reference_candidates': ['AUDIT-APPEND-001'], 'observed_source': None, 'learn_eligible': False}]}}
    legacy = {'schema_version': '1.0.0', 'curation': {'interviews': [{
        'id': 'LEGACY-001', 'name': 'Example Speaker', 'reviewed_source_sha256': 'b' * 64}],
        'mappings': [{'id': 'LGC-0001', 'interview_id': 'LEGACY-001', 'claim': 'Operational history',
                      'curation_status': 'reviewed', 'conditions_and_limits': 'Personal account.', 'bindings': [binding]}]},
        'resolved': {'inputs': {}, 'interviews': [{'id': 'LEGACY-001', 'publication_approval': 'Explicitly approved',
                                                'observed_sha256': 'b' * 64}],
                     'records': [{'mapping_id': 'LGC-0001', 'status': 'reviewed', 'recheck_reasons': [],
                                  'editorial_eligible': True, 'related_research': [], 'evidence': [{
                                      'source': 'experts/legacy/interviews/001-example.md', 'source_anchor': 'answer',
                                      'exact_quote': 'The original remained.', 'verified': True}]}]}}
    reviews = {'schema_version': '2.0.0', 'curation': {'reports': [{
        'id': 'ER-0001', 'path': 'experts/reviews/reports/001-example.md', 'specialist': 'Example Specialist',
        'question_count': 2, 'original_language': 'pt', 'interview_language': 'en',
        'translation_status': 'editorial_translation', 'publication_status': 'not_recorded',
        'reviewed_report_sha256': 'c' * 64, 'reviewed_interview_sha256': 'd' * 64}],
        'mappings': [{'id': 'ER-0001-F01', 'report_id': 'ER-0001', 'claim': 'Specialist comparison',
                      'evidence': [{'question': 2, 'quote': 'The original remained.'}], 'bindings': [binding]}]},
        'resolved': {'inputs': {}, 'records': [{'id': 'ER-0001-F01', 'status': 'reviewed', 'recheck_reasons': [],
                                              'quotes_verified': True, 'report_sha256': 'c' * 64}]}}
    source = {'id': 'CE-FINDING-0001', 'kind': 'code', 'title': 'Code finding', 'project': 'Example Money',
              'repository': 'example/money', 'owner': 'example', 'version': 'v1.0.0', 'commit_sha': 'e' * 40,
              'functions': [{'name': 'Money.correct', 'href': 'https://github.com/example/money/blob/' + 'e' * 40 + '/src/money.js#L1-L2'}],
              'reading_extent': 'selected_code_and_tests', 'execution_status': 'not_executed',
              'limits': 'Selected code path only.', 'status': 'pending_validation',
              'publication_path': 'experts/code-evidence/analyses/CE-REPO-0001/CE-EDITION-0001.md',
              'publication_sha256': 'f' * 64}
    source['href'] = 'https://github.com/willgittens/FinKore/blob/main/' + source['publication_path'] + '#ce-finding-0001'
    code = {'schema_version': '1.0.0', 'curation': {'description': 'Explicit code comparisons.', 'sources': [source],
            'bindings': [{'source_id': source['id'], **binding, 'target_path': 'docs/coreDoc/core-doc.md',
                          'clause_sha256': 'a' * 64, 'implementation_relationship': 'same_approach'}]},
            'resolved': {'inputs': {}, 'records': [{'id': source['id'], 'source': source, 'status': 'reviewed',
                         'recheck_reasons': [], 'observed_analysis_sha256': 'f' * 64, 'bindings': [binding]}]}}
    return {'research': research, 'legacy': legacy, 'reviews': reviews, 'code-evidence': code}


class ExpertsTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.repo = Path(temporary.name)
        self.docs = samples()
        self.target = {'id': 'CORE-003.3', 'layer': 'coredoc', 'title': 'Preserve original facts',
                       'path': 'docs/coreDoc/core-doc.md', 'anchor': 'core-0033-preserve-original-facts',
                       'clause_sha256': 'a' * 64, 'statement': 'Original facts SHALL be preserved.'}
        self.contract = {'core_version': 'Test baseline', 'files': {}, 'targets': {self.target['id']: self.target}}
        for collection, doc in self.docs.items():
            self.write(f'experts/{collection}/traceability.json', encoded(doc))
            self.write(f'experts/{collection}/traceability.md', b'# Local index\n')
        self.contract_patch = patch.object(tool, 'read_contract', return_value=self.contract)
        self.contract_patch.start()
        self.addCleanup(self.contract_patch.stop)
        loader_patch = patch.object(tool, 'load_collection', side_effect=self.load)
        self.loader = loader_patch.start()
        self.addCleanup(loader_patch.stop)

    def write(self, path, value):
        p = self.repo / path
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(value)

    def load(self, repo, collection, write=False):
        return copy.deepcopy(self.docs[collection]), b'# Local index\n'

    def test_all_profiles_preserve_ids_roles_context_and_separate_states(self):
        result = tool.build(self.repo)
        self.assertEqual(result['status'], 'current')
        self.assertEqual(len(result['by_target']['CORE-003.3']), 4)
        rows = {r['collection']: r for r in result['records']}
        self.assertEqual(rows['research']['assessment']['curation'], 'pending_evidence')
        self.assertFalse(rows['research']['assessment']['editorial_eligible'])
        self.assertEqual(rows['legacy']['assessment']['publication_authorization'], 'authorized')
        self.assertEqual(rows['reviews']['assessment']['publication_authorization'], 'not_recorded')
        self.assertEqual(rows['reviews']['source']['details']['translation_status'], 'editorial_translation')
        code = rows['code-evidence']['source']['details']
        self.assertEqual(code['owner'], 'example')
        self.assertNotIn('author', code)
        self.assertEqual(code['execution_status'], 'not_executed')
        self.assertTrue(all(r['assessment']['independent_validation'] == 'pending_validation' for r in result['records']))
        self.assertTrue(all(r['bindings'][0]['evidence_role'] == 'supports_rationale' for r in result['records']))

    def test_check_and_lookups_are_read_only_and_do_not_publish(self):
        self.write('learn/related-evidence.json', b'{"unchanged":"publication"}\n')
        tool.build(self.repo)
        before = {str(p): p.read_bytes() for p in self.repo.rglob('*') if p.is_file()}
        tool.build(self.repo, check=True)
        tool.build(self.repo, preview=True)
        after = {str(p): p.read_bytes() for p in self.repo.rglob('*') if p.is_file()}
        self.assertEqual(before, after)
        self.assertTrue(all(not call.kwargs['write'] for call in self.loader.call_args_list[-8:]))

    def test_invalid_collection_does_not_hide_others_or_become_no_evidence(self):
        def broken(repo, collection, write=False):
            if collection == 'research':
                raise ValueError('Research source requires consolidation')
            return self.load(repo, collection, write)
        self.loader.side_effect = broken
        result = tool.build(self.repo)
        self.assertEqual(result['status'], 'incomplete')
        self.assertEqual(result['collections']['research']['status'], 'invalid')
        self.assertEqual(len(result['records']), 3)
        self.assertIn('Unavailable or invalid collections', tool.render(result))
        with self.assertRaisesRegex(ValueError, 'recheck'):
            tool.build(self.repo, check=True)

    def test_missing_collection_is_explicit_and_lookup_can_return_other_sources(self):
        (self.repo / 'experts/reviews/traceability.json').unlink()
        result = tool.build(self.repo, preview=True)
        self.assertEqual(result['collections']['reviews']['status'], 'unavailable')
        self.assertEqual(len(result['by_target']['CORE-003.3']), 3)
        self.assertFalse((self.repo / 'experts/traceability.json').exists())

    def test_stale_source_and_negative_curation_never_become_approved(self):
        self.docs['research']['curation']['mappings'][0]['curation_status'] = 'not_recommended'
        self.docs['research']['resolved']['records'][0].update(status='not_recommended')
        review = self.docs['reviews']['resolved']['records'][0]
        review.update(status='needs_recheck', recheck_reasons=['interview_changed'])
        for kind, doc in self.docs.items():
            self.write(f'experts/{kind}/traceability.json', encoded(doc))
        result = tool.build(self.repo)
        rows = {r['collection']: r for r in result['records']}
        self.assertEqual(rows['research']['assessment']['curation'], 'not_recommended')
        self.assertEqual(rows['reviews']['assessment']['freshness'], 'needs_recheck')
        self.assertEqual(rows['reviews']['assessment']['recheck_reasons'], ['interview_changed'])
        self.assertEqual(rows['legacy']['assessment']['freshness'], 'current')

    def test_same_study_remains_one_source_group_across_multiple_comparisons(self):
        doc = self.docs['research']
        second_item = copy.deepcopy(doc['curation']['mappings'][0])
        second_item.update(id='MAP-0002', review_id='REV-0002')
        second_row = copy.deepcopy(doc['resolved']['records'][0])
        second_row.update(mapping_id='MAP-0002', review_id='REV-0002')
        doc['curation']['mappings'].append(second_item)
        doc['resolved']['records'].append(second_row)
        normalized = profiles.normalize('research', doc, self.contract)
        result = tool.assemble(self.contract, {}, normalized, {})
        self.assertEqual(result['by_source']['research/work:shared-study'], ['research/MAP-0001', 'research/MAP-0002'])
        self.assertNotIn('independent_sources', result['counts'])

    def test_duplicate_comparison_keys_or_targets_are_rejected(self):
        record = profiles.normalize('reviews', self.docs['reviews'], self.contract)[0]
        with self.assertRaisesRegex(ValueError, 'Duplicate global'):
            tool.assemble(self.contract, {}, [record, record], {})
        record['bindings'].append(copy.deepcopy(record['bindings'][0]))
        with self.assertRaisesRegex(ValueError, 'Duplicate target'):
            tool.assemble(self.contract, {}, [record], {})

    def test_unmapped_cohort_records_keep_source_and_collection_navigation(self):
        doc = self.docs['code-evidence']
        row = profiles.normalize('code-evidence', doc, self.contract)[0]
        row.update(id='CE-COMPARISON-0001', key='code-evidence/CE-COMPARISON-0001', bindings=[])
        row['assessment'].update(curation='pending_curation', editorial_eligible=False)
        row['source']['details'].update(disposition='not_mapped', reason='Unresolved future domain.')
        doc['resolved']['cohort_records'] = [row]
        records = profiles.normalize('code-evidence', doc, self.contract)
        result = tool.assemble(self.contract, {}, records, {})
        key = row['key']
        self.assertIn(key, result['by_collection']['code-evidence'])
        self.assertIn(key, result['by_source']['code-evidence/' + row['source']['groups'][0]])
        self.assertNotIn(key, result['by_target']['CORE-003.3'])
        self.assertEqual(records[-1]['assessment']['publication_authorization'], 'not_recorded')

    def test_source_lookup_is_read_only(self):
        document = tool.build(self.repo)
        paths = [self.repo / 'experts/traceability.json', self.repo / 'experts/traceability.md']
        before = [p.read_bytes() for p in paths]
        source = next(iter(document['by_source']))
        output = io.StringIO()
        with patch('sys.stdout', output), patch.object(tool, 'build', return_value=document) as build:
            tool.main(['--repo-root', str(self.repo), '--source', source])
        self.assertTrue(build.call_args.kwargs['preview'])
        selected = json.loads(output.getvalue())['records']
        self.assertEqual([r['key'] for r in selected], document['by_source'][source])
        self.assertEqual(before, [p.read_bytes() for p in paths])

    def test_stale_local_output_and_hand_edited_global_output_are_detected(self):
        tool.build(self.repo)
        self.write('experts/traceability.md', b'Hand-edited global output\n')
        with self.assertRaisesRegex(ValueError, 'stale'):
            tool.build(self.repo, check=True)
        self.assertEqual((self.repo / 'experts/traceability.md').read_text(), 'Hand-edited global output\n')
        self.write('experts/reviews/traceability.md', b'Stale local view\n')
        result = tool.build(self.repo, preview=True)
        self.assertEqual(result['collections']['reviews']['status'], 'stale')

    def test_concurrent_source_change_is_detected_before_global_output(self):
        self.write('experts/reviews/reports/source.md', b'Before')
        self.docs['reviews']['resolved']['inputs'] = {'experts/reviews/reports/source.md': sha(b'Before')}
        def changed(repo, collection, write=False):
            doc, markdown = self.load(repo, collection, write)
            if collection == 'reviews':
                self.write('experts/reviews/reports/source.md', b'After')
            return doc, markdown
        self.loader.side_effect = changed
        with self.assertRaisesRegex(ValueError, 'Input changed'):
            tool.build(self.repo)
        self.assertFalse((self.repo / 'experts/traceability.json').exists())

    def test_different_collection_snapshots_cannot_overwrite_an_earlier_input_guard(self):
        path = 'experts/shared-source.md'
        self.write(path, b'After')
        self.docs['research']['resolved']['inputs'] = {path: sha(b'Before')}
        self.docs['legacy']['resolved']['inputs'] = {path: sha(b'After')}
        with self.assertRaisesRegex(ValueError, 'Input changed'):
            tool.build(self.repo)
        self.assertFalse((self.repo / 'experts/traceability.json').exists())


class CodeProfileTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.repo = Path(temporary.name)
        self.path = self.repo / 'experts/code-evidence/traceability.json'
        self.path.parent.mkdir(parents=True)
        self.doc = {'schema_version': '2.0.0', 'records': [], 'publications': {}}
        self.path.write_bytes(encoded(self.doc))
        self.row = profiles.normalize('code-evidence', samples()['code-evidence'],
                                      {'targets': {'CORE-003.3': {'path': 'docs/coreDoc/core-doc.md', 'clause_sha256': 'a' * 64}}})[0]
        self.exported = {'schema_version': '2.0.0', 'records': [self.row], 'inputs': {},
                         'markdown': '# Compact navigation\n'}
        runner = patch.object(profiles.subprocess, 'run', side_effect=self.export)
        self.runner = runner.start()
        self.addCleanup(runner.stop)

    def export(self, *args, **kwargs):
        return subprocess.CompletedProcess(args, 0, encoded(self.exported), b'')

    def test_compact_curation_stays_canonical_without_persisted_resolved_copy(self):
        before = self.path.read_bytes()
        result, markdown = profiles.code_document(self.repo)
        self.assertEqual(self.path.read_bytes(), before)
        self.assertNotIn('resolved', json.loads(before))
        self.assertEqual(result['resolved']['records'], [self.row])
        self.assertEqual(self.path.with_suffix('.md').read_bytes(), markdown)
        self.assertFalse((self.repo / 'learn').exists())
        profiles.code_document(self.repo, check=True)

    def test_compact_check_and_preview_do_not_write_or_publish(self):
        profiles.code_document(self.repo)
        before = {str(p): p.read_bytes() for p in self.repo.rglob('*') if p.is_file()}
        profiles.code_document(self.repo, check=True)
        profiles.code_document(self.repo, preview=True)
        self.assertEqual(before, {str(p): p.read_bytes() for p in self.repo.rglob('*') if p.is_file()})

    def test_compact_stale_interpretation_does_not_refresh_curation(self):
        self.row['assessment'].update(freshness='needs_recheck', recheck_reasons=['evidence_record_changed'])
        profiles.code_document(self.repo)
        with self.assertRaisesRegex(ValueError, 'semantic recheck'):
            profiles.code_document(self.repo, check=True)
        self.assertEqual(json.loads(self.path.read_bytes()), self.doc)

    def test_compact_source_validator_failure_is_explicit(self):
        self.runner.side_effect = None
        self.runner.return_value = subprocess.CompletedProcess([], 1, b'', b'Invalid source pin')
        with self.assertRaisesRegex(ValueError, 'Invalid source pin'):
            profiles.code_document(self.repo)
        self.assertFalse(self.path.with_suffix('.md').exists())

    def test_compact_normalization_uses_the_validated_export(self):
        doc, _ = profiles.code_document(self.repo, preview=True)
        self.assertEqual(profiles.normalize('code-evidence', doc, {}), [self.row])


@unittest.skipUnless(shutil.which('git'), 'Git is needed to check contract revision stability')
class ContractRevisionTests(unittest.TestCase):
    def test_evidence_only_commits_do_not_make_contract_reference_stale(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            files = {
                'docs/coreDoc/core-doc.md': '# CoreDoc\n\n**CoreDoc version:** Test\n\n### CORE-003.3 — Preserve facts\n\n**Rule**\n\nOriginal facts SHALL remain.\n',
                'spec/README.md': '# Specification\n',
                'conformance/manifest.json': '{"suites": []}\n',
                'conformance/traceability.md': '# Traceability\n',
                'agentic/operations.md': '# Operations\n',
                'agentic/safety.md': '# Safety\n',
                'agentic/effects.md': '# Effects\n'}
            for relative, text in files.items():
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text)
            def git(*args):
                return subprocess.check_output(['git', '-c', 'core.hooksPath=/dev/null',
                    '-c', 'commit.gpgsign=false', '-c', 'user.name=Evidence Test',
                    '-c', 'user.email=evidence@example.invalid', *args], cwd=root, stderr=subprocess.DEVNULL).decode().strip()
            git('init', '-q')
            git('add', '.')
            git('commit', '-qm', 'Contract baseline')
            before = read_contract(root)
            (root / 'README.md').write_text('Evidence tooling documentation.\n')
            git('add', '.')
            git('commit', '-qm', 'Editorial change')
            after = read_contract(root)
            self.assertEqual(before, after)
            self.assertNotEqual(after['repository_revision'], git('rev-parse', 'HEAD'))
            path = root / 'docs/coreDoc/core-doc.md'
            path.write_text(path.read_text().replace('SHALL remain', 'SHALL remain attributable'))
            self.assertNotEqual(before['files'], read_contract(root)['files'])
            git('add', '.')
            git('commit', '-qm', 'Changed contract')
            self.assertNotEqual(before['repository_revision'], read_contract(root)['repository_revision'])


if __name__ == '__main__':
    unittest.main()
