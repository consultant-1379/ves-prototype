#!/bin/bash
VESMEDIATOR="ves-mediator"
MOSQUITTO="mosquitto"

#
# this script will start the ves-mediator and daemonize it
#

BASEDIR=$(readlink -f $0 | xargs dirname)
PROGNAME=$(basename $0)

pids_mediator()
{
    echo $(ps -ef | grep "$BASEDIR/$VESMEDIATOR" | grep -v grep|awk '{print $2;}')
}

pids_mosquitto()
{
    echo $(ps -ef | grep "$MOSQUITTO" | grep -v grep|awk '{print $2;}')
}

stop_mediator()
{
   PIDS=$(pids_mediator)
   if [ ! -z "$PIDS" ]; then
       kill -SIGTERM $PIDS
   fi
}

stop_mosquitto()
{
   PIDS=$(pids_mosquitto)
   if [ ! -z "$PIDS" ]; then
       kill -SIGTERM $PIDS
   fi
}

start_mediator()
{
   if [ -z "$(pids_mediator)" ]; then
     #double fork to get rid of parent and be adopted by init process
     # and handle stdin/out/err

     (nohup  $BASEDIR/$VESMEDIATOR  0<&- &> $BASEDIR/../mediator.log &)&
   else
      echo "$VESMEDIATOR is already running"
   fi
}

start_mosquitto()
{
   if [ -z "$(pids_mosquitto)" ]; then
     #double fork to get rid of parent and be adopted by init process
     # and handle stdin/out/err

     (nohup  $MOSQUITTO -v -c $BASEDIR/../../$MOSQUITTO/mosquitto.conf 0<&- &> $BASEDIR/../mosquitto.log &)&
   else
      echo "$MOSQUITTO is already running"
   fi
}

restart()
{
   stop_mediator
   stop_mosquitto
   start_mosquitto
   start_mediator
}

usage()
{
  echo
  echo usage: $PROGNAME start|stop|restart
  echo
  exit 1
}

if [ $# != 1 ]; then
   usage
elif [ "$1" == "start" ]; then
   start_mosquitto;
   start_mediator
elif [ "$1" == "stop" ]; then
   stop_mediator;
   stop_mosquitto
elif [ "$1" == "restart" ]; then
   #double fork to get rid of parent and be adopted by init process
   restart
else
   usage
fi
