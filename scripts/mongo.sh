docker exec -it mongos /bin/bash

mongosh


use chat_Service   // thay my_database bằng tên DB của bạn
db.users.drop()
db.conversations.drop()
db.user_conversations.drop()