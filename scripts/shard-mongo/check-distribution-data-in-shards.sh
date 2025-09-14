#!/bin/bash

docker exec -it mongos mongosh --port 27017
use chat_service
db.users.getShardDistribution()
