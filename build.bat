@echo off
setlocal enabledelayedexpansion

if %errorlevel% neq 0 exit /b %errorlevel%

cls
cd /d %~dp0

where npm
if %errorlevel% neq 0 (
	echo Please Install node.js in your machine!
	exit 1
)

"nuget\NuGet.exe" "Install" "FAKE" "-OutputDirectory" "packages" "-Version" "3.26.7" "-ExcludeVersion"

"nuget\NuGet.exe" "Install" "OctopusTools" "-OutputDirectory" "packages" "-Version" "2.6.1.52"

IF NOT [%1]==[] (
	SET TARGET="%1"
	ECHO Running target !TARGET!
	"packages\FAKE\tools\Fake.exe" "build.fsx" "target=!TARGET!"
) ELSE (
	ECHO Running default target
	"packages\FAKE\tools\Fake.exe" "build.fsx" "target="
)

pause