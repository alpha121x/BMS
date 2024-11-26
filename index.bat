@echo off

REM Change to the Vite frontend directory
cd C:\Users\PMYLS\Desktop\BMS\

REM Run the Vite development server and redirect errors to a log file
npm run dev 2>error.log

REM Check if the last command (npm) was successful
IF %ERRORLEVEL% NEQ 0 (
    echo Error: The Vite development server encountered an error. See error.log for details.
    type error.log
    pause
) ELSE (
    echo The Vite development server ran successfully.
    del error.log 2>nul
)
