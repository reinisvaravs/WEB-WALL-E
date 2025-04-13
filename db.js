import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Knowledge Base Functions

// Deletes all chunks and vectors of a changed file
export async function deleteVectorChunk(fileName) {
  await pool.query(`DELETE FROM vectors WHERE file_name = $1`, [fileName]);
}

// Deletes file hash from the database
export async function deleteFileHash(fileName) {
  await pool.query(`DELETE FROM file_hashes WHERE file_name = $1`, [fileName]);
  console.log("[deleting hash from}:", fileName);
}

// Saves chunks to database
export async function saveVectorChunk(fileName, chunk, embedding) {
  const vectorString = `[${embedding.join(",")}]`; // Converts JS array to PostgreSQL vector string
  await pool.query(
    `INSERT INTO vectors (file_name, chunk, embedding)
     VALUES ($1, $2, $3::vector)`,
    [fileName, chunk, vectorString]
  );
  console.log("[updating]: ", fileName);
}

// Gets all chunk vectors from database
export async function loadAllVectors() {
  const result = await pool.query(
    "SELECT file_name, chunk, embedding FROM vectors"
  );
  return result.rows.map((row) => ({
    chunk: `[${row.file_name}]\n${row.chunk}`,
    vector: row.embedding,
  }));
}

// Finds similar chunks of info to message in PostgreSQL
export async function findSimilarChunks(messageEmbedding, topN) {
  const vectorString = `[${messageEmbedding.join(",")}]`; // PostgreSQL vector format

  const result = await pool.query(
    `
    SELECT file_name, chunk, embedding <#> $1 AS score
    FROM vectors
    ORDER BY embedding <#> $1
    LIMIT $2
    `,
    [vectorString, topN]
  );

  return result.rows;
}

// Returns hash of passed file
export async function getStoredFileHash(filename) {
  const result = await pool.query(
    `SELECT hash FROM file_hashes WHERE file_name = $1`,
    [filename]
  );
  return result.rows[0]?.hash || null;
}

// Adds or updates file hash
export async function storeFileHash(filename, hash) {
  await pool.query(
    `
    INSERT INTO file_hashes (file_name, hash)
    VALUES ($1, $2)
    ON CONFLICT (file_name) DO UPDATE SET hash = EXCLUDED.hash
    `,
    [filename, hash]
  );
}

// Gets all file names from database
export async function getAllStoredFileNames() {
  const res = await pool.query("SELECT DISTINCT file_name FROM vectors"); // returns array of jsons
  return res.rows.map((r) => r.file_name); // returns array of strings of file names
}

// Configuration Functions

// Gets a configuration value
export async function getConfigValue(key) {
  const result = await pool.query(
    "SELECT value FROM bot_config WHERE key = $1",
    [key]
  );
  return result.rows[0]?.value || null;
}

// Sets a configuration value
export async function setConfigValue(key, value) {
  await pool.query(
    `INSERT INTO bot_config (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

// Logging Functions

// Logs user token usage
export async function logUserTokenUsage(userId, model, tokens) {
  await pool.query(
    `INSERT INTO user_logs (user_id, model, tokens)
     VALUES ($1, $2, $3)`,
    [userId, model, tokens]
  );
}

// Increments a statistic counter
export async function incrementStat(key) {
  await pool.query(
    `INSERT INTO bot_stats (stat_key, value)
     VALUES ($1, 1)
     ON CONFLICT (stat_key)
     DO UPDATE SET value = bot_stats.value + 1`,
    [key]
  );
}

export default pool;
