@echo off

REM start
echo Starting the server...
node ./server/g4f.js
if %errorlevel% neq 0 (
  echo Error starting the server.
  goto :error
)

REM dev
echo Starting the server in development mode with PM2...
pm2 start ecosystem.config.cjs
if %errorlevel% neq 0 (
  echo Error starting PM2 in development mode.
  goto :error
)

REM prod
echo Starting the server in production mode with PM2...
pm2 start ecosystem.config.cjs --env production
if %errorlevel% neq 0 (
  echo Error starting PM2 in production mode.
  goto :error
)

REM stop
echo Stopping the API server with PM2...
pm2 stop api-server
if %errorlevel% neq 0 (
  echo Error stopping the API server.
  goto :error
)

echo All scripts executed successfully!
goto :end

:error
echo An error occurred during script execution.

:end
pause