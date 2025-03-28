rem build backend
cd backend
set GOOS=linux
set GOARCH=arm64
go build .

rem clear and remake artifact directory
cd ..
mkdir artifact

rem construct folderchat

cd artifact
mkdir backend
mkdir frontend\dist

copy ..\backend\backend backend
copy ..\backend\credentials backend
copy ..\backend\jwt_secret backend
xcopy ..\frontend\dist\* frontend\dist\ /e /i /h

echo build process complete