var mysql = require('mysql2/promise');
const config = require('./config.js');

class DAO {
    async connect() {
        try {
            var connection = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database
            });
            return connection;
        } catch (err) {
            console.log(err);
        }
    }

    async register(username, password, email, birthdate) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll insert the account in the database
            await connection.query('INSERT INTO utente (username, password, email, birthdate) VALUES (?, ?, ?, ?)', [username, password, email, birthdate]);
            return [true, 0];
        } catch (error) {
            return [false, error.errno];
        }
    }

    async login(username, password) {
        try {
            var connection = await this.connect();
            // Execute SQL query that'll select the account from the database based on the specified username and password
            let selection = await connection.query('SELECT * FROM utente WHERE username = ? AND password = ?', [username, password]);
            let results = selection[0];
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                return [true, 0, {username: results[0].username}];
            }
        } catch (error) {
            return [false, error.errno, {username: ''}];
        }
    }

    //logout user removin his token
    async logout(id, token) {
        try {
            var connection = await this.connect();
            let result = await connection.query("SELECT * FROM user WHERE id = ? AND token = ?", [id, token]);
            result = result[0]
            if (result.length == 1) {
                await connection.query("UPDATE user SET token = NULL WHERE id = ? AND token = ?", [id, token]);
                await connection.end();
                return true;
            } else {
                await connection.end();
                return false;
            }
        } catch (err) {
            console.log(err);
            await connection.end();
            return false;
        }
    }
}

module.exports = DAO