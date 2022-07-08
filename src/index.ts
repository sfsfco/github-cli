import inquirer from 'inquirer';

import * as services from './services.js';

// Main menu items
let choices = ['Fetch new user data', 'List all users', 'Query users', 'Exit'];

// Create a main menu
let mainMenu = async () => {
    const answers = await inquirer.prompt({
        name: 'firstQuestion',
        type: 'list',
        message: '=== GitHub API ===',
        choices: choices,
    });
    return answers.firstQuestion;
}

// Exit Cli
let confairmExit = async () => {
    const answers = await inquirer.prompt({
        name: 'confirmExit',
        type: 'confirm',
        message: 'Are You Sure you want to exit?',
    });
    if (answers.confirmExit === true) {
        console.log('Bye ');
        process.exit(0);

    }
    return answers.confirmExit;
}

// Main menu runner
async function main() {
    switch (await mainMenu()) {
        case choices[0]:
            await services.fetchUserData();
            main();
            break;
        case choices[1]:
            await services.listUsers();
            main();
            break;
        case choices[2]:
            await services.queryUsers();
            main();
            break;
        default:
            await confairmExit();
            main();
            break;
    }
}
await main();




