from __future__ import unicode_literals, division

import calc
import unittest
import json

class CalcTestCase(unittest.TestCase):

    def setUp(self):
        self.app = calc.app.test_client()

    def test_operators(self):
        pass
        #self.assertEqual(calc.Operator.get('+')(2, 3), 5)
        # further tests of operators here

    def test_add(self):
        self.assertEqual(calc.add(1, 1), 2)
        # further tests of add, etc.

    # further operator function tests here

    def test_get_operators(self):
        rv = self.app.get('/api/operators')
        data = json.loads(rv.data)
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(sorted(data['result'].keys()), ['1', '2'])
        # and further tests that the operators being tests are correct

    def test_calc(self):
        rv = self.app.get('/api/calc?operator=/&operands=2,3')
        data = json.loads(rv.data)
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['result'], 2/3)
        # etc, testing further calculations

    def test_div_by_zero(self):
        rv = self.app.get('/api/calc?operator=/&operands=1,0')
        data = json.loads(rv.data)
        self.assertEqual(data['status'], 'error')
        # etc for other error cases

if __name__ == '__main__':
    unittest.main()
