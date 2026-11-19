# SPDX-License-Identifier: MPL-2.0
# Tests shared evidence normalization, isolation and change detection without
# defining or executing financial behavior.
import copy
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
        self.doc = samples()['code-evidence']
        self.doc['resolved'] = None
        self.source = self.doc['curation']['sources'][0]
        self.binding = self.doc['curation']['bindings'][0]
        self.binding.pop('reviewed_clause_sha256')
        self.body = '\n'.join([self.source['id'], self.source['commit_sha'], self.source['functions'][0]['name'], self.source['functions'][0]['href']])
        path = self.repo / self.source['publication_path']
        path.parent.mkdir(parents=True)
        path.write_text(self.body)
        self.source['publication_sha256'] = sha(self.body.encode())
        self.target = {'id': 'CORE-003.3', 'layer': 'coredoc', 'path': 'docs/coreDoc/core-doc.md', 'clause_sha256': 'a' * 64}
        reader = patch.object(profiles, 'read_contract', return_value={'files': {}, 'targets': {'CORE-003.3': self.target}})
        reader.start()
        self.addCleanup(reader.stop)
        self.save()

    def save(self):
        (self.repo / 'experts/code-evidence/traceability.json').write_bytes(encoded(self.doc))

    def test_code_curation_works_without_learn_snapshot_and_preserves_pins(self):
        result, _ = profiles.code_document(self.repo)
        self.assertEqual(result['resolved']['records'][0]['status'], 'reviewed')
        self.assertEqual(result['curation'], self.doc['curation'])
        self.assertFalse((self.repo / 'learn').exists())
        profiles.code_document(self.repo, check=True)

    def test_code_changes_require_recheck_without_refreshing_reviewed_hash(self):
        (self.repo / self.source['publication_path']).write_text(self.body + '\nChanged reading limits.')
        result, _ = profiles.code_document(self.repo)
        self.assertEqual(result['resolved']['records'][0]['status'], 'needs_recheck')
        self.assertEqual(result['curation'], self.doc['curation'])
        with self.assertRaisesRegex(ValueError, 'semantic recheck'):
            profiles.code_document(self.repo, check=True)

    def test_code_profile_retains_owner_commit_function_and_execution_guards(self):
        baseline = copy.deepcopy(self.doc)
        for field, value in [('commit_sha', 'main'), ('owner', 'invented-author'), ('execution_status', 'passed')]:
            self.doc = copy.deepcopy(baseline)
            self.doc['curation']['sources'][0][field] = value
            self.save()
            with self.assertRaisesRegex(ValueError, 'Code Evidence validation'):
                profiles.code_document(self.repo)

    def test_upstream_project_labels_remain_literal_markdown_text(self):
        self.doc['curation']['sources'][0]['project'] = '<img src=x onerror=alert(1)> | [unsafe]'
        self.save()
        _, markdown = profiles.code_document(self.repo)
        self.assertNotIn(b'<img', markdown)
        self.assertIn(b'&lt;img', markdown)
        self.assertIn(b'&#124;', markdown)


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
