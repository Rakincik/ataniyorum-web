const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const connectionUrl = process.env.DATABASE_URL || '';
  const maskedUrl = connectionUrl.replace(/:[^:@]+@/, ':****@');
  console.log('TEST_CONNECTION_START');
  console.log('Connection URL:', maskedUrl);
  try {
    await client.connect();
    console.log('SUCCESS: Successfully connected to the database!');
    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log('DB_INFO:', JSON.stringify(res.rows[0]));
  } catch (err) {
    console.log('FAILURE: Connection failed!');
    console.log('ERROR_CODE:', err.code);
    console.log('ERROR_MESSAGE:', err.message);
  } finally {
    await client.end();
    console.log('TEST_CONNECTION_END');
  }
}

main().catch((e) => {
  console.error('Fatal outer error:', e);
});
