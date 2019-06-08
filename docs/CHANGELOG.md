# homebridge-macosx-info Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## v1.0.1 2019-06-07
- Add check_osx_smc binary in git package
- Add relative path for cal check_osx_smc 

## v1.0.0 2019-05-31 
- First released
- This update includes a number of bug fixes and stability improvements

## v0.3.1 2019-05-25 
- Performance : Optimize `homebridge-macosx-info.sh` script
- Now, CPU Power consumption and Users are optional. The confuguration is in `config.json` homebridge file

## v0.3.0 2019-05-18 
- Add CPU Power consumption
- Add units constant in index.js
- Add Prerequisites in README.md

## v0.2.11 2019-05-16 
- Added nunber of Users connected in the host
- fix bug in uptime return 
  
## v0.2.10 2019-05-10 
- Deleted `serial` entry in `config.json`
- Minor change in `README.md` to specify installation steps
  
## v0.2.9 2019-05-09 
- Minor change in `README.md` to specify installation steps
- Add constants `JSON_DATA_FILE` & `CHECK_OSX_SMC` in the shell script

## v0.2.8 2019-05-08
- Minor change in `index.js` to call `homebridge-macosx-info.sh`
- Minor change in `.json` respons file
- Performance
  - Now no `sed` & `awk` in shell script
- Added the compatibility list of Apple mac hardware (with check_osx_smc)
- Added CHANGELOG.md file
- Complete the README.md file
- Opitimized screenshots

## v0.2.6 2019-05-05
 - Firt version in github public repository 

