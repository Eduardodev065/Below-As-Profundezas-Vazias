@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul || (echo Node.js 20 ou superior nao encontrado.& exit /b 1)
where javac >nul 2>nul || (echo JDK 17 ou superior com javac/jlink nao encontrado.& exit /b 1)
where jlink >nul 2>nul || (echo jlink nao encontrado. Instale um JDK completo.& exit /b 1)

if not exist runtime\python\python.exe (
  if not exist runtime\python mkdir runtime\python
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest 'https://www.python.org/ftp/python/3.12.10/python-3.12.10-embed-amd64.zip' -OutFile '%TEMP%\below-python.zip'; Expand-Archive '%TEMP%\below-python.zip' 'runtime\python' -Force; $p=Get-ChildItem runtime\python\*._pth | Select-Object -First 1; $content=(Get-Content $p.FullName -Raw) -replace '^#import site','import site'; [IO.File]::WriteAllText($p.FullName,$content,[Text.Encoding]::ASCII)"
  if errorlevel 1 exit /b 1
)

if not exist runtime\java\bin\java.exe (
  if exist runtime\java rmdir /s /q runtime\java
  jlink --add-modules java.base --strip-debug --no-header-files --no-man-pages --output runtime\java
  if errorlevel 1 exit /b 1
)

if exist runtime\classes rmdir /s /q runtime\classes
mkdir runtime\classes
javac --release 17 -d runtime\classes game\java\BelowGameEngine.java
if errorlevel 1 exit /b 1
jar --create --file game-engine.jar --main-class BelowGameEngine -C runtime\classes .
if errorlevel 1 exit /b 1

call npm install
if errorlevel 1 exit /b 1
call npm run dist
if errorlevel 1 exit /b 1
echo.
echo Executavel independente criado em dist\Below.exe
echo Python e Java estao incluidos no pacote.
pause
