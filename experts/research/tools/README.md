# Ferramentas de pesquisa

As ferramentas Python desta pasta organizam a memória cumulativa das pesquisas
(`consolidate_research.py`) e sua rastreabilidade (`build_traceability.py`),
sem chamadas de rede ou download de PDFs.
Requer Python 3.10+ em Linux/macOS, somente com a biblioteca padrão.

Execute na raiz do repositório:

```bash
python3 experts/research/tools/consolidate_research.py
```

Após a importação, as sessões funcionam a partir dos snapshots; as pastas originais
não são exigidas. Depois de atualizar `allFindings.md`, unifique também seus links:

```bash
python3 experts/research/tools/consolidate_research.py --unify-links
```

Essa opção preserva o relatório anterior e ajusta os links de sessão para snapshots,
sem alterar citações ou conclusões.

O comando atualiza `allSeen.json`, `allPublications.json`, `allSessions.json` e
`allFindings.json`, preservando as versões importadas. Para consultar um trabalho
ou verificar a atualidade dos índices sem escrever arquivos:

```bash
python3 experts/research/tools/consolidate_research.py --lookup 'transaction consistency'
python3 experts/research/tools/consolidate_research.py --check
```

Consulte [experts/research/README.md](../README.md) para formatos, histórico, snapshots,
identificadores e critérios para reutilizar uma análise anterior.

## Research-to-contract traceability

`build_traceability.py` maintains the non-normative comparison layer, using the
current unified catalog and read-only FinKore artifacts:

```bash
python3 experts/research/tools/build_traceability.py
python3 experts/research/tools/build_traceability.py --check
python3 experts/research/tools/build_traceability.py --target MONEY-ROUNDING-001
python3 experts/research/tools/build_traceability.py --finding REV-0001
```

It preserves the curated section of `experts/research/traceability.json`, generates its
resolved indexes and `experts/research/traceability.md`, and flags changed comparisons
for recheck. It does not edit the financial contract, publish Learn pages, or
approve findings. See [experts/research/README.md](../README.md#research-to-contract-traceability)
for curation, source scope, and maintenance guidance.

## Análise das fontes na web

O agente `research-analyst` parte dos manifestos produzidos pelo `research-scout`,
consulta publicações na web e mantém `findings.md` na pasta da sessão. Registra
regras candidatas, discussões, riscos, condições, evidências e relações com o
contrato atual do FinKore. Os achados permanecem pendentes de validação.

A definição versionada está em
[SKILL.md](../../../.agents/skills/research-analyst/SKILL.md). Exemplo de invocação:

```text
$research-analyst Analise o manifesto em /caminho/absoluto/da/sessao.
```

Por padrão, cada execução investiga cinco publicações ainda não examinadas.
É possível pedir outra quantidade ou toda a sessão. Consulte a memória cumulativa
antes de selecionar o lote e preserve as diferenças entre leitura completa,
parcial, resumo, metadados e acesso malsucedido.

O `research-reviewer` revisa os achados e mantém `experts/research/allFindings.md`.
O consolidador indexa esse relatório sem alterar suas conclusões.

O download local e o minerador Python/Qwen foram descartados. O catálogo mantém
compatibilidade de leitura com registros históricos `downloads.json` já importados;
esses registros não comprovam leitura e não iniciam novos downloads.

## Testes locais

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s experts/research/tools/tests -v
```

Os testes usam dados sintéticos e diretórios temporários, sem chamadas de rede
ou execução de comportamento financeiro.
