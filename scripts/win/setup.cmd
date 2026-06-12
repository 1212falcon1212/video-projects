@echo off
REM ============================================================
REM  idepo-reels - Windows kurulum
REM  Cift tikla calistir. Node 22 LTS + Git kurulu olmali.
REM ============================================================
setlocal
cd /d "%~dp0\..\.."

echo.
echo === Node surumu ===
where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node bulunamadi. https://nodejs.org adresinden Node 22 LTS kur.
  pause
  exit /b 1
)
node -v

echo.
echo === Bagimliliklar yukleniyor (npm install) ===
echo Remotion ilk calismada kendi Chromium + FFmpeg'ini indirir, biraz surebilir.
call npm install
if errorlevel 1 (
  echo [HATA] npm install basarisiz.
  pause
  exit /b 1
)

echo.
echo === Tip kontrolu ===
call npx tsc --noEmit
if errorlevel 1 (
  echo [UYARI] tsc hata verdi - yine de devam edebilirsin.
)

echo.
echo === HAZIR ===
echo   Edit icin   : scripts\win\studio.cmd  (veya npm run dev)
echo   Render icin : scripts\win\render.cmd
echo.
pause
