# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

from decimal import Decimal
import unittest

from finkore import FinKoreError, Money


class MoneyTests(unittest.TestCase):
    def test_portable_errors_carry_codes(self) -> None:
        with self.assertRaises(FinKoreError) as context:
            Money.from_portable({"amount": "1e3", "currency": "EUR"})
        self.assertEqual(context.exception.code, "FINKORE_MONEY_INVALID_AMOUNT")

    def test_adds_exact_decimal_values_without_mutation(self) -> None:
        left = Money.from_portable({"amount": "0.1", "currency": "EUR"})
        right = Money.from_portable({"amount": "0.2", "currency": "EUR"})
        self.assertEqual(left.add(right).to_portable(), {"amount": "0.3", "currency": "EUR"})
        self.assertEqual(left.to_portable(), {"amount": "0.1", "currency": "EUR"})
        self.assertEqual(right.to_portable(), {"amount": "0.2", "currency": "EUR"})

    def test_rejects_currency_mismatch(self) -> None:
        left = Money.from_portable({"amount": "10.00", "currency": "EUR"})
        right = Money.from_portable({"amount": "10.00", "currency": "USD"})
        with self.assertRaises(FinKoreError) as context:
            left.compare(right)
        self.assertEqual(context.exception.code, "FINKORE_MONEY_CURRENCY_MISMATCH")

    def test_rounds_negative_boundaries(self) -> None:
        value = Money.from_portable({"amount": "-1.231", "currency": "EUR"})
        self.assertEqual(value.round(2, "DOWN").to_portable(), {"amount": "-1.23", "currency": "EUR"})
        self.assertEqual(value.round(2, "FLOOR").to_portable(), {"amount": "-1.24", "currency": "EUR"})

    def test_allocates_declared_order_remainder(self) -> None:
        value = Money.from_portable({"amount": "10.00", "currency": "USD"})
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [3, 2, 1]}, 2)],
            [
                {"amount": "5.01", "currency": "USD"},
                {"amount": "3.33", "currency": "USD"},
                {"amount": "1.66", "currency": "USD"},
            ],
        )

    def test_allocation_integer_domain_is_portable(self) -> None:
        value = Money.from_portable({"amount": "10.00", "currency": "USD"})
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [1.0, 2.0]}, 2.0)],
            [
                {"amount": "3.34", "currency": "USD"},
                {"amount": "6.66", "currency": "USD"},
            ],
        )
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [Decimal("1.0"), Decimal("2.0")]}, Decimal("2.0"))],
            [
                {"amount": "3.34", "currency": "USD"},
                {"amount": "6.66", "currency": "USD"},
            ],
        )
        self.assertEqual(
            [part.to_portable() for part in value.allocate({"method": "RATIO", "ratios": [9007199254740991, 1]}, 2)],
            [
                {"amount": "10.00", "currency": "USD"},
                {"amount": "0.00", "currency": "USD"},
            ],
        )
        hundred = Money.from_portable({"amount": "1.00", "currency": "USD"}).allocate({"method": "EQUAL", "parts": 100}, 2)
        self.assertEqual(len(hundred), 100)
        self.assertTrue(all(part.to_portable() == {"amount": "0.01", "currency": "USD"} for part in hundred))
        self.assertEqual(
            [part.to_portable() for part in Money.from_portable({"amount": "1", "currency": "USD"}).allocate({"method": "EQUAL", "parts": 2}, 50)],
            [
                {"amount": "0.50000000000000000000000000000000000000000000000000", "currency": "USD"},
                {"amount": "0.50000000000000000000000000000000000000000000000000", "currency": "USD"},
            ],
        )

        invalid_requests = [
            ({"method": "RATIO", "ratios": [9007199254740992, 1]}, 2),
            ({"method": "EQUAL", "parts": 101}, 2),
            ({"method": "EQUAL", "parts": 2}, 51),
            ({"method": "RATIO", "ratios": ["2", 1]}, 2),
            ({"method": "RATIO", "ratios": [1.5, 1]}, 2),
            ("invalid", 2),
        ]
        for allocation, scale in invalid_requests:
            with self.subTest(allocation=allocation, scale=scale):
                with self.assertRaises(FinKoreError) as context:
                    value.allocate(allocation, scale)
                self.assertEqual(context.exception.code, "FINKORE_MONEY_INVALID_ALLOCATION")
                self.assertEqual(value.to_portable(), {"amount": "10.00", "currency": "USD"})

    def test_draft_06_large_decimal_operations_ignore_decimal_context_precision(self) -> None:
        left = Money.from_portable({"amount": "123456789012345678901234567890123456789012345678901234567890.12", "currency": "EUR"})
        right = Money.from_portable({"amount": "0.88", "currency": "EUR"})
        self.assertEqual(
            left.add(right).to_portable(),
            {"amount": "123456789012345678901234567890123456789012345678901234567891.00", "currency": "EUR"},
        )

        left = Money.from_portable({"amount": "-98765432109876543210987654321098765432109876543210.75", "currency": "USD"})
        right = Money.from_portable({"amount": "12345678901234567890.25", "currency": "USD"})
        self.assertEqual(
            left.subtract(right).to_portable(),
            {"amount": "-98765432109876543210987654321111111111011111111101.00", "currency": "USD"},
        )

        value = Money.from_portable({"amount": "123456789012345678901234567890.12", "currency": "JPY"})
        self.assertEqual(
            value.multiply("987654321098765432109876543210.98").to_portable(),
            {"amount": "121932631137021795226185032733862429504001414418287658588617.5176", "currency": "JPY"},
        )

    def test_draft_06_high_scale_rounding_and_rate_are_exact(self) -> None:
        value = Money.from_portable({"amount": "1.234567890123456789012345678901234567890123456789015", "currency": "EUR"})
        self.assertEqual(
            value.round(50, "HALF_EVEN").to_portable(),
            {"amount": "1.23456789012345678901234567890123456789012345678902", "currency": "EUR"},
        )

        value = Money.from_portable({"amount": "123456789012345678901234567890.12", "currency": "EUR"})
        self.assertEqual(
            value.apply_rate({"kind": "PERCENTAGE", "value": "1234567890.123456789"}).to_portable(),
            {"amount": "1524157875323883675034293577503386681.3431672002468", "currency": "EUR"},
        )


if __name__ == "__main__":
    unittest.main()
