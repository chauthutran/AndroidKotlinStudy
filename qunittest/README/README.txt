
============= Install QUnit ============

    > npm install --save-dev qunit --> for developing
    > npm install -g qunit --> For global

============= Automating the Test Run ============
URL Ref : https://mattsnider.com/karma-test-runner-with-qunit-in-10-minutes/


INSTALL
    Install Karma[1], plugins, and Qunit[2]. Please use QUnit v1.12, otherwise, the unit tests may not work properly.


    # Install Karma
        npm install karma --save-dev
    # Install plugins
        npm install karma-qunit karma-phantomjs-launcher --save-dev
    # Add global CLI
        npm install -g karma-cli
    # Add Require.js plugin if any
        npm i karma-requirejs
    # Install QUnit
        npm install --save-dev qunitjs
    # Install karma-coverage
        npm i karma-coverage -D
        npm install karma karma-qunit karma-coverage



COPY the JS Files in folder "libs" to nodes_modules/qunit/qunit



HOW TO MAKE confiiguration file ( It is already here, just note here in case you like to make another one for testing )
    In your project directory, run the Karma initialization script:
        > karma init karma.conf.js

    ------ Answer the following questions[3]: -----------------------------------------

    Which testing framework do you want to use ?
    Press tab to list possible options. Enter to move to the next question.
    > qunit

    Do you want to use Require.js ?
    This will add Require.js plugin.
    Press tab to list possible options. Enter to move to the next question.
    > yes or no

    Do you want to capture any browsers automatically ?
    Press tab to list possible options. Enter empty string to move to the next question.
    > PhantomJS
    >

    What is the location of your source and test files ?
    You can use glob patterns, eg. "js/*.js" or "test/**/*Spec.js".
    Enter empty string to move to the next question.
    > src/js/**/*.js ( if any )
    > test/*.js
    >

    Should any of the files included by the previous patterns be excluded ?
    You can use glob patterns, eg. "**/*.swp".
    Enter empty string to move to the next question.
    >

    Do you want Karma to watch all the files and run the tests on change ?
    Press tab to list possible options.
    > no

    ----------------------------------------------------------------------------------

    This will create the karma.conf.js configuration file for your project. To run your tests:
        > karma start

    Put your code under the ./src/... directory:
    Put your test code under ./test/... directory (I mirror the src directory):

    
    ----------------------------------------------------------------------------------
    Your QUnit tests should looks something like[4]:

    QUnit.test('Name of Test', function(assert) {
        // Setup the various states of the code you want to test and assert conditions.
        assert.equal(1, 1, '1 === 1');
    });




============= RUN ============
Open command promt : 
    cws-dev/qunit> karma start