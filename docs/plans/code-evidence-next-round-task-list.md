# Code Evidence — próxima rodada

**Estado:** preparada; execução não iniciada. **Escopo:** 77 edições restantes.

Esta lista substitui as etapas de retenção extensiva após a adoção do formato compacto. As 38 edições da primeira rodada mantêm sua leitura histórica completa; isso não significa validação financeira, execução ou aprovação de especialistas. As observações já encontradas nas demais edições continuam em rules/.

## R2-M0 — Preparar o escopo

- [ ] Conferir as 77 identidades, edições e commits no catálogo compacto; preservar os IDs existentes.
- [ ] Definir lotes de bibliotecas e problemas financeiros; separar leitura parcial de nenhuma leitura.
- [ ] Recuperar apenas o material necessário do histórico ou do commit upstream em diretórios temporários.
- [ ] Declarar limites, dependências e possível ancestralidade compartilhada, sem exigir inventários permanentes.

## R2-M1 — Ler e extrair evidências úteis

- [ ] Inspecionar o escopo de código financeiro de cada biblioteca, suas dependências decisivas e testes pertinentes.
- [ ] Identificar funções que corroboram, contradizem ou sugerem uma regra; descartar do acervo permanente as funções sem contribuição financeira.
- [ ] Para cada achado, registrar ID, biblioteca/edição, caminho, função, linhas, commit e data real da coleta.
- [ ] Explicar como e por quê em no máximo três parágrafos, incluindo condições, contraexemplos e incertezas.
- [ ] Agrupar variantes nas famílias existentes ou criar família com novo ID sem aceitar uma regra normativa.
- [ ] Reconciliar o escopo efetivamente lido antes de promover reading_status a complete. Manter dados temporários de trabalho fora da coleção publicada.

## R2-M2 — Revisar e cruzar com FinKore

- [ ] Revisar cada afirmação contra a função no commit registrado; distinguir política alternativa, defeito suspeito e conflito.
- [ ] Consultar CoreDoc, spec, conformance e agentic na ordem canônica.
- [ ] Criar comparação atribuída com requisito real e binding CoreDoc quando justificável; caso contrário, motivo explícito sem ligação artificial.
- [ ] Preservar escopo indefinido, dependências, ausência de execução e validações pendentes.
- [ ] Registrar decisão e pergunta/responsável de triagem para cada adiamento; registrar os fingerprints somente com a revisão correspondente.

## R2-M3 — Validar e entregar

- [ ] Regerar a navegação e o índice global; validar schemas, referências, IDs e freshness.
- [ ] Rodar code-evidence:check/test, experts:check/test, learn:evidence:check, npm ci --no-audit e npm run verify.
- [ ] Confirmar preservação da seleção Learn; nenhuma nova publicação ou mudança normativa ocorre automaticamente.
- [ ] Conferir que só evidências financeiras úteis e sua rastreabilidade permanecem na coleção.
- [ ] Encerrar a lista no histórico Git ao concluir a rodada, mantendo orientações duradouras nos READMEs.

## Bibliotecas desta rodada

| Avaliada | Biblioteca / edição | Repositório fixado | Estado da leitura |
| --- | --- | --- | --- |
| [ ] | CE-REPO-0009 / CE-EDITION-0009 — Beancount | [beancount/beancount](https://github.com/beancount/beancount/tree/eeda2aa2a3204ffb980dab11220b2abde5e80b38) | partial |
| [ ] | CE-REPO-0010 / CE-EDITION-0010 — QuantLib | [lballabio/QuantLib](https://github.com/lballabio/QuantLib/tree/ab4cb476d35f7275834bc05b47d1324403d1823b) | partial |
| [ ] | CE-REPO-0011 / CE-EDITION-0011 — Moov ACH | [moov-io/ach](https://github.com/moov-io/ach/tree/314f990cf2809d6f9848d0b8df5767eb19b0cf17) | partial |
| [ ] | CE-REPO-0012 / CE-EDITION-0012 — Apache Fineract | [apache/fineract](https://github.com/apache/fineract/tree/c643dab306fe29798951591ce825fd5e5272923e) | partial |
| [ ] | CE-REPO-0013 / CE-EDITION-0013 — Formance Ledger | [formancehq/ledger](https://github.com/formancehq/ledger/tree/83cd8dc7a66ba02a0418a36ec45663b19e26dcb3) | partial |
| [ ] | CE-REPO-0014 / CE-EDITION-0014 — TigerBeetle | [tigerbeetle/tigerbeetle](https://github.com/tigerbeetle/tigerbeetle/tree/cc1c06a924e49b11089c521b2209d34c92caaf18) | partial |
| [ ] | CE-REPO-0015 / CE-EDITION-0015 — ERPNext | [frappe/erpnext](https://github.com/frappe/erpnext/tree/886ab6ae187244e7f1b852393384ab6019d56264) | partial |
| [ ] | CE-REPO-0016 / CE-EDITION-0016 — java-payment-core | [lmoraesdev/java-payment-core](https://github.com/lmoraesdev/java-payment-core/tree/6892c754006515a0900a22ba4b45ac9b1de194fe) | partial |
| [ ] | CE-REPO-0027 / CE-EDITION-0027 — ActuaryUtilities.jl | [JuliaActuary/ActuaryUtilities.jl](https://github.com/JuliaActuary/ActuaryUtilities.jl/tree/046df0a5b25773830f19f791135cdae14f2a6986) | partial |
| [ ] | CE-REPO-0028 / CE-EDITION-0028 — LifeContingencies.jl | [JuliaActuary/LifeContingencies.jl](https://github.com/JuliaActuary/LifeContingencies.jl/tree/f59d609964a437d5e858fa0ed891b32e9271f00c) | partial |
| [ ] | CE-REPO-0030 / CE-EDITION-0030 — FinanceModels.jl | [JuliaActuary/FinanceModels.jl](https://github.com/JuliaActuary/FinanceModels.jl/tree/5ed979c305c525644ab43bb16f6661c770f5eaed) | not_started |
| [ ] | CE-REPO-0035 / CE-EDITION-0035 — spree | [spree/spree](https://github.com/spree/spree/tree/6f7cf3571ca571cd2896580698794065ddd8c723) | not_started |
| [ ] | CE-REPO-0036 / CE-EDITION-0036 — solidus | [solidusio/solidus](https://github.com/solidusio/solidus/tree/b1e19778b8db34a76f200e43c928b05f987dea92) | not_started |
| [ ] | CE-REPO-0037 / CE-EDITION-0037 — saleor | [saleor/saleor](https://github.com/saleor/saleor/tree/e1ccf4d580025b06c2ff01441a1e798dc4635f24) | not_started |
| [ ] | CE-REPO-0038 / CE-EDITION-0038 — prices | [mirumee/prices](https://github.com/mirumee/prices/tree/95fd44366d9ba1ab2684d8313542bae3be3922b9) | partial |
| [ ] | CE-REPO-0042 / CE-EDITION-0042 — pyxirr | [Anexen/pyxirr](https://github.com/Anexen/pyxirr/tree/5f31a85684051fb6badb542afba0ac1af5a68f9c) | not_started |
| [ ] | CE-REPO-0044 / CE-EDITION-0044 — lifelib | [lifelib-dev/lifelib](https://github.com/lifelib-dev/lifelib/tree/d44068e2a7c6aecbc14688569b1108e7bfd6a123) | not_started |
| [ ] | CE-REPO-0045 / CE-EDITION-0045 — FinancePy | [FinancePy-Org/FinancePy](https://github.com/FinancePy-Org/FinancePy/tree/3e902104e122928ba3ca5e23fcccb20b22205aed) | not_started |
| [ ] | CE-REPO-0046 / CE-EDITION-0046 — Strata | [tradingtechnologies/Strata](https://github.com/tradingtechnologies/Strata/tree/171b1c3c9347e36534f014779064b1ff1bc19216) | not_started |
| [ ] | CE-REPO-0047 / CE-EDITION-0047 — finmath-lib | [finmath/finmath-lib](https://github.com/finmath/finmath-lib/tree/c09575a923809d90aed5a16a0e3477f62432eff3) | not_started |
| [ ] | CE-REPO-0049 / CE-EDITION-0049 — tax | [commerceguys/tax](https://github.com/commerceguys/tax/tree/8451e5a01b1e7ca2ce0c1b33a0e1a91a2b3c6eaf) | not_started |
| [ ] | CE-REPO-0050 / CE-EDITION-0050 — pricing | [commerceguys/pricing](https://github.com/commerceguys/pricing/tree/55269e9603d28cf1de644f49d7af7c1d36b5864d) | partial |
| [ ] | CE-REPO-0051 / CE-EDITION-0051 — Sylius | [Sylius/Sylius](https://github.com/Sylius/Sylius/tree/9a37349f664271b3b739f5e3742562417dfc8650) | not_started |
| [ ] | CE-REPO-0052 / CE-EDITION-0052 — Pricing | [Sylius/Pricing](https://github.com/Sylius/Pricing/tree/b50060c2b94bd9477b9c1c42bdee912ae3787e49) | partial |
| [ ] | CE-REPO-0053 / CE-EDITION-0053 — Taxation | [Sylius/Taxation](https://github.com/Sylius/Taxation/tree/6456d9d2bca3af73e2ce26a734c2cd555c22f5ac) | partial |
| [ ] | CE-REPO-0054 / CE-EDITION-0054 — Promotion | [Sylius/Promotion](https://github.com/Sylius/Promotion/tree/99fa93cab518f6b0627ea8b725d44a0104d1844a) | not_started |
| [ ] | CE-REPO-0055 / CE-EDITION-0055 — RefundPlugin | [Sylius/RefundPlugin](https://github.com/Sylius/RefundPlugin/tree/0ca6789ac408f43e05452ee8595c1fe219c3c3d2) | not_started |
| [ ] | CE-REPO-0056 / CE-EDITION-0056 — Payum | [Payum/Payum](https://github.com/Payum/Payum/tree/530f6f9456ece5c61a17b087e3eb3ba4a0845c73) | not_started |
| [ ] | CE-REPO-0057 / CE-EDITION-0057 — killbill | [killbill/killbill](https://github.com/killbill/killbill/tree/8881b6617a7ef2d0bd5e1dd354d37405eb1362d6) | not_started |
| [ ] | CE-REPO-0058 / CE-EDITION-0058 — lago | [getlago/lago](https://github.com/getlago/lago/tree/1a30b73b951cc14e329605b1329207ffbb93fc8c) | not_started |
| [ ] | CE-REPO-0059 / CE-EDITION-0059 — lago-api | [getlago/lago-api](https://github.com/getlago/lago-api/tree/89885040af362088d5daef922c7b930d690c21ad) | not_started |
| [ ] | CE-REPO-0060 / CE-EDITION-0060 — laravel-wallet | [bavix/laravel-wallet](https://github.com/bavix/laravel-wallet/tree/00637f47c487d95e3f0cb15502a951e3dc6446c0) | not_started |
| [ ] | CE-REPO-0061 / CE-EDITION-0061 — laravel-wallet-swap | [bavix/laravel-wallet-swap](https://github.com/bavix/laravel-wallet-swap/tree/c2b4d1fe29982407df1d6e7e3e01d8d2a641c447) | partial |
| [ ] | CE-REPO-0062 / CE-EDITION-0062 — akaunting | [akaunting/akaunting](https://github.com/akaunting/akaunting/tree/ff5a7c207d82db7e38f85ab88b3542053500daeb) | not_started |
| [ ] | CE-REPO-0063 / CE-EDITION-0063 — python-accounting | [ekmungai/python-accounting](https://github.com/ekmungai/python-accounting/tree/b77367ebd1c31b24cc11a597ed0aa361be23eb5e) | not_started |
| [ ] | CE-REPO-0064 / CE-EDITION-0064 — django-ledger | [arrobalytics/django-ledger](https://github.com/arrobalytics/django-ledger/tree/1a2f0048e2195df0bb2965a5059a087438d5aa07) | not_started |
| [ ] | CE-REPO-0065 / CE-EDITION-0065 — django-oscar | [django-oscar/django-oscar](https://github.com/django-oscar/django-oscar/tree/a5ed3c9c17d4cf6ee18aa9795b493172416ab68b) | not_started |
| [ ] | CE-REPO-0066 / CE-EDITION-0066 — ledger | [ledger/ledger](https://github.com/ledger/ledger/tree/fe58299d2e8c2c39c4f263f9eae6c667cdcc149f) | not_started |
| [ ] | CE-REPO-0067 / CE-EDITION-0067 — hledger | [hledgerorg/hledger](https://github.com/hledgerorg/hledger/tree/67893cc5a58cc119d58febc12e46f7ab3eb93f9d) | not_started |
| [ ] | CE-REPO-0068 / CE-EDITION-0068 — abacus-minimal | [epogrebnyak/abacus-minimal](https://github.com/epogrebnyak/abacus-minimal/tree/c4d4d2be5208c0bd85316c91788ef7d74b9f9487) | not_started |
| [ ] | CE-REPO-0069 / CE-EDITION-0069 — plutus | [mbulat/plutus](https://github.com/mbulat/plutus/tree/32cc7ae50d0ce529cfa50ddbaa2711c469a89ee1) | not_started |
| [ ] | CE-REPO-0070 / CE-EDITION-0070 — double_entry | [envato/double_entry](https://github.com/envato/double_entry/tree/f1474f0fe160edadd3b3264397b85d38d3a7751d) | not_started |
| [ ] | CE-REPO-0071 / CE-EDITION-0071 — dbl-entry | [danielgerlag/dbl-entry](https://github.com/danielgerlag/dbl-entry/tree/00bc47b1d1f3754730fcb18e456047bcccd80397) | not_started |
| [ ] | CE-REPO-0072 / CE-EDITION-0072 — finac | [alttch/finac](https://github.com/alttch/finac/tree/e76d2be4e626b819fe209b5461db390d49c33c09) | not_started |
| [ ] | CE-REPO-0073 / CE-EDITION-0073 — bigcapital | [bigcapitalhq/bigcapital](https://github.com/bigcapitalhq/bigcapital/tree/3dffac172b43dba576c326ef6e5319b1aa4d7ccd) | not_started |
| [ ] | CE-REPO-0074 / CE-EDITION-0074 — numscript | [formancehq/numscript](https://github.com/formancehq/numscript/tree/7593b4ff9fff4d78b11599237b895f20c43d2b83) | not_started |
| [ ] | CE-REPO-0075 / CE-EDITION-0075 — machine | [formancehq/machine](https://github.com/formancehq/machine/tree/bfb3b69566080eef71a4178ddebb22941aa1e55c) | not_started |
| [ ] | CE-REPO-0076 / CE-EDITION-0076 — wire | [moov-io/wire](https://github.com/moov-io/wire/tree/e35f00214a2713d7c7964da763136fa038aebc9b) | not_started |
| [ ] | CE-REPO-0077 / CE-EDITION-0077 — iso20022 | [moov-io/iso20022](https://github.com/moov-io/iso20022/tree/05aa282eb151466fd6b80c431e1cf9b2fada9cdd) | not_started |
| [ ] | CE-REPO-0078 / CE-EDITION-0078 — iso8583 | [moov-io/iso8583](https://github.com/moov-io/iso8583/tree/df3b9939839054706f7235d12cc904fbcbb0d174) | not_started |
| [ ] | CE-REPO-0079 / CE-EDITION-0079 — irs | [moov-io/irs](https://github.com/moov-io/irs/tree/981af0ae62d4b3aeb8d01d3609a4ac2964238089) | not_started |
| [ ] | CE-REPO-0080 / CE-EDITION-0080 — active_merchant | [activemerchant/active_merchant](https://github.com/activemerchant/active_merchant/tree/a0214be588f12b03ca2cf5b6cf989730f5baa227) | not_started |
| [ ] | CE-REPO-0081 / CE-EDITION-0081 — ibantools | [Simplify/ibantools](https://github.com/Simplify/ibantools/tree/d42c8af6f6dd8ee29033bc98cc41baf8323b0744) | not_started |
| [ ] | CE-REPO-0082 / CE-EDITION-0082 — php-iban | [globalcitizen/php-iban](https://github.com/globalcitizen/php-iban/tree/9dd1884d9b62235eceed0918e9538753ec5988cb) | not_started |
| [ ] | CE-REPO-0083 / CE-EDITION-0083 — iban-validation | [jschaedl/iban-validation](https://github.com/jschaedl/iban-validation/tree/af9987299645a8f85c703e36b6e7fed409a7fe84) | not_started |
| [ ] | CE-REPO-0084 / CE-EDITION-0084 — schwifty | [mdomke/schwifty](https://github.com/mdomke/schwifty/tree/53a4adf2c203df507502053816ee6c4325c1e685) | not_started |
| [ ] | CE-REPO-0085 / CE-EDITION-0085 — jPOS | [jpos/jPOS](https://github.com/jpos/jPOS/tree/71a6ccbd006432010e3c61ec8e1583c2c0eebca5) | not_started |
| [ ] | CE-REPO-0086 / CE-EDITION-0086 — php_qrcode_pix | [renatomb/php_qrcode_pix](https://github.com/renatomb/php_qrcode_pix/tree/27ae1e716b7d6d38907f83a7f1c27ff52c8490b0) | not_started |
| [ ] | CE-REPO-0087 / CE-EDITION-0087 — sped-nfe | [nfephp-org/sped-nfe](https://github.com/nfephp-org/sped-nfe/tree/4596b89e457d27ad2c114dda2b2ed04043f6327c) | not_started |
| [ ] | CE-REPO-0088 / CE-EDITION-0088 — sped-common | [nfephp-org/sped-common](https://github.com/nfephp-org/sped-common/tree/39ca47cce3b2b750e305cd84b7d98f3d670f6504) | not_started |
| [ ] | CE-REPO-0089 / CE-EDITION-0089 — nfe | [wmixvideo/nfe](https://github.com/wmixvideo/nfe/tree/9c785df1a6efa1889e446219d88f031e760bf60f) | not_started |
| [ ] | CE-REPO-0090 / CE-EDITION-0090 — caelum-stella | [caelum/caelum-stella](https://github.com/caelum/caelum-stella/tree/54ce3f900ef23395928a480b90c4857ca61eea48) | not_started |
| [ ] | CE-REPO-0091 / CE-EDITION-0091 — boletonet | [BoletoNet/boletonet](https://github.com/BoletoNet/boletonet/tree/4a316bc20a02df231bceec95fc7fbf5ac8c71953) | not_started |
| [ ] | CE-REPO-0092 / CE-EDITION-0092 — boleto2net | [BoletoNet/boleto2net](https://github.com/BoletoNet/boleto2net/tree/8813d0d002350e3fa08352728d6c44da80676277) | not_started |
| [ ] | CE-REPO-0093 / CE-EDITION-0093 — laravel-boleto | [eduardokum/laravel-boleto](https://github.com/eduardokum/laravel-boleto/tree/50024ae74f46794105589cf62bf5156784bc14d4) | not_started |
| [ ] | CE-REPO-0094 / CE-EDITION-0094 — python-bizdays | [wilsonfreitas/python-bizdays](https://github.com/wilsonfreitas/python-bizdays/tree/fd6e87d446341643eadfb0580f641d7688498b22) | not_started |
| [ ] | CE-REPO-0095 / CE-EDITION-0095 — businessdate | [sonntagsgesicht/businessdate](https://github.com/sonntagsgesicht/businessdate/tree/f7102a95c484aa30b8ac70bec00cd7e448ee2c5d) | not_started |
| [ ] | CE-REPO-0096 / CE-EDITION-0096 — rateslib | [attack68/rateslib](https://github.com/attack68/rateslib/tree/1c4e6f060e1b251f166221a03323336c295ba68a) | not_started |
| [ ] | CE-REPO-0100 / CE-EDITION-0100 — RQuantLib | [cran/RQuantLib](https://github.com/cran/RQuantLib/tree/0d915541fa76e076c09153cfdf5c460a03ad6958) | not_started |
| [ ] | CE-REPO-0101 / CE-EDITION-0101 — lifecontingencies | [cran/lifecontingencies](https://github.com/cran/lifecontingencies/tree/103e6851f253056bbbf9102c781eb195e6b12daf) | not_started |
| [ ] | CE-REPO-0105 / CE-EDITION-0105 — ExcelFinancialFunctions | [fsprojects/ExcelFinancialFunctions](https://github.com/fsprojects/ExcelFinancialFunctions/tree/97756a375769e45059c7d58fc51fc7e391bc4984) | not_started |
| [ ] | CE-REPO-0106 / CE-EDITION-0106 — phpSepaXml | [nemiah/phpSepaXml](https://github.com/nemiah/phpSepaXml/tree/fbb6403da804921e7001325c381783efb1a414e3) | partial |
| [ ] | CE-REPO-0107 / CE-EDITION-0107 — php-sepa-xml | [digitick/php-sepa-xml](https://github.com/digitick/php-sepa-xml/tree/70d1798c5175e2b46356af0c7fe688a731285160) | not_started |
| [ ] | CE-REPO-0108 / CE-EDITION-0108 — iban4j | [arturmkrtchyan/iban4j](https://github.com/arturmkrtchyan/iban4j/tree/b2f6be595cdd30cd722ef9d1706da0d100ba8eff) | not_started |
| [ ] | CE-REPO-0112 / CE-EDITION-0112 — go-finance | [pieterclaerhout/go-finance](https://github.com/pieterclaerhout/go-finance/tree/dbfb00702cb5a9387b701607c09f93ebe5bf222f) | partial |
| [ ] | CE-REPO-0114 / CE-EDITION-0114 — ibandit | [gocardless/ibandit](https://github.com/gocardless/ibandit/tree/5207a1cda2df8815c2c6b4f73cdac062724595cc) | not_started |
| [ ] | CE-REPO-0115 / CE-EDITION-0115 — paisa | [ananthakumaran/paisa](https://github.com/ananthakumaran/paisa/tree/c481872120ade8f123f74a501fd6a13842495c93) | not_started |
