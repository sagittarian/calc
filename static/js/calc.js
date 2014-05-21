(function ($) {
	'use strict';
    var operatorUrl = '/api/operators',
        calcUrl = '/api/calc',
        $input = $('.calc-input'),
        $register = $('.calc-register'),
        $op = $('.calc-operator'),
        $ajaxWaitText = $('.ajax-wait-indicator .ajax-wait-text'),
        $ajaxCancel = $('.ajax-wait-indicator .ajax-cancel'),
        $error = $('.error'),
        xhr = null,  // keep track of the xhr object so we can abort
                     // it if we want to
	    appendToInput = true, // track whether hitting a number button
                              // will append that digit to the current
                              // number or replace the entire input
                              // number with a new one.

        Calc = this.Calc = {
	        /******************** UI functions ********************/
	        updateInput: function (newInput) {
		        $input.text(newInput);
	        },
	        disableUI: function () {
		        $('.calc button').attr('disabled', true);
		        $ajaxWaitText.text('Calculating, please wait...');
		        $ajaxCancel.show();
	        },
	        enableUI: function () {
		        $('.calc button').attr('disabled', false);
		        $ajaxWaitText.text('');
		        $ajaxCancel.hide();
	        },
	        performCalculation: function (op, operands) {
		        if (xhr) { return; } // we are already in the middle of a
		        // calculation, shouldn't happen
		        // under normal circumstances
		        var successHandler = function (response) {
			        appendToInput = false;
			        Calc.enableUI();
			        xhr = null;
			        if (response.status !== 'ok') {
				        $error.text(response.message);
				        return;
			        }
			        if (operands.length > 1) {
				        $op.text('');
				        $register.text('');
			        }
			        Calc.updateInput(response.result);
		        };
		        $error.text('');  // clear the error text
		        Calc.disableUI(); // disable the UI until the result is
		        // returned, since it can take a long time
		        xhr = $.getJSON(calcUrl, {
			        operator: op,
			        operands: operands.join(',')
		        }, successHandler);
	        },

	        /************************* event handlers *************************/
	        handleClearButton: function (event) {
		        $register.text('');
		        $op.text('');
		        $input.text('');
	        },
	        handleCancelAjax: function (event) {
		        if (!xhr) { return; }
		        xhr.abort();
		        xhr = null;
		        Calc.enableUI();
	        },
	        handleNumber: function (event) {
		        var btnStr = $(this).text(),
		            oldNum = $input.text();
		        if (btnStr === 'enter') {
			        Calc.handleEnter(event);
			        return;
		        }
		        if (btnStr === 'Clear') {
			        Calc.handleClearButton(event);
			        return;
		        }
		        if (btnStr === '.' && oldNum.indexOf('.') !== -1) {
			        return; // do nothing, only one period per number
		        }
		        if (appendToInput) {
			        $input.text(oldNum + btnStr);
		        } else {
			        $input.text(btnStr);
			        appendToInput = true;
		        }
	        },
	        handleUnary: function (event) {
		        var op = $(this).text(),
		            inputNum = $input.text();
		        Calc.performCalculation(op, [inputNum]);
	        },
	        handleBinary: function (event) {
		        var op = $(this).text(),
		            curNum = $input.text();
		        $register.text(curNum);
		        $op.text(op);
		        $input.text('');
	        },
	        handleEnter: function (event) {
		        var register = $register.text(),
		            input = $input.text(),
		            op = $op.text();
		        if (!register || !input || !op) {
			        return; // need all of these to do a binary calculation
		        }
		        Calc.performCalculation(op, [register, input]);
	        },

	        /************************* init functions *************************/
	        initNumbers: function () {
		        $('.calc-numbers button').click(Calc.handleNumber);
	        },
	        initOperators: function () {
		        $.getJSON(operatorUrl, function (response) {
			        if (response.status !== 'ok') {
				        $error.text(response.message);
				        return;
			        }
			        // we have unary and binary operators at the moment
			        var handleOpclass = function (obj, selector) {
				        var $el = $(selector);
				        $.each(obj, function (idx, val) {
					        var $btn = $(document.createElement('button')),
					            $div = $(document.createElement('div'));
					        $btn.text(val);
					        $btn.attr('type', 'button');
					        $div.append($btn);
					        $div.addClass('operator');
					        $el.append($div);
				        });
			        };
			        handleOpclass(response.result["1"], '.calc-unary');
			        handleOpclass(response.result["2"], '.calc-binary');

			        $('.calc-unary button').click(Calc.handleUnary);
			        $('.calc-binary button').click(Calc.handleBinary);
		        });
	        },
	        init: function () {
		        Calc.initOperators();
		        Calc.initNumbers();
		        $ajaxCancel.click(Calc.handleCancelAjax);
	        }
        };
	$(Calc.init);
}).call(this, jQuery);
