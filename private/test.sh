#!/bin/bash
 
 
_LOAD=`sysctl -n vm.loadavg` 
_LOAD="${_LOAD//[\{\}]}"
_LOAD="${_LOAD/ /}"
_LOAD="${_LOAD%?}"

echo --$_LOAD--
