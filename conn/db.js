const pg = require("pg");
let connectionString = `postgres://${config.db.user}:${config.db.pass}@${config.db.host}:${config.db.port}/${config.db.name}`
//let connectionString = "postgres://postgres:root@localhost:5432/open_street_map";

const conn = new pg.Client(connectionString);
conn.connect();

module.exports = {
    conn
}