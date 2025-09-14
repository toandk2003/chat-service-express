# limit chunk size
docker exec -it mongos mongosh
use config;
db.settings.deleteOne({'_id': 'chunksize'});
db.settings.insertOne({'_id': 'chunksize', 'value': 1}); // 1MB thay vì 64MB