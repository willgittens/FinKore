# SPDX-License-Identifier: MPL-2.0
# Rebuilds optional collection indexes and a generated cross-collection evidence
# view, or checks them without writing. It does not define or execute financial
# behavior, approve evidence or publish Learn content.
"""Build the common Experts index while preserving specialist source validation."""

import argparse
import json
import posixpath
from collections import Counter, defaultdict
from pathlib import Path

from expert_common import (REPO, atomic_write, encoded, inside, markdown_cell as cell,
                           read_contract, sha, validate_schema, verify_inputs)
from evidence_profiles import COLLECTIONS, load_collection, normalize

VERSION = '1.0.0'
SCHEMA = REPO / 'experts/schemas/traceability.schema.json'


def track_inputs(inputs, additions):
    for path, fingerprint in additions.items():
        if path in inputs and inputs[path] != fingerprint:
            raise ValueError('Input changed between collection builds: ' + path)
        inputs[path] = fingerprint


def collect(repo, contract, write=False):
    collections, records, inputs = {}, [], {}
    for collection in COLLECTIONS:
        relative = f'experts/{collection}/traceability.json'
        path = inside(repo, repo / relative)
        info = {'index': relative, 'status': 'unavailable', 'format_version': None, 'errors': []}
        if not path.is_file():
            info['errors'] = ['Collection index is unavailable; coverage is incomplete.']
            collections[collection] = info
            continue
        try:
            # A read-only lookup always recomputes source validation instead of trusting saved resolved data.
            doc, markdown = load_collection(repo, collection, write=write)
            track_inputs(inputs, {relative: sha(path.read_bytes())})
            info['format_version'] = doc['schema_version']
            normalized = normalize(collection, doc, contract)
            has_recheck = any(r['assessment']['freshness'] != 'current' for r in normalized)
            local_md = path.with_suffix('.md')
            canonical_doc = {k: v for k, v in doc.items() if k != 'resolved'} if collection == 'code-evidence' and doc['schema_version'] == '2.0.0' else doc
            stale = json.loads(path.read_bytes()) != canonical_doc or not local_md.is_file() or local_md.read_bytes() != markdown
            info['status'] = 'needs_recheck' if has_recheck else 'stale' if stale else 'current'
            if stale:
                info['errors'].append('Local generated output is stale; rebuild before relying on the index.')
            # Guard live inputs as well as the saved local indexes against concurrent edits.
            resolved = doc['resolved']
            track_inputs(inputs, resolved.get('inputs', {}))
            if collection == 'research':
                track_inputs(inputs, {f'experts/research/{k}': v for k, v in resolved['research_sources'].items()})
            records.extend(normalized)
        except (OSError, ValueError, KeyError, TypeError) as error:
            info['status'] = 'invalid'
            info['errors'] = [str(error)]
            track_inputs(inputs, {relative: sha(path.read_bytes())})
        collections[collection] = info
    return collections, records, inputs


def assemble(contract, collections, records, inputs):
    by_target, by_collection, by_source, targets, keys = defaultdict(list), defaultdict(list), defaultdict(list), {}, set()
    for record in records:
        key = record['key']
        if key in keys:
            raise ValueError('Duplicate global comparison key: ' + key)
        keys.add(key)
        by_collection[record['collection']].append(key)
        for source in record['source']['groups']:
            by_source[record['collection'] + '/' + source].append(key)
        seen = set()
        for binding in record['bindings']:
            tid = binding['target_id']
            if tid in seen:
                raise ValueError('Duplicate target in comparison: ' + key)
            seen.add(tid)
            by_target[tid].append(key)
            if tid in contract['targets']:
                target = contract['targets'][tid]
                targets[tid] = {k: target[k] for k in ('id', 'layer', 'title', 'path', 'anchor', 'clause_sha256') if k in target}
    complete = all(c['status'] == 'current' for c in collections.values())
    return {'schema_version': VERSION, 'core_version': contract['core_version'],
            'status': 'current' if complete else 'incomplete', 'collections': collections,
            'inputs': dict(sorted(inputs.items())), 'records': records, 'targets': dict(sorted(targets.items())),
            'by_target': dict(sorted(by_target.items())), 'by_collection': dict(sorted(by_collection.items())),
            'by_source': dict(sorted(by_source.items())),
            'counts': {'comparisons': len(records), 'bindings': sum(len(r['bindings']) for r in records),
                       'targets': len(by_target), 'collections': dict(Counter(c['status'] for c in collections.values())),
                       'curation': dict(Counter(r['assessment']['curation'] for r in records)),
                       'freshness': dict(Counter(r['assessment']['freshness'] for r in records))}}


def link(path, anchor=None):
    return posixpath.relpath(path, 'experts') + ('#' + anchor if anchor else '')


def render(document):
    records = {r['key']: r for r in document['records']}
    counts = document['counts']
    lines = ['# Experts — unified traceability', '',
             '<!-- Generated by tools/build_expert_traceability.py. Curate comparisons in their collections. -->', '',
             f"Baseline: {document['core_version']}. {counts['comparisons']} comparisons, {counts['bindings']} bindings and {counts['targets']} target rules. Index status: `{document['status']}`.", '',
             'This generated index includes supporting comparisons, risks, counterpoints and limited or pending assessments. It does not accept financial requirements, establish implementation conformance or grant publication authorization. Repeated passages and shared sources are not independent corroboration.', '',
             '- [Collection availability](#collection-availability)', '- [By rule](#by-rule)', '- [By collection](#by-collection)', '',
             '## Collection availability', '', '| Collection | Status | Details |', '| --- | --- | --- |']
    for name, item in document['collections'].items():
        lines.append(f"| [{name}]({name}/README.md) | {item['status']} | " + cell('; '.join(item['errors']) or 'Specialist source checks applied.') + ' |')
    lines += ['', 'Unavailable or invalid collections remain explicit above. Their absence must not be read as a rule having no related evidence.', '',
              '## By rule', '', '| Rule | Research | Legacy | Reviews | Code Evidence |', '| --- | --- | --- | --- | --- |']
    for tid, keys in document['by_target'].items():
        target = document['targets'].get(tid)
        title = f"[{tid}]({link(target['path'], target.get('anchor'))})" if target else tid + ' (target missing)'
        cells = []
        for collection in COLLECTIONS:
            selected = [records[k] for k in keys if records[k]['collection'] == collection]
            cells.append(', '.join(f"[{r['id']}]({link(r['local_index']['path'], r['local_index']['anchor'])})" for r in selected) or '—')
        lines.append('| ' + title + ' | ' + ' | '.join(cells) + ' |')
    lines += ['', '## By collection', '']
    for name in COLLECTIONS:
        lines += [f'### {name}', '', f'[Collection index]({name}/traceability.md).', '',
                  '| Comparison | Claim | Curation | Freshness | Publication authorization |', '| --- | --- | --- | --- | --- |']
        for key in document['by_collection'].get(name, []):
            r = records[key]
            status = r['assessment']
            lines.append(f"| [{r['id']}]({link(r['local_index']['path'], r['local_index']['anchor'])}) | {cell(r['claim'])} | {status['curation']} | {status['freshness']} | {status['publication_authorization']} |")
    lines += ['', '## Reading the index', '',
              'Curation, freshness, independent validation and publication authorization are separate fields. `reviewed` describes an analyst-curated comparison; it is not specialist approval of a rule or permission to publish. Pending and negative assessments remain visible.', '',
              'Evidence roles, relationships, explanations, limits, reviewed/current fingerprints and typed source details are retained in [traceability.json](traceability.json). Its `by_source` grouping supports source-aware navigation; it does not assert that groups are independent studies or implementations.', '',
              'Research and Legacy may reference CoreDoc and specification requirements. Reviews and Code Evidence retain their CoreDoc-only binding boundaries. Explicit Code Evidence dispositions without a target remain in collection/source queries with no artificial binding. Historical and current comparisons of one finding share a source group and are not additional independent support. Code ownership is not inferred authorship; reading tests is not execution; translated interview excerpts are identified explicitly.', '',
              'Use the [shared tools](tools/README.md) to rebuild, check or look up a rule. The index is generated, has no second manual curation and does not change the Learn publication snapshot or normative conformance traceability.', '']
    return '\n'.join(lines)


def build(repo=REPO, check=False, preview=False):
    repo = repo.resolve()
    path = inside(repo / 'experts', repo / 'experts/traceability.json')
    markdown_path = path.with_suffix('.md')
    contract = read_contract(repo)
    collections, records, inputs = collect(repo, contract, write=not (check or preview))
    document = assemble(contract, collections, records, inputs)
    validate_schema(document, SCHEMA, label='Experts')
    verify_inputs(repo, {**contract['files'], **inputs})
    data, markdown = encoded(document), render(document).encode()
    if check:
        if not path.is_file() or path.read_bytes() != data or not markdown_path.is_file() or markdown_path.read_bytes() != markdown:
            raise ValueError('Global Experts index is stale; rebuild')
        if document['status'] != 'current':
            raise ValueError('Experts evidence requires recheck; see collection availability')
    elif not preview:
        atomic_write(path, data)
        atomic_write(markdown_path, markdown)
    return document


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo-root', type=Path, default=REPO)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true')
    mode.add_argument('--target', help='Look up one CoreDoc or specification requirement')
    mode.add_argument('--collection', choices=COLLECTIONS, help='Look up one collection')
    mode.add_argument('--source', help='Look up a qualified by_source key, including collection and source group')
    args = parser.parse_args(argv)
    try:
        document = build(args.repo_root, check=args.check, preview=bool(args.target or args.collection or args.source))
        if args.target or args.collection or args.source:
            field = 'by_target' if args.target else 'by_collection' if args.collection else 'by_source'
            keys = document[field].get(args.target or args.collection or args.source, [])
            print(encoded({'status': document['status'], 'collections': document['collections'],
                           'records': [r for r in document['records'] if r['key'] in keys]}).decode(), end='')
        else:
            print(json.dumps({'status': document['status'], **document['counts']}))
        if document['status'] != 'current':
            parser.exit(1, 'Experts index is incomplete; inspect collection statuses.\n')
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, f'Experts traceability failed: {error}\n')


if __name__ == '__main__':
    main()
