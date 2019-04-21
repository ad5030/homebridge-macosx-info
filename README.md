# homebridge-macosx-info

This homebridge plugin for Apple HomeKit, get and return somes systems informations from macOSX computer. 

Such as :
* Temperature (C°)
* Fan speed (rpm)
* Uptime (hh.mm)
* Free mem (Mo)
* Disk avalable (%)
* Load average (%)

You can see below two screenshots for illustrate homebridge-macos-info homebridge/HomeKit plugin.

<div style="width:830; background-color:white; height:400px; overflow:scroll; overflow-x: scroll;overflow-y: hidden;">
<img style=" float:left; display:inline" src=https://github.com/ad5030/homebridge-macosx-info/blob/master/screenshots/screenshot_1.png width="30%" height="30%"/>
<img style=" float:left; display:inline" src=https://github.com/ad5030/homebridge-macosx-info/blob/master/screenshots/.fake.png width="5%" height="5%"/>
<img style=" float:left; display:inline" src=https://github.com/ad5030/homebridge-macosx-info/blob/master/screenshots/screenshot.png width="30%" height="30%"/>
</div>

## Prerequisites
* Install <a href="https://github.com/nfarina/homebridge/wiki/Install-Homebridge-on-macOS">Homebridge</a> on macOS
* Install <a href="https://nodejs.org/en/download/package-manager/#macos">node.js</a> on macOS
* Install <a href="https://github.com/oznu/homebridge-config-ui-x#readme">Homebridge Config UI X</a> on macOS (optional)
* Install <a href="https://github.com/jedda/OSX-Monitoring-Tools/tree/master/check_osx_smc">check_osx_smc</a> on macOS
* Install Apple iOS <a href="https://www.evehome.com/en/eve-app">EVE.</a> App on iPhone or iPad

## Configuration

### Add this lines in homebridge congig.json file.

```
    "accessories": [
        {
            "accessory": "MacOSXSysInfo",
            "name": "macOSX Info",
            "file": "/tmp/hb_temperature.txt",
            "updateInterval": 60000
        }
    ],
```
The "/tmp/_hb_temperature.txt" is a file where the temperature is temporarily measured. The default value of this is "/tmp/_hb_temperature.txt".

"updateInterval" : is time in second of update measured temperature.

The index.js call "/sh/homebridge-macosx-info.sh" shell script. You can find this script in the repository in "/sh" directory

### Adapte "homebridge-macosx-info.sh" file in sh/ directory

* Change or adapte path of "check_osx_smc" bin
* Change or adapte path of temporary files :
    1. _hb_temperature.txt
    2. _hb_uptime.txt
    3. _homebridge-macosx-info.json


```
function sys_mon()
{
    _TIME=`date`

    read -a fields <<< `~/r2d2/it/nagios/check_osx_smc -s c -r TA0P,F0Ac -w 70,5200 -c 85,5800`
    _temp=${fields[7]//,/.}
    _fan=${fields[8]}

    IFS=' ' read -ra STR <<< `uptime`   
    _UPTIME="${STR[1]} ${STR[2]} ${STR[3]} ${STR[4]//,/}"
    _LOAD="${STR[5]}"

    read -a fields <<< `vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576)' | grep "free:"`
    _mem=${fields[1]}

    read -a fields <<<  `df -h / | grep /`
    _disk=${fields[4]//%/}

    _homebridge-macosx-info.json
    echo '{"UpdateTime":"'${_TIME}'","temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":"'${_UPTIME}'","mem":'${_mem:0:6}',"disk":'${_disk}'}' > /tmp/_homebridge-macosx-info.json
    echo ${_temp:5:4} > /tmp/_hb_temperature.txt
    uptime > /tmp/_hb_uptime.txt
}
```

## TODO

- [ ] Worked on performance 
- [ ] Generate all the measures in a .json file.

## Known bugs

- [x] Uptime error in "homebridge-macosx-info" after more than one day !
- [ ] Temparature and fan mesures don't work on all Apple mac hardware.    

## Credits

* <a href="https://github.com/simont77/fakegato-history">simont77 - fakegato-history</a>


## Disclaimer

I'm furnishing this software "as is". I do not provide any warranty of the item whatsoever, whether express, implied, or statutory, including, but not limited to, any warranty of merchantability or fitness for a particular purpose or any warranty that the contents of the item will be error-free. The development of this module is not supported by Apple Inc. or EVE. These vendors and me are not responsible for direct, indirect, incidental or consequential damages resulting from any defect, error or failure to perform.

## License

is project is licensed under the MIT License - see the <a href="https://github.com/ad5030/homebridge-macosx-info/blob/master/LICENSE"> LICENSE</a> file for details
