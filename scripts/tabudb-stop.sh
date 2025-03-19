#!/bin/bash
#
# tabudb-stop.sh - Stop the tabu-db-api service
#
# This script stops the tabu-db-api systemd service and shows
# the current status after stopping.

echo "==== Stopping tabu-db-api Service ===="
sudo systemctl stop tabu-db-api.service

# Check if stop was successful
if [ $? -eq 0 ]; then
    echo -e "\n✅ Service stop command executed successfully."
else
    echo -e "\n❌ Service stop command failed with error code $?."
fi

# Show current status after stop
echo -e "\n==== Current Service Status ===="
sudo systemctl status tabu-db-api.service

echo -e "\nTo see logs, run: ./tabudb-logs.sh"

