#!/bin/sh
#-------------------------------------------------------------------
#~ @(#) Name : .sync.sh
#~ @(#) Desc : Sync projet and deploy in local host for test
#~ @(#) version : na
# Auteur : adm@di-marco.net
# Date : 2019-05-01
#-------------------------------------------------------------------
# Version history
#   na
#-------------------------------------------------------------------
#~ Usage : .sync.sh
#-------------------------------------------------------------------

ENV=PORDUCTION
SRC=../$(dirname $0)
USER_TARGET='AD' # User name
HOST_TARGET='192.168.42.3' # hHst to deploy inside port is 192.168.42.3 @ outside host is $HOST_TARGET
PATH_TARGET='~/r2d2/it/homekit/homebridge-macosx-info' # Path of script directory 
NODE_MODULE_TARGET='/usr/local/lib/node_modules/homebridge-macosx-info'

PORT_TARGET=22 # ssh port (inside port is 22 @ outside port is 10022) 

PLIST_TARGET='~/Library/LaunchAgents/' # Directory for plist file 
CONFIG_HOMEBRIDGE_TARGET='~/.homebridge/'

red=$'\e[1;31m%s\e[0m\n'
gre=$'\e[1;32m%s\e[0m\n'
yel=$'\e[1;33m%s\e[0m\n'
blu=$'\e[1;34m%s\e[0m\n'
mag=$'\e[1;35m%s\e[0m\n'
l_blu=$'\e[1;36m%s\e[0m\n'
end=$'\e[0m'

clear
printf "$red" "/!\ [$ENV] /!\ "
printf "$l_blu" "src directory [$SRC]"
printf "$l_blu" "users[$USER_TARGET]"
printf "$l_blu" "Host [$HOST_TARGET]"
printf "$l_blu" "Path target [$PATH_TARGET]"
printf "$l_blu" "Config homebridge target [$CONFIG_HOMEBRIDGE_TARGET]"
printf "$l_blu" "Port target [$PORT_TARGET]"

chmod +x $SRC/src/sh/*.sh

printf "$red" "-> save in $PATH_TARGET ..."
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "mkdir -p ${PATH_TARGET}/src/sh"
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "mkdir -p ${PATH_TARGET}/docs"
scp -P $PORT_TARGET -rp $SRC/LICENSE $USER_TARGET@$HOST_TARGET:$PATH_TARGET/LICENSE
scp -P $PORT_TARGET -rp $SRC/package.json $USER_TARGET@$HOST_TARGET:$PATH_TARGET/package.json
scp -P $PORT_TARGET -rp $SRC/README.md $USER_TARGET@$HOST_TARGET:$PATH_TARGET/README.md
scp -P $PORT_TARGET -rp $SRC/index.js $USER_TARGET@$HOST_TARGET:$PATH_TARGET/index.js
scp -P $PORT_TARGET -rp $SRC/src/sh/homebridge-macosx-info.sh $USER_TARGET@$HOST_TARGET:$PATH_TARGET/src/sh/homebridge-macosx-info.sh
scp -P $PORT_TARGET -rp $SRC/docs/CHANGELOG.md $USER_TARGET@$HOST_TARGET:$PATH_TARGET/docs/CHANGELOG.md


printf "$red" "-> Deploy in $NODE_MODULE_TARGET ..."
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "sudo mkdir -p ${NODE_MODULE_TARGET}/src/sh"
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "sudo mkdir -p ${NODE_MODULE_TARGET}/docs"
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "sudo chown -R AD:staff ${NODE_MODULE_TARGET}"

scp -P $PORT_TARGET -rp $SRC/LICENSE $USER_TARGET@$HOST_TARGET:$NODE_MODULE_TARGET/LICENSE
scp -P $PORT_TARGET -rp $SRC/README.md $USER_TARGET@$HOST_TARGET:$NODE_MODULE_TARGET/README.md
scp -P $PORT_TARGET -rp $SRC/package.json $USER_TARGET@$HOST_TARGET:$NODE_MODULE_TARGET/package.json
scp -P $PORT_TARGET -rp $SRC/index.js $USER_TARGET@$HOST_TARGET:$NODE_MODULE_TARGET/index.js
scp -P $PORT_TARGET -rp $SRC/src/sh/homebridge-macosx-info.sh $USER_TARGET@$HOST_TARGET:$NODE_MODULE_TARGET/src/sh/homebridge-macosx-info.sh
scp -P $PORT_TARGET -rp $SRC/docs/CHANGELOG.md $USER_TARGET@$HOST_TARGET:$NODE_MODULE_TARGET/docs/CHANGELOG.md


printf "$red" "  |_ homebridge restart"
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "launchctl unload ~/Library/LaunchAgents/com.homebridge.server.plist && rm ~/.homebridge/config.json" && printf "$gre" "    |_ homebride [OFF]"
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "ln -s ~/.homebridge/config.wake.json ~/.homebridge/config.json && launchctl load ~/Library/LaunchAgents/com.homebridge.server.plist" && printf "$gre" "    |_ homebride [ON]"

printf "$red" "-> Sync ownCloud repository ..."
/usr/bin/ssh -p $PORT_TARGET $USER_TARGET@$HOST_TARGET "/usr/local/Cellar/php@7.2/7.2.15/bin/php /Library/WebServer/Documents/owncloud/occ files:scan AD"

printf "$gre" "[Ended deployement]"