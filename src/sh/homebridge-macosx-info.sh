#!/bin/sh
#-------------------------------------------------------------------
#~ @(#) Name : homebridge-macosx-info.sh
#~ @(#) Desc : Persist in file the macOSX sys infrmation needed by "homebridge-macosx-info" Homebridge/HomeKit plugin
#~ @(#) version : 0.1
# Auteur : @ad5030
# Date : 2019-04-07
#-------------------------------------------------------------------
# Version history
#   v0.1 - Initial version
#   test and work on : mac mini (late 2014) & macOSX 10.13.6(High Sierra) 
#       & must be adapt for other mac
#-------------------------------------------------------------------
#~ Usage : homebridge-macosx-info.sh
#-------------------------------------------------------------------

function sys_mon()
{
_TIME=`date`

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
_mem=${fields[1]}

read -a fields <<<  `df -h / | grep /`
_disk=${fields[4]//%/}

echo '{"UpdateTime":"'${_TIME}'","temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":"'${_uptime}'","load":"'${_load}'","mem":'${_mem:0:6}',"disk":'${_disk}'}' > /tmp/_homebridge-macosx-info.json
}
## main ##
sys_mon
