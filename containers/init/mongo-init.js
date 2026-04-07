const dbName = process.env.DB_NAME || 'medirecord';

db = db.getSiblingDB('admin');
db.createUser({
  user: process.env.DB_USER,
  pwd: process.env.DB_PASSWORD,
  roles: [{ role: 'readWrite', db: dbName }],
});
