// eslint-disable-next-line @typescript-eslint/no-require-imports
const mysql = require('mysql2/promise');

const db = mysql.createPool(process.env.MYSQL_URL);

export default db