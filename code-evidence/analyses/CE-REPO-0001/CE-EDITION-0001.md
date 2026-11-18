# Money PHP — Allocation rules

**Finding:** CE-FINDING-0001 — Allocation conserves the source total while
assigning residual units by fractional loss, with declared order breaking ties.

**Status:** Bounded source reading completed; interpretation and contract comparison
pending independent review and validation. No upstream code or tests executed.
This pilot stops after this repository and this allocation question.

## Reading context

| Field | Observation |
| --- | --- |
| Repository | `CE-REPO-0001`; `moneyphp/money`; Money PHP |
| Edition | `CE-EDITION-0001`; `v4.9.0` |
| Source commit | [d49ee625c6ba79b9d7a228ce153b02fc1032152b](https://github.com/moneyphp/money/tree/d49ee625c6ba79b9d7a228ce153b02fc1032152b) |
| Reading date and analyst | 18 November 2026; Codex |
| Question | How does allocation conserve indivisible monetary units, select remainder recipients and handle negative amounts? |
| Reused work | Initial metadata and README triage for `CE-REPO-0001` in the [discovery catalog](../../catalog.md); no prior implementation finding existed. All implementation/test reading below is new. |
| Attribution | GitHub owner `moneyphp`. The pinned [composer.json, lines 10–24](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/composer.json#L10-L24) declares Mathias Verraes, Márk Sági-Kazár and Frederik Bosch as authors; this is package attribution, not verified current maintainership. |
| Reading extent | Selected allocation paths and dependencies, selected test methods/providers and allocation documentation; not the entire repository or complete Money class. |
| Execution | Not performed. Neither `php` nor `composer` was available on the agent's PATH. No runtime, extension, package dependencies or upstream build scripts were installed or executed. |
| FinKore baseline | Core `2.0.4`, repository commit `ba16f0d726bdf46adac8b58a5641d9872f7fd8ef`; comparison limited to allocation semantics below. |

### Source scope

All repository source links below use the recorded Money PHP commit. Files were
read as text from GitHub's public raw endpoint; temporary local copies are not
required to read this record and are not added to FinKore.

| Source | Extent used for this analysis |
| --- | --- |
| [src/Money.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php) | Namespace/imports and representation/backend/constructor, lines 1–88; amount/currency getters, 181–197; allocation and equal-target delegation, 305–373; backend getter, 555–561. Other printed neighboring methods were not assessed. |
| [src/Calculator/BcMathCalculator.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php) | Class/scale and compare/add/subtract, 1–46; floor, 82–96; share, 210–214. Unrelated rounding and modulus paths are outside the finding. |
| [src/Calculator.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator.php#L15-L137) | Relevant comparison/arithmetic/share interface declarations and annotations, 15–137. |
| [src/Number.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Number.php) | Construction/parsing, 29–60 and 222–289; integer check, 89–92; string conversion, 129–136; sign, 141–144; integer part, 151–154. Other numerical operations not assessed. |
| [src/Currency.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Currency.php#L18-L52) | Currency holder/constructor/getter/equality context, 18–52. No complete currency-validity analysis. |
| [src/Exception/InvalidArgumentException.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Exception/InvalidArgumentException.php#L5-L14) | Namespace and inheritance, 5–14, to interpret the allocation guard tests. |
| [tests/MoneyTest.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php) | Namespace/imports/test currency, 1–31; allocation tests, 134–192; data providers, 484–529. |
| [tests/Calculator/CalculatorTestCase.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/Calculator/CalculatorTestCase.php) | Backend test abstraction, 5–29; share assertion, 169–181; share data, 433–446. |
| [tests/Calculator/BcMathCalculatorTest.php](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/Calculator/BcMathCalculatorTest.php#L14-L38) | BCMath extension requirement, inherited test class, selected backend and scale setup, 14–38. |
| [doc/features/allocation.rst](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/doc/features/allocation.rst#L1-L41) | Whole 41-line allocation page: rationale, ratio examples and equal-target example. |
| [composer.json](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/composer.json#L10-L43) and [phpunit.xml.dist](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/phpunit.xml.dist) | Author declarations, PHP/extension and PHPUnit constraints; test bootstrap. Build commands were read as data. |

The PHP manual's reference sections for [bcdiv](https://www.php.net/manual/en/function.bcdiv.php),
[bcadd](https://www.php.net/manual/en/function.bcadd.php),
[floor](https://www.php.net/manual/en/function.floor.php) and
[array_sum](https://www.php.net/manual/en/function.array-sum.php) were consulted on
the reading date. They clarify scale, return types and runtime error boundaries;
they are current documentation, not a recorded PHP build or extension execution.
User-contributed manual notes were not used as evidence.

## Function inventory

Names and signatures below preserve the source spelling. Every row refers to PHP
code at this edition. `FN01`–`FN09` are local record anchors, not upstream names or
FinKore operation identifiers.

| Exact name | Qualified symbol / signature | Module or type | Pinned source | Financial role | Technical record |
| --- | --- | --- | --- | --- | --- |
| `allocate` | `Money\Money::allocate(array $ratios): array` | `Money\Money` | [Money.php:319–358](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L319-L358) | Validate weights, compute shares, conserve total and assign remainder | [FN01](#fn01) |
| Unnamed closure | `static function (float\|int $ratio) use ($total, $amount)`; no declared return type | Closure inside `Money\Money::allocate` | [Money.php:344–348](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L344-L348) | Rank residual allocation by fractional loss | [FN02](#fn02) |
| `allocateTo` | `Money\Money::allocateTo(int $n): array` | `Money\Money` | [Money.php:370–373](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L370-L373) | Reuse ratio allocation for equal targets | [FN03](#fn03) |
| `share` | `Money\Calculator\BcMathCalculator::share(string $amount, string $ratio, string $total): string` | `Money\Calculator\BcMathCalculator` | [BcMathCalculator.php:211–214](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L211-L214) | Compute a base share before redistributing units | [FN04](#fn04) |
| `floor` | `Money\Calculator\BcMathCalculator::floor(string $number): string` | `Money\Calculator\BcMathCalculator` | [BcMathCalculator.php:83–96](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L83-L96) | Floor signed decimal shares to integer units | [FN05](#fn05) |
| `__construct` | `Money\Money::__construct(int\|string $amount, private readonly Currency $currency)` | `Money\Money`; constructor has no declared return type | [Money.php:74–88](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L74-L88) | Construct each result with integer amount and original currency | [FN06](#fn06) |
| `subtract` | `Money\Calculator\BcMathCalculator::subtract(string $amount, string $subtrahend): string` | `Money\Calculator\BcMathCalculator` | [BcMathCalculator.php:41–46](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L41-L46) | Track unassigned source units | [FN07](#fn07) |
| `add` | `Money\Calculator\BcMathCalculator::add(string $amount, string $addend): string` | `Money\Calculator\BcMathCalculator` | [BcMathCalculator.php:33–38](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L33-L38) | Add one residual unit to a selected result | [FN08](#fn08) |
| `compare` | `Money\Calculator\BcMathCalculator::compare(string $a, string $b): int` | `Money\Calculator\BcMathCalculator` | [BcMathCalculator.php:27–30](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L27-L30) | Detect zero remainder and control distribution loop | [FN09](#fn09) |

## Function technical records

<a id="fn01"></a>

### Money\Money::allocate

**Input and context.** An array of ratio entries; its annotation admits integer
and floating-point weights. Amount is an integer string in smallest currency
units, not a FinKore decimal amount. Currency comes from the source object. There
is no target-scale parameter. The default backend is BCMath, declared in
[Money.php:53–64](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L53-L64).

The inspected [method body](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L319-L358)
does the following:

1. Copy the source amount into a local remainder and sum ratios with PHP
   `array_sum`. Reject a non-positive sum with
   `Money\Exception\InvalidArgumentException` before creating shares.
2. Iterate in the supplied array order. Reject an individual negative ratio,
   but allow zero when the total is positive. Delegate each base amount to
   [share](#fn04), create a new Money with the source currency and original array
   key, then subtract that share from the local remainder.
3. Return immediately when the remainder is zero. Otherwise compute the
   [fraction scores](#fn02), separately from the BCMath base calculation.
4. While remainder is positive, select the first key with the greatest remaining
   fraction score. Add one integer unit to that result, subtract one from the
   remainder and remove its score. Exact ties in the computed scores therefore
   use the supplied array order. The source also contains a fallback to key `0`
   when all scores are exhausted; that fallback was not demonstrated in a test
   inspected here.
5. Return the result array without sorting its output keys. Selection of a
   remainder recipient can favor a later key even though output order is retained.

**Outputs, failures and effects.** Returns Money values; direct domain guards
raise the upstream exception above. PHP/BCMath may raise additional runtime errors
for unsupported inputs; this reading does not exhaust malformed-input behavior.
The method writes local results and remainder, never the source object's amount
or currency. A later validation failure can occur after local shares were created,
but those shares are not returned. This is bounded static evidence of operand
preservation, not a proof about arbitrary backends or external effects.

**Financial mechanism.** Each unit added to a recipient is matched by a unit
removed from the remainder. On successful completion with zero remainder and valid
backend arithmetic, the final amounts sum to the source. Recipient selection is a
separate policy from that conservation identity.

<a id="fn02"></a>

### Unnamed closure inside Money\Money::allocate

**Source and signature.** [Money.php:344–348](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L344-L348);
signature preserved in the inventory; the source declares no name or return type.

1. Capture the total weight and original amount by value.
2. For each ratio, calculate its proportional share using PHP floating-point
   division and multiplication, including an explicit amount-to-float conversion.
3. Subtract PHP's `floor` of that share to obtain the fractional score. This is
   the score consumed by FN01's maximum selection; the closure itself only returns
   a value and has no explicit state changes or domain-error guard.

For negative shares, mathematical floor makes the fraction non-negative as well.
The score is the fraction of a signed quotient, not a ranking derived from exact
integer remainders. Large amounts, large weight totals and nearly equal fractions
need separate investigation: float conversion is visible, but no precision defect
was reproduced here. PHP's [floor reference](https://www.php.net/manual/en/function.floor.php)
confirms that this built-in consumes an integer/float and returns a float.

<a id="fn03"></a>

### Money\Money::allocateTo

**Source.** [Money.php:360–373](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L360-L373).
Accepts integer target count `n`, annotated as positive; constructs `n` weights of
one with `array_fill`, then returns FN01's result. Thus equal splitting shares the
same remainder policy rather than a second algorithm. It adds no explicit count
guard, scale parameter or state mutation. Zero count reaches FN01's non-positive
total guard; negative or excessive counts depend on PHP's array allocation behavior
and were not executed or fully assessed. No FinKore portable error is inferred.

<a id="fn04"></a>

### Money\Calculator\BcMathCalculator::share

**Source.** [BcMathCalculator.php:211–214](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L211-L214).
Accepts amount, ratio and total as numeric strings. Multiply amount by ratio using
BCMath, divide by total using BCMath, then pass the decimal string to FN05. Both
operations request the class's fixed intermediate scale of `14`; this is not a
caller-selected allocation scale. The output is an integer share string.

No explicit denominator validation or mutation occurs here. FN01 validates the
summed weights on its normal path, while direct invalid calls remain subject to
BCMath errors. The [bcdiv reference](https://www.php.net/manual/en/function.bcdiv.php)
documents numeric-string inputs, result scale and a zero-denominator runtime
exception. This implementation does not establish unrestricted exact rational
arithmetic: tiny fractions beyond its intermediate scale remain a follow-up limit.

<a id="fn05"></a>

### Money\Calculator\BcMathCalculator::floor

**Source.** [BcMathCalculator.php:83–96](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L83-L96).
Parse a numeric string with `Money\Number::fromString`. Return an already integral
number unchanged; otherwise, for a negative number add `-1` at BCMath output scale
zero, and for a non-negative number add zero at scale zero. This gives the lower
integer for the inspected small-number cases, including negative non-integers.
It returns a string and changes no Money operand. Parsing and extension failures
are dependency errors, not renamed FinKore errors.

The inspected `Number` helpers normalize trailing fractional zeros, test for an
empty fractional part and inspect the integer sign. Their supporting definitions
are in the source-scope table. In particular, this path uses signed floor before
remainder redistribution; it does not allocate absolute source units first.

<a id="fn06"></a>

### Money\Money::__construct

**Source.** [Money.php:74–88](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Money.php#L74-L88).
Accept an integer or string amount and a Currency object. If integer validation
succeeds, store the amount as a string. Otherwise parse the supplied string,
reject a non-integral result and store its integer part. The promoted currency
property is readonly. FN01 creates new objects through this constructor using the
source currency, including when replacing a residual-unit recipient.

Construction writes the new object's fields; it does not mutate the original
Money. The checked failure names include the library's InvalidArgumentException
for non-integral amounts and the parser's native InvalidArgumentException for
malformed numeric parts. Full constructor/currency conformance is outside this
allocation finding.

<a id="fn07"></a>

### Money\Calculator\BcMathCalculator::subtract

**Source.** [BcMathCalculator.php:41–46](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L41-L46).
Accept two numeric strings. Choose output scale `14` if either contains a decimal
point, otherwise zero; call `bcsub` and return its string result. On the inspected
allocation path the operands are integer-unit strings, so the zero-scale branch
tracks the exact integer remainder after shares and unit assignments. It has no
explicit guard or Money mutation; extension errors propagate.

<a id="fn08"></a>

### Money\Calculator\BcMathCalculator::add

**Source.** [BcMathCalculator.php:33–38](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L33-L38).
Choose scale with the same decimal-point test, call `bcadd` on the two numeric
strings and return the result. FN01 supplies the selected integer result and one
unit, so this operation credits that recipient by one unit at scale zero. It
mutates neither input and declares no separate domain guard; extension errors
propagate. The resulting string is passed to a new Money constructor.

<a id="fn09"></a>

### Money\Calculator\BcMathCalculator::compare

**Source.** [BcMathCalculator.php:27–30](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/src/Calculator/BcMathCalculator.php#L27-L30).
Compare numeric strings through `bccomp` at class scale `14` and return its integer
comparison result. FN01 uses zero equality to return early and a positive result
to keep distributing remainder. Integer-unit remainders have no fractional part
to lose at that comparison scale. No explicit mutation or domain-error guard is
present. This is the observed default-backend path; GMP and custom backends were
not reviewed.

<a id="ce-finding-0001"></a>

## CE-FINDING-0001 — Conservation and remainder policy are separate obligations

**Observed financial rule.** In the inspected allocation path, base shares retain
the source currency and a tracked remainder is redistributed in whole source
units. The recipient with the greatest computed fractional loss is selected
first; supplied order breaks equal-score ties. This is an explicit allocation
policy, not permission to discard or create a monetary residual. The implementation
and [upstream allocation explanation](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/doc/features/allocation.rst#L7-L29)
support this reading.

**Implementing functions.** [FN01](#fn01) coordinates the rule; [FN04](#fn04) and
[FN05](#fn05) produce base shares; [FN02](#fn02) ranks recipients;
[FN07](#fn07), [FN08](#fn08) and [FN09](#fn09) track/distribute remaining units;
[FN06](#fn06) preserves currency through new results; [FN03](#fn03) exposes equal
allocation through the same path. Their decisive source branches are pinned in
the inventory and detailed records.

### Concrete cases and comparison

Values below are integer allocation units. To compare with FinKore, translate one
source unit to one declared FinKore allocation unit, such as a cent at scale `2`.
This explicit comparison assumption does not supply the missing scale input to
Money PHP or claim that it implements the portable FinKore operation.

| Source units / ordered ratios | Money PHP expected result in inspected test data | FinKore result under explicit scale | Observation |
| --- | --- | --- | --- |
| `100 / [1, 1, 1]` | `[34, 33, 33]` | `[34, 33, 33]` | Equal-score tie illustrates shared declared-order outcome. |
| `101 / [3, 7]` | `[30, 71]` | `[31, 70]` | Larger fraction wins upstream; earliest position receives the unit in Core. |
| `-5 / [7, 3]` | `[-3, -2]` | `[-4, -1]` | Upstream floors signed shares, then adds a positive residual unit; Core distributes magnitude before restoring sign. |
| `5 / [0, 3, 7]` | `[0, 2, 3]` | `FINKORE_MONEY_INVALID_ALLOCATION` | A zero ratio is supported upstream when total weight is positive; Core requires each ratio to be positive. |
| `1 / [0.33, 0.66]` | `[0, 1]` | `FINKORE_MONEY_INVALID_ALLOCATION` | Upstream accepts fractional weights in its examples; Core ratio inputs are positive integers. |

The upstream column is transcribed from
[MoneyTest::allocationExamples, lines 494–508](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L494-L508),
not observed execution. The Core column is an analyst derivation from
[MONEY-ALLOCATION-004 and -008 through -011](../../../spec/money/allocation.md#requirements),
not a conformance run. Both successful positive alternatives in the second row
sum to `101`; conservation alone cannot select the recipient policy.

For the negative example, signed base shares are `[-4, -2]`, leaving remainder
`+1`; the equal fraction scores select the first recipient, producing `[-3, -2]`.
Core instead allocates absolute units `[3, 1]`, places the remaining unit in the
first position and restores the sign, producing `[-4, -1]`. This is a static
walkthrough consistent with the upstream test data, not a runtime trace.

### Relationship to the current contract

CoreDoc was consulted before the precise specification, then manifest-discovered
conformance artifacts and traceability, then Agentic metadata. Comparisons apply to
the recorded Core commit, not to later source editions.

| Current target | Proposed relationship and scope |
| --- | --- |
| [CORE-001.4](../../../docs/coreDoc/core-doc.md#core-0014-allocation-conserves-the-source-value) | Supporting implementation context for conserving source amount and currency; the remainder-placement interpretation differs. No universal correctness or independent proof is claimed. |
| [MONEY-ALLOCATION-007, -008 and -013](../../../spec/money/allocation.md#requirements) | Bounded source support for currency preservation, conservation on successful completion and unchanged source operands. The selected tests do not independently prove all three invariants. |
| [MONEY-ALLOCATION-009 through -011](../../../spec/money/allocation.md#requirements) | A concrete alternative policy: signed floor plus largest fractional loss differs from exact absolute-unit bases and earliest-position residual assignment. The positive and negative rows above demonstrate the distinction. |
| [MONEY-ALLOCATION-001, -002, -004 and -014](../../../spec/money/allocation.md#requirements) | API/input context differs: no explicit target scale, zero/fractional weights accepted upstream, and PHP-native weight summation. No conclusion about all portable integer boundaries is supported by this reading. |
| [MONEY-ERROR-008](../../../spec/money/errors.md#requirements) | Invalid-ratio guards provide comparison context only. Upstream exception classes are not portable FinKore error codes. |
| [finkore.money.allocate](../../../agentic/operations.md#finkoremoneyallocate) | The canonical operation requires explicit scale, bounded positive integer ratios, unchanged input and ordered residual placement; the upstream methods are not aliases or registrations for this operation. |

The [manifest](../../../conformance/manifest.json) discovers
[money/allocation.json](../../../conformance/money/allocation.json). Read cases
`money.allocate.ratio.remainder-positive-001`,
`money.allocate.equal.remainder-negative-001`,
`money.allocate.ratio.declared-order-001` and
`money.allocate.ratio.invalid-zero-ratio-001`, together with their
[traceability rows](../../../conformance/traceability.md). For example, the existing
declared-order case expects `10.00 USD`, ratios `[3, 2, 1]`, scale `2`, to produce
`[5.01, 3.33, 1.66] USD`; largest-fraction selection would favor the last position
for this small-number case. That last comparison is derived, not executed.

**Interpretation.** This is an intentional policy alternative documented by the
source, not an established upstream defect. Money PHP does not claim FinKore
conformance in the material inspected. Changing Core to adopt a different
recipient policy would alter observable behavior and must follow the
[compatibility policy](../../../spec/conventions.md#compatibility-policy).
No normative change or new error/operation is proposed as accepted work here.

### Limitations and open discussions

- The default BCMath path has fixed intermediate scale `14`, while recipient
  ranking uses floats and total weight uses PHP `array_sum`, which can return an
  integer or float. Arbitrary large-weight/precision equivalence has not been
  established. Do not label the entire algorithm exact because some arithmetic
  uses BCMath.
- A common allocation purpose does not make all allocation policies interchangeable.
  Which downstream fairness objective would justify a different rule is an open
  discussion, not a FinKore scope or behavior change.
- The selected tests show a zero source, zero-weight recipients, an individual
  negative-weight request, a zero total, fractional weights, equal-target splits
  and one negative source. They do not establish all malformed-input, overflow,
  count-boundary, dependency or failure-atomicity behavior.
- The negative-weight test uses `[-1]`; its total is already non-positive, so it
  reaches the earlier total guard. A mixed-weight case such as `[-1, 2]` would be
  needed to isolate the individual-negative-ratio guard. That case is an analyst
  follow-up suggestion, not a test read or run.
- The allocation assertion iterates the returned values and builds each expected
  Money with the returned currency. It does not explicitly assert cardinality,
  sum, original source currency or unchanged source amount. The source code
  supplies useful evidence for those properties, but these assertions alone
  should not be presented as independent invariant checks.
- No repository-wide review, GMP review, external extension verification,
  performance analysis, financial conformance execution or mutation run occurred.
  The README credits Fowler's Money pattern; independent corroboration from other
  repositories has not been investigated in this one-repository pilot.

## Test evidence

All entries below are **source assertions read; not executed**.

| Test symbol | Pinned source | Actual assertion/context | Finding/function connection and limits |
| --- | --- | --- | --- |
| `Tests\Money\MoneyTest::itAllocatesAmount` with `allocationExamples` | [Method:142–153](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L142-L153); [provider:491–512](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L491-L512) | Compares each returned result against the corresponding expected amount, using that result's currency. Includes the concrete table above, zero amount and keyed ratios. | CE-FINDING-0001; FN01–FN02 and backend/construction path. Invariant-assertion limitations are recorded above. |
| `Tests\Money\MoneyTest::it_throws_an_exception_when_allocation_ratio_is_negative` | [156–162](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L156-L162) | Expects native `InvalidArgumentException` ancestry for weights `[-1]`. | FN01 total guard; does not isolate the later individual-ratio guard or assert unchanged source. |
| `Tests\Money\MoneyTest::it_throws_an_exception_when_allocation_total_is_zero` | [165–171](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L165-L171) | Expects the exception ancestry for `[0, 0]`. | FN01 total guard. The inspected library exception extends native `InvalidArgumentException`. |
| `Tests\Money\MoneyTest::itAllocatesAmountToNTargets` with `allocationTargetExamples` | [181–192](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L181-L192); [521–529](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/MoneyTest.php#L521-L529) | Checks expected returned amounts for four positive equal-split examples. | FN03 delegates to FN01. No negative or invalid-count case appears in this selected provider. |
| `Tests\Money\Calculator\CalculatorTestCase::itSharesAValue` with `shareExamples` | [178–181](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/Calculator/CalculatorTestCase.php#L178-L181); [441–446](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/Calculator/CalculatorTestCase.php#L441-L446) | Asserts that sharing `10` by ratio `2` of total `4` equals string `5`. | FN04. The single inspected dataset is exactly divisible and does not independently test fractional or negative floor. |
| `Tests\Money\Calculator\BcMathCalculatorTest::getCalculator` | [14–29](https://github.com/moneyphp/money/blob/d49ee625c6ba79b9d7a228ce153b02fc1032152b/tests/Calculator/BcMathCalculatorTest.php#L14-L29) | Selects BCMath for inherited calculator tests and declares its extension requirement. | Establishes the selected test/backend connection; it is not an additional assertion or observed passing test. |

## Reading history and review

- **18 November 2026 — Codex:** Selected the first catalog repository with an
  allocation question. Read the pinned sources above and recorded one financial
  finding, nine technical function/closure records and a bounded Core comparison.
  The source/test reading is new; initial discovery metadata was reused explicitly.
- **Scope stop:** No other catalog repository was opened for implementation
  analysis in this pilot. The other fourteen repositories remain unanalysed.
- **Review state:** Source-based reasoning checked against the inspected code,
  selected assertions and current contract; independent technical/domain review
  remains pending. No maintainer acceptance, upstream execution result or Learn
  publication is implied.
- **Next evidence if this pilot is continued:** Review mixed-negative-weight and
  numeric-boundary tests, source/currency invariants and negative equal splitting;
  execute a bounded upstream test selection only in an appropriate PHP/BCMath
  environment. Preserve this edition and reading extent when extending the record.
- **18 November 2026 — subsequent catalog batch:** The one-repository stopping
  condition above records the original pilot. A later authorized batch completed
  bounded source readings for the other fourteen projects; see the current
  [analysis index](../../README.md#analysis-records). This does not extend the
  Money PHP source-reading extent or change its pending review/execution status.
