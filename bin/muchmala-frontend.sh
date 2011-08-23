#!/bin/bash
MUCHMALA_FRONTEND_LOGDIR="${MUCHMALA_FRONTEND_LOGDIR:-"/var/log/muchmala-lb"}"
if [ ! -d "$MUCHMALA_FRONTEND_LOGDIR" ]; then
	mkdir -p "$MUCHMALA_FRONTEND_LOGDIR"
fi

LOGFILE="${MUCHMALA_FRONTEND_LOGDIR}"/daemon.log
nohup ./bin/muchmala-frontend.js "$@" >> $LOGFILE < /dev/null 2>&1 &
