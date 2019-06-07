# homebridge-macosx-info
[![npm](https://img.shields.io/npm/dt/homebridge-macosx-info.svg)](https://www.npmjs.com/package/homebridge-macosx-info) 
[![npm](https://img.shields.io/npm/v/homebridge-macosx-info.svg)](https://www.npmjs.com/package/homebridge-macosx-info)
[![GitHub license](https://img.shields.io/github/license/ad5030/homebridge-macosx-info.svg)](https://github.com/ad5030/homebridge-macosx-info)
<!-- [![Donate](https://img.shields.io/badge/donate-paypal-yellowgreen.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=9MC83TRGACQPJ&source=url) -->


*See [changelog](docs/CHANGELOG.md)*

homebridge-macosx-info is homebridge plugin for Apple HomeKit, get and return somes systems informations from macOSX computer. 

Such as :
* updateTime
* Temperature (C°)
* Fan speed (rpm)
* Uptime
  * show how long system has been running
* Load average (%) 
  * the load average of the system over the last 1, 5, and 15 minute
* Free Mem (Mo)
* Disk avalable (%)
* Users (nb)
* CPU Power consumption (Watt)

You can see below screenshots for illustrate homebridge-macos-info plugin.

![homebridge-macos-info, Eve., screenshot](/img/homebridge-macosx-info_screenshots.png)

>Screenshots are taken from the Elgato Eve.app

## Exemple of .json data response file
```json  
{
    "updateTime":"Fri May 31 19:35:36 CEST 2019",
    "temperature":31.3,
    "fan":1797,
    "power":1.25,
    "uptime":"up 13:21",
    "load":"2.52 2.17 2.07",
    "freemem":639.96,
    "disk":"50",
    "user":2
}
```
## Prerequisites
* Install [Homebrew](https://brew.sh)<span style="color:gray"> *(Homebrew installs the stuff you need that Apple didn’t)*</span>
* Install [node.js](https://nodejs.org/en/download/package-manager/#macos) on macOS
* Install [Homebridge](https://github.com/nfarina/homebridge/wiki/Install-Homebridge-on-macOS) on macOS
* Install [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x#readme) on macOS <span style="color:gray">*(optional)</span>*
* Install [check_osx_smc](https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc) on macOS
* Install [Eve.app](https://www.evehome.com/en/eve-app) on iOS (for all availables plugin function), or it's possible to used "Home" app, but only on macOSX Majave and iOS (all plugin function aren't availables on this app !)
* [Enable NOPASSWD](#STEP-3-:-Add-NOPASSWD-entry-in-/etc/sudoers) for user in `/etc/sudoers` file

## Installation
Used [npm](https://www.npmjs.com/package/homebridge-macosx-info) tool to install homebridge-macosx-info, and execute the command line below

```npm i homebridge-macosx-info```

## Configuration
### STEP 1 : homebridge config.json file
Add this lines in config.json
```json    
"accessories": [
        {
            "accessory": "MacOSXSysInfo",
            "name": "macOSX Info",
            "file": "/tmp/_homebridge-macosx-info.json",
            "serial": "042-03-000",
            "consumption": true,
            "user": true,
            "updateInterval": 60000
        }
    ],
```

| Parameter       | Note | Optionnal | value | 
|-----------------|------|-----------|-------|
| `accessory`     | Name of accessory|No|`MacOSXSysInfo`|
| `name`          | a human-readable name for your plugin|No|`macOSX Info`|
| `file`          | .json respons file|yes|default : `/tmp/_homebridge-macosx-info.json`|
| `updateInterval`| is time in ms of data update|yes|default : `null`|
| `consumption`| `true` for log CPU Consumption|yes|default : `null`|
| `user`| `true` for log Users number|yes|default : `null`|


>Note : 
>1. The `index.js` call *`<PATH of Node Module>/homebridge-macosx-info/sh/homebridge-macosx-info.sh`* shell script. You can find this script in the repository in `/src/sh` directory
>2. It's possible that you can change the path of `homebridge-macosx-info.sh` in `readUptime` function on `index.js` script
```js
async function readUptime() {
    const exec = require('child_process').exec;
    var script = await exec('/usr/local/lib/node_modules/homebridge-macosx-info/src/sh/homebridge-macosx-info.sh',
        (error, stdout, stderr) => {
            if (error !== null) {
                //this.log("exec error: " + ${error});
            }
        }); 
};
```
### STEP 2 : homebridge config.json file Adapte "homebridge-macosx-info.sh" file in "src/sh" directory
1. Change or adapte path of temporary .json files -> var `JSON_DATA_FILE`
2. Change or adapte path of [`check_osx_smc`](https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc) binary -> var `CHECK_OSX_SMC`

```sh
JSON_DATA_FILE=/tmp/_homebridge-macosx-info.json # path of .json respons file 
CHECK_OSX_SMC=~/r2d2/it/script/check_osx_smc # path of check_osx_smc binary

function sys_mon()
{
    # See the hardware compatibility -> https://github.com/jedda/OSX-Monitoring-Tools/blob/master/check_osx_smc/known-registers.md
    # See README -> https://github.com/jedda/OSX-Monitoring-Tools/blob/master/check_osx_smc/README.md
    read -a fields <<< `$CHECK_OSX_SMC -s c -r TA0P,F0Ac -w 70,5200 -c 85,5800`
    _temp=${fields[7]//,/.}
    _fan=${fields[8]}

    _time=`date`
    read -a fields <<< `sudo powermetrics -i 500 -n1 --samplers cpu_power | grep "CPUs+GT+SA" | sed 's/Intel energy model derived package power (CPUs+GT+SA): //g'`
    _power=${fields[0]//W/}

    _uptime=`uptime`
    _load=$_uptime

    _uptime=${_uptime%users*} ; _uptime=${_uptime%,*} ; _uptime=${_uptime#*up} ; _uptime=${_uptime%,*} ; _uptime=${_uptime#*up} ; _uptime="up ${_uptime# }"
    _load=${_load#*load averages: }

    _user=`who | wc -l`
    _user="${_user// /}"

    read -a fields <<< `vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576)' | grep "free:"` ; _freemem=${fields[1]}
    read -a fields <<<  `df -h / | grep /` ; _disk=${fields[4]//%/}

    echo '{"updateTime":"'${_time}'","temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"power":'${_power}',"uptime":"'${_uptime}'","load":"'${_load}'","freemem":'${_freemem:0:6}',"disk":"'${_disk}'","user":'${_user}'}' > $JSON_DATA_FILE
}
```
### STEP 3 : Add NOPASSWD entry in your /etc/sudoers 
```sh
# root and users in group wheel can run anything on any machine as any user
root        ALL = (ALL) ALL
%admin      ALL = (ALL) ALL
<USER>      ALL=NOPASSWD: ALL
```
>Note : 
You must change the user `<USER>` by the user who run `homebridge` in your system

### STEP 4 : restart homebridge 
Combine the two commands in a terminal to restart homebridge background process

 - `launchctl unload ~/Library/LaunchAgents/com.homebridge.server.plist`
 - `launchctl load ~/Library/LaunchAgents/com.homebridge.server.plist`

>Note : 
This commands are only avalable for macOS 

## Todo
- [x] Generate all the measures in a .json file [[#3]](https://github.com/ad5030/homebridge-macosx-info/issues/3)
- [x] Worked on performance
  - [x] Use only sh built-in (no sed & no awk) [[#4]](https://github.com/ad5030/homebridge-macosx-info/issues/3)

## Known bugs
- [x] Uptime error in "homebridge-macosx-info" after more than one day ! [[#1]](https://github.com/ad5030/homebridge-macosx-info/issues/1)
- [x] Temparature and fan mesures don't work on all Apple mac hardware. Used now [`check_osx_smc`](https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc) binary. You can see the hardware compatibility [here](https://github.com/jedda/OSX-Monitoring-Tools/blob/master/check_osx_smc/known-registers.md) [[#2]](https://github.com/ad5030/homebridge-macosx-info/issues/2)

## Credits
* The original HomeKit API work was done by [KhaosT](https://twitter.com/khaost) in his [HAP-NodeJS](https://github.com/KhaosT/HAP-NodeJS) project
* [simont77 - fakegato-history](https://github.com/simont77/fakegato-history)
* [Jedda Wignall - OSX-Monitoring-Tools/check_osx_smc](https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc)

## Disclaimer
I'm furnishing this software "as is". I do not provide any warranty of the item whatsoever, whether express, implied, or statutory, including, but not limited to, any warranty of merchantability or fitness for a particular purpose or any warranty that the contents of the item will be error-free. The development of this module is not supported by Apple Inc. or eve. These vendors and me are not responsible for direct, indirect, incidental or consequential damages resulting from any defect, error or failure to perform.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details