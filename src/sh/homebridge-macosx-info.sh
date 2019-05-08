#!/bin/sh
#-------------------------------------------------------------------
#~ @(#) Name : homebridge-macosx-info.sh
#~ @(#) Desc : Persist in file the macOSX sys infrmation needed by "homebridge-macosx-info" Homebridge/HomeKit plugin
#~ @(#) version : 1.0
# Auteur : adm@di-marco.net
# Date : 2019-05-05
#-------------------------------------------------------------------
# Version history
#   v1.O - Initial version - Test and work on : mac mini (late 2014) & macOSX 10.13.6(High Sierra) 
#-------------------------------------------------------------------
#~ Usage : homebridge-macosx-info.sh
#-------------------------------------------------------------------

JSON_DATA_FILE=/tmp/_homebridge-macosx-info.json

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

## main ##
sys_mon
