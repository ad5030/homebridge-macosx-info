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

read -a fields <<< `~/r2d2/it/nagios/check_osx_smc -s c -r TA0P,F0Ac -w 70,5200 -c 85,5800`
_temp=${fields[7]//,/.}
_fan=${fields[8]}

#read -a fields <<< `uptime`
#_uptime=${fields[2]//,/}
#_uptime=${_uptime//:/.}

IFS=' ' read -ra STR <<< `uptime`   
_UPTIME="${STR[1]} ${STR[2]} ${STR[3]} ${STR[4]//,/}"
_LOAD="${STR[5]}"

read -a fields <<< `vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576)' | grep "free:"`
_mem=${fields[1]}

read -a fields <<<  `df -h / | grep /`
_disk=${fields[4]//%/}

## for debug
#echo _temp--${_temp:5:5}--
#echo _fan--${_fan:5:4}--
#echo _load--${_load:0:4}--
#echo _mem--${_mem:0:6}--
#echo _uptime--${_uptime:0:5}--
#echo '{"temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":'${_uptime:0:5}',"load":'${_load:0:4}',"mem":'${_mem:0:5}'}' > /tmp/sys_mon.json}

#echo '{"temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":'${_uptime:0:5}',"mem":'${_mem:0:6}',"disk":'${_disk}'}' > /tmp/_homebridge-macosx-info.json
echo '{"UpdateTime":"'${_TIME}'","temperature":'${_temp:5:4}',"fan":'${_fan:5:4}',"uptime":"'${_UPTIME}'","mem":'${_mem:0:6}',"disk":'${_disk}'}' > /tmp/_homebridge-macosx-info.json
echo ${_temp:5:4} > /tmp/_hb_temperature.txt
uptime > /tmp/_hb_uptime.txt
}
## main ##
sys_mon
