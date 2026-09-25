# SPDX-License-Identifier: MPL-2.0
# Runs selected existing unittest cases and emits classified results. Reads test
# inputs only, changes no repository source, and defines no financial behavior.
import json
import sys
import unittest
from finkore import FinKoreError


class Result(unittest.TestResult):
    def __init__(self):
        super().__init__()
        self.rows = []

    def startTest(self, test):
        super().startTest(test)
        self.row = {"caseId": test.id(), "status": "PASS"}

    def failure(self, error):
        kind = ("ASSERTION" if issubclass(error[0], AssertionError) else
                "PORTABLE_ERROR_MISMATCH" if issubclass(error[0], FinKoreError) else
                "UNEXPECTED_EXCEPTION")
        if self.row["status"] != "INFRASTRUCTURE_ERROR":
            self.row.update(status="INFRASTRUCTURE_ERROR" if kind == "UNEXPECTED_EXCEPTION" else "FAIL", failureKind=kind)

    def addFailure(self, test, err):
        self.failure(err)

    def addError(self, test, err):
        self.failure(err)

    def addSubTest(self, test, subtest, err):
        if err is not None:
            self.failure(err)

    def addSkip(self, test, reason):
        self.row.update(status="INFRASTRUCTURE_ERROR", failureKind="SKIPPED")

    def addExpectedFailure(self, test, err):
        self.row.update(status="INFRASTRUCTURE_ERROR", failureKind="EXPECTED_FAILURE")

    def addUnexpectedSuccess(self, test):
        self.row.update(status="INFRASTRUCTURE_ERROR", failureKind="UNEXPECTED_SUCCESS")

    def stopTest(self, test):
        self.rows.append(self.row)
        super().stopTest(test)


result = Result()
unittest.defaultTestLoader.loadTestsFromNames(sys.argv[1:]).run(result)
rows = result.rows
summary = {"total": len(rows), "passed": sum(r["status"] == "PASS" for r in rows),
           "failed": sum(r["status"] == "FAIL" for r in rows), "unsupported": 0,
           "infrastructureErrors": sum(r["status"] == "INFRASTRUCTURE_ERROR" for r in rows)}
print(json.dumps({"summary": summary, "results": rows}))
sys.exit(2 if summary["infrastructureErrors"] else 1 if summary["failed"] else 0)
