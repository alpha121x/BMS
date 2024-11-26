@echo off

REM Run the Node.js script and redirect errors to a log file
node server.js 2>error.log

REM Check if the last command (node) was successful
IF %ERRORLEVEL% NEQ 0 (
    echo Error: The Node.js script encountered an error. See error.log for details.
    type error.log
    pause
) ELSE (
    echo The script ran successfully.
    del error.log 2>nul
)