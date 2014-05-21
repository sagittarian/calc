(function ($) {
    var $input = $('.calc-input'),
        $register = $('.calc-register'),
        $op = $('.calc-operator'),
        ops = {
            '*': function (one, two) {
                return one * two;
            }
        },
        performCalculationMock = function (op, operands) {
            // A mocked up version of the Calc.performCalculation
            // function, so that we don't depend on the server API
            // for testing the UI
            var opFunc = ops[op],
                result = opFunc.apply(null, operands);
            Calc.updateInput(result);
        };

        test("test number handler", function () {
            $('button:contains(7)').click();
            var $seven = $('button:contains("7")');
            $input.text('');
            Calc.handleNumber.call($seven);
            ok($input.text() === "7", "Number handler");
        });
        // etc with other buttons, to make sure the UI works

        test("test clear button handler", function () {
            Calc.handleClearButton();
            ok($input.text() === '' && $register.text() === '' &&
               $op.text() === '', 'Clear handler');
        });

        test('test enter handler', function () {
            var oldPerformCalc = Calc.performCalculation;
            Calc.performCalculation = performCalculationMock;
            $register.text('2');
            $op.text('*');
            $input.text('3');
            Calc.handleEnter();
            Calc.performCalculation = oldPerformCalc;
            ok($input.text() === '6', 'Enter handler');
       });
       // etc with other parts of the UI, would maybe mock up parts of
       // jQuery to test AJAX calls without relying on a server
}).call(this, jQuery);
