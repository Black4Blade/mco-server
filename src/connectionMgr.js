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

const fail = require ('assert');
const loginDataHandler = require ('../lib/LoginServer/index').loginDataHandler;
const personaDataHandler = require ('../lib/PersonaServer/index')
  .personaDataHandler;
const Connection = require ('./Connection');
const logger = require ('./logger');
const defaultHandler = require ('./TCPManager').defaultHandler;
class ConnectionMgr {
  constructor () {
    this.connections = [];
    this.newConnectionId = 1;
    return this;
  }

  /**
   * Locate connection by remoteAddress and localPort in the connections array
   * @param {String} connectionId
   */
  findConnectionByAddressAndPort (remoteAddress, localPort) {
    const results = this.connections.find (connection => {
      const match =
        remoteAddress === connection.remoteAddress &&
        localPort === connection.localPort;
      return match;
    });
    return results;
  }

  /**
   * Locate connection by id in the connections array
   * @param {String} connectionId
   */
  findConnectionById (connectionId) {
    const results = this.connections.find (connection => {
      const match = connectionId === connection.id;
      return match;
    });
    return results;
  }

  /**
   * Deletes the provided connection id from the connections array
   * FIXME: Doesn't actually seem to work
   * @param {String} connectionId
   */
  deleteConnection (connection) {
    this.connections = this.connections.filter (
      conn =>
        conn.id !== connection.id && conn.localPort !== connection.localPort
    );
  }
  updateConnectionById (connectionId, newConnection) {
    if (newConnection === undefined) {
      throw new Error ('Undefined connection');
    }
    const index = this.connections.findIndex (
      connection => connection.id === connectionId
    );
    this.connections.splice (index, 1);
    this.connections.push (newConnection);
  }

  /**
   * Create new connection if when haven't seen this socket before,
   * or update the socket on the connection object if we have.
   * @param {String} id
   * @param {Socket} socket
   */
  findOrNewConnection (socket) {
    const {remoteAddress, localPort} = socket;
    const con = this.findConnectionByAddressAndPort (remoteAddress, localPort);
    if (con !== undefined) {
      logger.info (
        `I have seen connections from ${remoteAddress} on ${localPort} before`
      );
      con.sock = socket;
      return con;
    }

    const connectionManager = this;
    const newConnection = new Connection (
      this.newConnectionId,
      socket,
      connectionManager
    );
    logger.info (
      `I have not seen connections from ${remoteAddress} on ${localPort} before, adding it.`
    );
    this.connections.push (newConnection);
    return newConnection;
  }

  /**
   * Dump all connections for debugging
   */
  dumpConnections () {
    return this.connections;
  }
}

/**
 * Check incoming data and route it to the correct handler based on localPort
 * @param {String} id
 * @param {Buffer} data
 */
function processData (rawPacket) {
  return new Promise ((resolve, reject) => {
    const {remoteAddress, localPort, data} = rawPacket;
    // logger.info(`Connection Manager: Got data from ${remoteAddress} on
    //   localPort ${localPort}`, data);

    switch (localPort) {
      case 8226:
        resolve (loginDataHandler (rawPacket));
        break;
      case 8228:
        resolve (personaDataHandler (rawPacket));
        break;
      case 7003:
        resolve (defaultHandler (rawPacket));
        break;
      case 43300:
        resolve (defaultHandler (rawPacket));
        break;
      default:
        logger.error (
          `No known handler for localPort ${localPort}, unable to handle the request from ${remoteAddress} on localPort ${localPort}, aborting.`
        );
        logger.info ('Data was: ', data.toString ('hex'));
        process.exit (1);
        reject ();
    }
  });
}

module.exports = {ConnectionMgr, processData};
