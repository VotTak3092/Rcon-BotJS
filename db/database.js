const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, vk_id TEXT UNIQUE, role TEXT)");
});

module.exports = {
    getUserById: (vk_id, callback) => {
        db.get("SELECT * FROM users WHERE vk_id = ?", [vk_id], callback);
    },
    setUserRole: (vk_id, role, callback) => {
        db.run("INSERT INTO users (vk_id, role) VALUES (?, ?) ON CONFLICT(vk_id) DO UPDATE SET role = excluded.role", [vk_id, role], callback);
    },
    deleteUserRole: (vk_id, callback) => {
        db.run("DELETE FROM users WHERE vk_id = ?", [vk_id], callback);
    }
};