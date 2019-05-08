# homebridge-macosx-info
[![npm](https://img.shields.io/npm/dt/homebridge-macosx-info.svg)](https://www.npmjs.com/package/homebridge-macosx-info) [![npm](https://img.shields.io/npm/v/homebridge-macosx-info.svg)](https://www.npmjs.com/package/homebridge-macosx-info)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) 

*See [Changelog](docs/CHANGELOG.md)*

This homebridge plugin for Apple HomeKit, get and return somes systems informations from macOSX computer. 

Such as :
* Temperature (C°)
* Fan speed (rpm)
* Uptime
  * show how long system has been running
* Free Mem (Mo)
* Disk avalable (%)
* Load average (%) 
  * the load average of the system over the last 1, 5, and 15 minute
* updateTime

You can see below two screenshots for illustrate homebridge-macos-info homebridge/HomeKit plugin.
<div style="width:650px; height:533px; overflow:scroll; overflow-x: scroll;overflow-y: hidden">
<img style=" float:left; display:inline" src=https://di-marco.net/screenshots/screenshot_1.png width="300px" height="533px"/>
<img style=" float:left; display:inline" src=https://di-marco.net/screenshots/.fake.png width="50px" height="50px"/>
<img style=" float:left; display:inline" src=https://di-marco.net/screenshots/screenshot_2.png width="300px" height="533px"/>
</div>

## Exemple of .json data response file
```json  
{
    "updateTime":"Sun Apr 21 22:38:07 CEST 2019",
    "temperature":30.7,
    "fan":1801,
    "uptime":"up 16:38, 2 users",
    "load":"3.15 1.97 1.82",
    "freemem":422.35,
    "disk":50
}
```
## Prerequisites
* Install [Homebrew](https://brew.sh)<span style="color:gray"> *(Homebrew installs the stuff you need that Apple didn’t)*</span>
* Install <a href="https://github.com/nfarina/homebridge/wiki/Install-Homebridge-on-macOS">Homebridge</a> on macOS
* Install <a href="https://github.com/oznu/homebridge-config-ui-x#readme">Homebridge Config UI X</a> on macOS <span style="color:gray">*(optional)</span>*
* Install <a href="https://nodejs.org/en/download/package-manager/#macos">node.js</a> on macOS
* Install <a href="https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc">check_osx_smc</a> on macOS
* Install <a href="https://www.evehome.com/en/eve-app">Eve.</a> app on iPhone/Pad or used "Home" app on macOSX Majave

## Installation
Used <a href="https://www.npmjs.com/package/homebridge-macosx-info">npm</a> tool to install homebridge-macosx-info. And type the command line below

```npm i homebridge-macosx-info```

## Configuration
### Add this lines in homebridge config.json file.
```json    
"accessories": [
        {
            "accessory": "MacOSXSysInfo",
            "name": "macOSX Info",
            "file": "/tmp/_homebridge-macosx-info.json",
            "updateInterval": 60000
        }
    ],
```
The "<span style="color:gray">*/tmp/_homebridge-macosx-info.json*</span>" is a file where the temperature is temporarily measured. The default value of this is "<span style="color:gray">*/tmp/_homebridge-macosx-info.json*</span>".

"updateInterval" : is time in second of update measured temperature.

The index.js call "<span style="color:gray">*/sh/homebridge-macosx-info.sh*</span>" shell script. You can find this script in the repository in "/sh" directory

### Adapte "homebridge-macosx-info.sh" file in "sh" directory
* Change or adapte path of "<a href="https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc">check_osx_smc</a>" bin
* Change or adapte path of temporary files : _homebridge-macosx-info.json

```sh
function sys_mon()
{
    _time=`date`

    read -a fields <<< `~/r2d2/it/script/check_osx_smc -s c -r TA0P,F0Ac -w 70,5200 -c 85,5800`
    _temp=${fields[7]//,/.}
    _fan=${fields[8]}

    IFS=' ' read -ra STR <<< `uptime`   
    _uptime="${STR[1]} ${STR[2]} ${STR[3]} ${STR[4]//,/}"

    _load=`sysctl -n vm.loadavg` 
    _load="${_load//[\{\}]}"
    _load="${_load/ /}"
    _load="${_load%?}"

    read -a fields <<< `vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576)' | grep "free:"`
    _freemem=${fields[1]}

    read -a fields <<<  `df -h / | grep /`
    _disk=${fields[4]//%/}

    echo '{"updateTime":"'${_time}'","temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":"'${_uptime}'","load":"'${_load}'","freemem":'${_freemem:0:6}',"disk":'${_disk}'}' > $JSON_DATA_FILE
}
```

## Todo
- [x] Generate all the measures in a .json file. 
- [ ] Worked on performance
  - [x] Use only sh built-in (no sed & awk) 


## Known bugs
- [x] Uptime error in "homebridge-macosx-info" after more than one day ! 
- [x] Temparature and fan mesures don't work on all Apple mac hardware. Used now <a href="https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc">check_osx_smc</a> binary. You can see the hardware compatibility [here](https://github.com/jedda/OSX-Monitoring-Tools/blob/master/check_osx_smc/known-registers.md)  

## Credits
* The original HomeKit API work was done by <a href="https://twitter.com/khaost">KhaosT</a> in his <a href="https://github.com/KhaosT/HAP-NodeJS">HAP-NodeJS project<a/>.
* <a href="https://github.com/simont77/fakegato-history">simont77 - fakegato-history</a>
* <a href="https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc">Jedda Wignall - OSX-Monitoring-Tools/check_osx_smc</a>


## Disclaimer
I'm furnishing this software "as is". I do not provide any warranty of the item whatsoever, whether express, implied, or statutory, including, but not limited to, any warranty of merchantability or fitness for a particular purpose or any warranty that the contents of the item will be error-free. The development of this module is not supported by Apple Inc. or eve. These vendors and me are not responsible for direct, indirect, incidental or consequential damages resulting from any defect, error or failure to perform.

## License
is project is licensed under the MIT License - see the <a href="https://github.com/ad5030/homebridge-macosx-info/blob/master/LICENSE"> LICENSE</a> file for details