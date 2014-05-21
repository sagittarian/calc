from __future__ import division

from collections import defaultdict
from functools import wraps
from time import sleep

from flask import Flask, jsonify, request

app = Flask(__name__)
app.debug = True # XXX debug mode

def random_wait():
    '''Simulate a long server operation by simply sleeping for a few
    seconds'''
    sleep(10)

class Operator(object):

    # a dict mapping number of arguments to operators to the functions
    # that define them
    operators = defaultdict(dict)

    # a dict mapping number of arguments to operators to instances of
    # the Operator class, so that we don't have to keep creating new
    # instances for the same operators
    instances = defaultdict(dict)

    @classmethod
    def define(cls, operator, num_args=2):
        '''Decorator for defining new operators.  num_args is the number of
        arguments the operator handles, default 2.'''
        def dec(func):
            cls.operators[num_args][operator] = func
            return func
        return dec

    @classmethod
    def get(cls, operator, num_args=2):
        '''Cache the operator instance when we need it, so that we don't have
        to proliferate functionally identical operator instances all
        the time.  Operator instances have no state, so there's no
        reason not to cache them.

        We could implement this caching behavior with normal object
        instatiation, but let's keep it simple for now.

        '''
        instance_dict = cls.instances[num_args]
        if operator not in instance_dict:
            instance_dict[operator] = cls(operator, num_args)
        return instance_dict[operator]

    @classmethod
    def get_operators(cls):
        '''Return a dictionary mapping number of arguments to a list of
        operands that are defined for that number of arguments'''
        return {key: cls.operators[key].keys() for key in cls.operators}

    def __init__(self, func, num_args=2):
        if not callable(func):
            func = self.operators[num_args][func]
            # XXX nonexistent key, though the route functions will
            # handle this without raising an exception
        self.func = func
        self.num_args = num_args

    def __call__(self, *args):
        '''Apply this operator to the arguments'''
        # XXX mismatch on number of arguments, won't happen in general
        # though because we ask for an Operator which will accept the
        # correct number of arguments
        random_wait()
        return self.func(*args)

######################## operator definitions ##########################

@Operator.define('+')
def add(one, two):
    return one + two

@Operator.define('-')
def sub(one, two):
    return one - two

@Operator.define('*')
def mul(one, two):
    return one * two

@Operator.define('/')
def div(one, two):
    return one / two

@Operator.define('-', num_args=1)  # unary minus
def minus(n):
    return -n

@Operator.define('1/x', num_args=1)
def reciprocal(n):
    return 1 / n

############################ routes ####################################

def safe_route(routefunc):
    '''Wrap a route function in a try-except block to ensure that
    unexpected exceptions don't get returned to the user.  Return a
    JSON response.

    '''
    @wraps(routefunc)
    def newfunc(*args, **kw):
        try:
            result = routefunc(*args, **kw)
        except Exception as e:
            return jsonify(status='error', message=e.message)
        else:
            return jsonify(status='ok', result=result)
    return newfunc

def parse_operands(string):
    '''Parse a comma-separated list of into a list'''
    return [float(s) for s in string.split(',')]


@app.route('/api/operators')
@safe_route
def get_operators():
    '''Return an object that specifies valid operators that the calculator
    server can handle'''
    return Operator.get_operators()


@app.route('/api/calc')
@safe_route
def calculate():
    '''The calc api endpoint takes two query parameters, operator and
    operands.  The operator is the string representing the operator
    (as defined with the @Operator.define decorator), and the operands
    is a comma-separated list of numbers to be applied to the
    operator.  The result is a JSON object with the key status, which
    will be 'ok' if everything is fine, and result, which is the
    result of the operation.  If an error occured then status will be
    'error', and there will be a message key with a brief description
    of the error.

    '''
    operands = parse_operands(request.args.get('operands'))
    op = Operator.get(request.args.get('operator'), num_args=len(operands))
    random_wait()  # simulate a long operation
    return op(*operands)


if __name__ == '__main__':
    app.run()
