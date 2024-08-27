require('dotenv').config();
const { VK } = require('vk-io');
const readline = require('readline');
const db = require('./db/database');
const roles = require('./roles');
const rconManager = require('./rconManager');

const vk = new VK({
    token: process.env.VK_TOKEN
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const [command, id] = input.split(' ');

    if (command === 'setadmin') {
        db.setUserRole(id, roles.ADMIN, (err) => {
            if (err) {
                console.error('Ошибка при выдаче прав админа:', err);
            } else {
                console.log(`Успешно выданы права ${id}`);
            }
        });
    } else if (command === 'setmoder') {
        db.setUserRole(id, roles.MODER, (err) => {
            if (err) {
                console.error('Ошибка при выдаче прав модера:', err);
            } else {
                console.log(`Успешно выданы права ${id}`);
            }
        });
    } else if (command === 'setfull') {
        db.setUserRole(id, roles.FULL, (err) => {
            if (err) {
                console.error('Ошибка при выдаче полного доступа', err);
            } else {
                console.log(`Успешно выданы права ${id}`);
            }
        });
    } else if (command === 'delrole') {
        db.deleteUserRole(id, (err) => {
            if (err) {
                console.error('Ошибка', err);
            } else {
                console.log(`Роль успешно отобрана у пользователя ${id}`);
            }
        });
    } else {
        console.log('Unknown command');
    }
});

const commandPermissions = {
    [roles.MODER]: ['/ban', '/mute', '/kick', '/pardon', '/unban', '/unmute'],
    [roles.ADMIN]: ['/ban', '/mute', '/kick', '/pardon', '/unban', '/unmute', '/clear', '/kill', '/cp', '/addmoney'],
    [roles.FULL]: ['*'] // Full has no restrictions
};

vk.updates.on('message_new', async (context) => {
    const userId = context.message.from_id.toString();
    const text = context.message.text;

    if (text.startsWith('!права')) {
        db.getUserById(userId, (err, user) => {
            if (err) {
                console.error('Error fetching user:', err);
                return;
            }

            if (!user) {
                context.send('Вы не зарегистрированы в системе. Пожалуйста, обратитесь к администратору для получения роли.');
            } else {
                const availableCommands = commandPermissions[user.role] || [];
                context.send(`Ваша роль: ${user.role}\nДоступные команды: ${availableCommands.join(', ')}`);
            }
        });
        return;
    }

    if (!text.startsWith('/')) {
        context.send('Используйте: /[команда]');
        return;
    }

    db.getUserById(userId, async (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return;
        }

        if (!user) {
            context.send('У вас нет прав.');
            return;
        }

        const userRole = user.role;
        const availableCommands = commandPermissions[userRole];

        if (userRole === roles.FULL || (availableCommands && (availableCommands.includes(text) || availableCommands.includes('*')))) {
            try {
                const result = await rconManager.sendCommand(text);
                context.send(`Команда выполнена: ${result}`);
            } catch (error) {
                context.send(`Ошибка выполнения команды: ${error.message}`);
            }
        } else {
            context.send('У вас нет прав для выполнения этой команды.');
        }
    });
});

vk.updates.start().catch(console.error);