@echo off
REM Remotion Studio'yu baslatir (edit + canli onizleme).
REM Tarayicida http://localhost:3000 acilir; onizleme senin GPU'nu kullanir.
setlocal
cd /d "%~dp0\..\.."
call npm run dev
