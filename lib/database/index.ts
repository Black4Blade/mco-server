// mco-server is a game server, written from scratch, for an old game
// Copyright (C) <2017-2018>  <Joseph W Becher>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import * as sqlite from "sqlite";

/**
 * Create the sessions database table if it does not exist
 * @param {Function} callback
 */
export async function createDB() {
  const db = await sqlite.open("../../data/sessions.db");
  const status = await db.run(
    `CREATE TABLE IF NOT EXISTS sessions (customer_id INTEGER NOT NULL UNIQUE, 
      session_key TEXT, s_key TEXT, context_id TEXT, connection_id INTEGER)`,
    [],
  );
  return status;
}

/**
 * Fetch session key from database based on remote address
 * @param {string} remoteAddress
 */
export async function fetchSessionKeyByConnectionId(connectionId: number) {
  const db = await sqlite.open("./data/sessions.db", { promise: Promise });
  const keys = await db.get(
    "SELECT session_key, s_key FROM sessions WHERE connection_id = $1",
    [connectionId],
  );
  return keys;
}

export async function updateSessionKey(customerId: number, sessionKey: string, contextId: string, connectionId: number) {
  const sKey = sessionKey.substr(0, 16);
  const db = await sqlite.open("./data/sessions.db");
  const status = await db.run(
    `INSERT OR REPLACE INTO sessions (customer_id, session_key, s_key, context_id, 
      connection_id) VALUES ($1, $2, $3, $4, $5)`,
    [customerId, sessionKey, sKey, contextId, connectionId],
  );
  return status;
}
