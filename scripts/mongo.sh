docker exec -it mongos /bin/bash

mongosh

use chat_service  

db.users.drop();
db.conversations.drop();
db.messages.drop();
db.attachments.drop();
db.events.drop();
db.resume_tokens.drop();
db.attachments.drop();
;
