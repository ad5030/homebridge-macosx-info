#!/bin/sh
#-------------------------------------------------------------------
#~ @(#) Name : homebridge-macosx-info.sh
#~ @(#) Desc : Persist in file the macOSX sys infrmation needed by "homebridge-macosx-info" Homebridge/HomeKit plugin
#~ @(#) version : 1.0
# Auteur : adm@di-marco.net
# Date : 2019-05-06
#-------------------------------------------------------------------
# Version history
#   v1.O - Initial version - Test and work on : mac mini (late 2014) & macOSX 10.13.6(High Sierra) 
#-------------------------------------------------------------------
#~ Usage : homebridge-macosx-info.sh
#-------------------------------------------------------------------

JSON_DATA_FILE=/tmp/_homebridge-macosx-info.json # path of .json respons file 
CHECK_OSX_SMC=~/r2d2/it/script/check_osx_smc # path of check_osx_smc binary

function sys_mon()
{
_time=`date`

# See the hardware compatibility -> https://github.com/jedda/OSX-Monitoring-Tools/blob/master/check_osx_smc/known-registers.md
read -a fields <<< `$CHECK_OSX_SMC -s c -r TA0P,F0Ac -w 70,5200 -c 85,5800`
_temp=${fields[7]//,/.}
_fan=${fields[8]}

_uptime=`uptime | cut -d " " -f2- |  sed -E 's/.*(up.*), [[:digit:]]+ user.*/\1/'`

_load=`sysctl -n vm.loadavg` 
_load="${_load//[\{\}]}"
_load="${_load/ /}"
_load="${_load%?}"

_user=`who | wc -l`
_user="${_user// /}"

read -a fields <<< `vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576)' | grep "free:"`
_freemem=${fields[1]}

read -a fields <<<  `df -h / | grep /`
_disk=${fields[4]//%/}

echo '{"updateTime":"'${_time}'","temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":"'${_uptime}'","load":"'${_load}'","freemem":'${_freemem:0:6}',"disk":'${_disk}',"user":'${_user}'}' > $JSON_DATA_FILE
}

## main ##
sys_mon
