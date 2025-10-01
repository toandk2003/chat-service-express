docker exec -it mongos /bin/bash

mongosh

use chat_service  

db.users.drop();
db.conversations.drop();
db.user_conversations.drop();
db.messages.drop();
db.attachments.drop();
db.conversation_views.drop();