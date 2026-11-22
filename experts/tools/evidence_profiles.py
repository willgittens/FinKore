# SPDX-License-Identifier: MPL-2.0
# Reads collection-specific evidence and normalizes explicit comparisons; writes
# only Code Evidence's derived index. It does not define or execute financial
# behavior, infer financial rules or grant publication approval.
"""Typed evidence profiles behind the common Experts comparison model."""

import importlib.util
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

from expert_common import (REPO, atomic_write, encoded, inside, markdown_cell,
                           read_contract, sha, target_link, validate_schema, verify_inputs)

COLLECTIONS = ('research', 'legacy', 'reviews', 'code-evidence')
BUILDERS = {'research': 'build_traceability.py', 'legacy': 'build_legacy_traceability.py',
            'reviews': 'build_review_traceability.py'}


def local_builder(collection):
    path = REPO / 'experts' / collection / 'tools' / BUILDERS[collection]
    name = 'finkore_experts_' + collection.replace('-', '_')
    if name not in sys.modules:
        sys.path.insert(0, str(path.parent))
        spec = importlib.util.spec_from_file_location(name, path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[name] = module
        spec.loader.exec_module(module)
    return sys.modules[name]


def code_document(repo, check=False, preview=False):
    """Validate compact canonical JSON; only its navigation view is generated."""
    path = inside(repo, repo / 'experts/code-evidence/traceability.json')
    original = path.read_bytes()
    doc = json.loads(original)
    result = subprocess.run(['node', str(REPO / 'experts/code-evidence/tools/evidence.js'),
                             '--export', str(repo)], capture_output=True, cwd=REPO)
    if result.returncode:
        raise ValueError('Code Evidence validation failed: ' + result.stderr.decode(errors='replace'))
    exported = json.loads(result.stdout)
    if doc['schema_version'] != '2.0.0':
        raise ValueError('Unsupported compact Code Evidence format')
    doc['resolved'] = {'records': exported['records'], 'inputs': exported['inputs']}
    body = exported['markdown'].encode()
    report = path.with_suffix('.md')
    if path.read_bytes() != original:
        raise ValueError('Code Evidence curation changed during build')
    verify_inputs(repo, exported['inputs'])
    if check:
        if not report.is_file() or report.read_bytes() != body:
            raise ValueError('Code Evidence view is stale; rebuild')
        if any(r['assessment']['freshness'] != 'current' for r in exported['records']):
            raise ValueError('Code Evidence comparisons require semantic recheck')
    elif not preview:
        atomic_write(report, body)
    return doc, body


def load_collection(repo, collection, write=False):
    """Specialist validators remain authoritative for source structure and currentness."""
    if collection == 'code-evidence':
        return code_document(repo, preview=not write)
    module = local_builder(collection)
    doc = module.build(repo, preview=not write)
    return doc, module.render(doc).encode('utf-8')


def binding(item, contract, limits):
    tid = item['target_id']
    target = contract['targets'].get(tid)
    reviewed = item.get('reviewed_clause_sha256') or item.get('clause_sha256') or item.get('reviewed_clause', {}).get('sha256')
    return {'target_id': tid, 'target_path': target['path'] if target else item.get('target_path'),
            'reviewed_clause_sha256': reviewed,
            'current_clause_sha256': target['clause_sha256'] if target else None,
            'relationship': item['relationship'], 'evidence_role': item['evidence_role'],
            'explanation': item['explanation'], 'limits': item.get('limits', limits),
            **({'implementation_relationship': item['implementation_relationship']} if 'implementation_relationship' in item else {})}


def normalize(collection, doc, contract):
    """Export the shared comparison shape while retaining typed source details."""
    if collection == 'code-evidence' and doc['schema_version'] == '2.0.0':
        return doc['resolved']['records']
    output = []
    curation = doc['curation']
    rows = doc['resolved']['records']
    mappings = {m['id']: m for m in curation.get('mappings', [])}
    for row in rows:
        mid = row.get('mapping_id', row.get('id'))
        item = mappings.get(mid, row)
        refs, groups, details, reviewed, observed = [], [], {}, {}, {}
        authorization, eligible = 'not_recorded', None
        if collection == 'research':
            kind, source_id = 'academic_review', item['review_id']
            refs = [{'path': 'experts/research/allFindings.md', 'anchor': source_id.lower(), 'label': source_id}]
            refs += [{'path': 'experts/research/allFindings.md', 'anchor': e.lower(), 'label': e} for e in item['evidence_ids']]
            groups = row['work_ids'] or ['review:' + source_id]
            details = {k: row[k] for k in ('review_id', 'work_ids', 'origin_ids', 'source_readiness', 'source_assessment', 'unreviewed_reference_candidates')}
            details['evidence_ids'] = item['evidence_ids']
            reviewed, observed = item['checked_source'], row['observed_source']
            limits = item['conditions_and_limits'] or 'Source and interpretation require further assessment.'
            eligible = row['learn_eligible']
        elif collection == 'legacy':
            kind, source_id = 'practitioner_interview', item['interview_id']
            source = next(i for i in curation['interviews'] if i['id'] == source_id)
            checked = next(i for i in doc['resolved']['interviews'] if i['id'] == source_id)
            refs = [{'path': e['source'], 'anchor': e['source_anchor'], 'label': source['name']} for e in row['evidence']]
            groups = [source_id]
            details = {'interview_id': source_id, 'speaker': source['name'], 'evidence': row['evidence'],
                       'related_research': row['related_research'], 'publication_approval': checked['publication_approval']}
            reviewed = {'source_sha256': source['reviewed_source_sha256']}
            observed = {'source_sha256': checked['observed_sha256']}
            limits, eligible = item['conditions_and_limits'], row['editorial_eligible']
            authorization = 'authorized'  # read_interview requires explicit approval; never inferred from analyst status.
        elif collection == 'reviews':
            kind, source_id = 'specialist_consultation', item['report_id']
            source = next(r for r in curation['reports'] if r['id'] == source_id)
            refs = [{'path': source['path'], 'anchor': f'{source_id.lower()}-q{e["question"]:02d}',
                     'label': f'{source_id} answer {e["question"]}'} for e in item['evidence']]
            groups = [source_id]
            details = {k: source[k] for k in ('specialist', 'question_count', 'original_language', 'interview_language', 'translation_status')}
            details.update(evidence=item['evidence'], quotes_verified=row['quotes_verified'])
            reviewed = {'report_sha256': source['reviewed_report_sha256'], 'interview_sha256': source['reviewed_interview_sha256']}
            observed = {'report_sha256': row['report_sha256']}
            limits = 'The consultation supplies bounded operational context; see each binding for its precise limits.'
            authorization = source['publication_status']
        else:
            kind = 'pinned_code_analysis'
            source = row['source']
            source_id = source['id']
            refs = [{'path': source['publication_path'], 'anchor': source_id.lower(), 'label': source['project']}]
            groups = [source['repository'] + '@' + source['commit_sha']]
            details = {k: source[k] for k in ('project', 'repository', 'owner', 'version', 'commit_sha', 'functions', 'reading_extent', 'execution_status')}
            reviewed = {'analysis_sha256': source['publication_sha256']}
            observed = {'analysis_sha256': row['observed_analysis_sha256']}
            limits = source['limits']
        local_status = row['status']
        curated = item.get('curation_status', 'reviewed')
        output.append({'key': collection + '/' + mid, 'id': mid, 'collection': collection,
                       'claim': item.get('claim', row.get('source', {}).get('title', '')),
                       'local_index': {'path': f'experts/{collection}/traceability.md', 'anchor': mid.lower()},
                       'source': {'kind': kind, 'id': source_id, 'groups': groups, 'references': refs,
                                  'reviewed_fingerprints': reviewed, 'observed_fingerprints': observed, 'details': details},
                       'assessment': {'curation': curated,
                                      'freshness': 'needs_recheck' if local_status == 'needs_recheck' else 'current',
                                      'independent_validation': 'pending_validation',
                                      'publication_authorization': authorization, 'editorial_eligible': eligible,
                                      'recheck_reasons': row['recheck_reasons']},
                       'bindings': [binding(b, contract, limits) for b in item['bindings']]})
    if collection == 'code-evidence':
        output.extend(doc['resolved'].get('cohort_records', []))
    return output
