@echo off
REM ============================================================
REM  IpazaryeriReel render - tum CPU cekirdeklerini kullanir
REM  Kullanim:
REM    render.cmd                -> IpazaryeriReel render eder
REM    render.cmd SkypeakReel-Light  -> baska kompozisyon
REM  Not: render hizi CPU cekirdegine baglidir (GPU degil).
REM       RAM yetmezse concurrency'i dusur (asagidaki sayiyi azalt).
REM ============================================================
setlocal
cd /d "%~dp0\..\.."

set "COMP=%~1"
if "%COMP%"=="" set "COMP=IpazaryeriReel"

REM Cikti dosya adi: kompozisyon adindan
set "OUT=out\%COMP%.mp4"

echo.
echo === Render: %COMP% ===
echo Cekirdek sayisi: %NUMBER_OF_PROCESSORS%  (concurrency)
echo Cikti: %OUT%
echo.

call npx remotion render %COMP% "%OUT%" --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=%NUMBER_OF_PROCESSORS%
if errorlevel 1 (
  echo [HATA] Render basarisiz.
  pause
  exit /b 1
)

echo.
echo === BITTI -> %OUT% ===
pause
