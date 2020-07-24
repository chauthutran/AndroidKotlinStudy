
INSTALL
      >cd connectPWA
    
    # Install Karma
        > npm install --save-dev karma
    # Install plugins
        > npm install --save-dev karma-chrome-launcher
        > npm install --save-dev karma-qunit
    # Add global CLI
        > npm install --g karma-cli
    # Add Require.js plugin if we use any @require in test files
        > npm i karma-requirejs
    # Install QUnit
        > npm install --save-dev qunitjs
    # Install karma-coverage
        > npm install --save-dev karma-coverage



    # COPY the JS Files in folder "libs" to nodes_modules/qunit/qunit



============= RUN ============
Open command promt : 
    pwa-dev/qunit> karma start


===============================================================================================

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

    


===============================================================================================
WHAT ARE THE CONCEPS IN COVERAGE ?
- A branch is where the runtime can choose whether it can take one path or another. 
Branch coverage tracks which of those branches have been executed so you can ensure all routes are tested properly
