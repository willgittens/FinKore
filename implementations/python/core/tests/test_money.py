# SPDX-License-Identifier: MPL-2.0
from __future__ import annotations

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


if __name__ == "__main__":
    unittest.main()
