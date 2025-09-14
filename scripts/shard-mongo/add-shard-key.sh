#!/bin/bash

#User
docker exec -it mongos mongosh --port 27017 --eval "
sh.shardCollection('chat_service.users', { 'userId': 1 })
"