#!/bin/bash

# Step 1 -> after then check using docker exec -it configs1 mongosh --eval "rs.status()"
docker exec -it configs1 mongosh  --port 27017 --eval  "
rs.initiate({
  _id: 'configReplSet',
  configsvr: true,
  members: [
    { _id: 0, host: 'configs1:27017' },
    { _id: 1, host: 'configs2:27017' },
    { _id: 2, host: 'configs3:27017' }
  ]
})
"

# Step 2  : init shard1 replicaSet > then check using docker exec -it shard1_node1 mongosh --eval "rs.status()"
docker exec -it shard1_node1 mongosh --port 27017 --eval '
rs.initiate({
  _id: "shard1",
  members: [
    { _id: 0, host: "shard1_node1:27017" },
    { _id: 1, host: "shard1_node2:27017" },
    { _id: 2, host: "shard1_node3:27017" }
  ]
})
'

# Step 3  : init shard2 replicaSet > then check using docker exec -it shard2_node1 mongosh --eval "rs.status()"
docker exec -it shard2_node1 mongosh --port 27017 --eval '
rs.initiate({
  _id: "shard2",
  members: [
    { _id: 0, host: "shard2_node1:27017" },
    { _id: 1, host: "shard2_node2:27017" },
    { _id: 2, host: "shard2_node3:27017" }
  ]
})
'

# Step 3 Add shard
 docker exec -it mongos mongosh --port 27017 --eval "
sh.addShard('shard1/shard1_node1:27017,shard1_node2:27017,shard1_node3:27017')
sh.addShard('shard2/shard2_node1:27017,shard2_node2:27017,shard2_node3:27017')
"

# Step 4 enable sharding
docker exec -it mongos mongosh --port 27017 --eval "
// Enable sharding for chat_service database
sh.enableSharding('chat_service')
"