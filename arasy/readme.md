#About arasy

Arasy is just another javascript parser writen in javascript.

It produces a token stream and an syntax tree compatible with Mozilla Parser AST (like esprima).

#API

        usage:
        Arasy.parse( input, options );

        result:
        {
            tokens: []
            ast: {}
        }
