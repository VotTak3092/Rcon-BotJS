const { Rcon } = require('rcon-client');
const config = require('./config/config');

    /*
    Не рекомендую вообще тут что-то менять.
    */

class RconManager {
    constructor(options) {
        this.options = options;
    }

    async sendCommand(command) {
        const rcon = new Rcon(this.options);

        try {
            await rcon.connect();
            return await rcon.send(command);
        } catch (error) {
            console.error('Ошибка RCON:', error.message);
            throw error;
        } finally {
            await rcon.end();
        }
    }
}

const rconManager = new RconManager(config.rcon);
module.exports = rconManager;