import axios from 'axios';
import inquirer from 'inquirer';
import  * as database from './db.js';

// Fetches the user data from the GitHub API
export async function fetchUserData(){
    const answers = await inquirer.prompt({
        name:'fetchUserData',
        type:'input',
        message:'Enter github username:',
        default(){
            return 'no username';
        }
    });
    let userData = async (user:object)=>{
        try {
            let userObj = await axios.get(`https://api.github.com/users/${user}`);
            let userRepos = await axios.get(userObj.data.repos_url);
            userObj.data.repos = userRepos.data;
            database.saveUserData(userObj.data);
            return userObj.data;
        } catch (error) {
            return 'no user found';
        }
    } 
    
    let user = await userData(answers.fetchUserData);
    console.log(user);
    return user;
}

// List all users
export async function listUsers(){
    let users = await database.listUsers();
    let choices = [];
    for(let i = 0; i < users.length; i++){
        if (users[i].name === null){users[i].name = users[i].username} 
        choices.push(`${users[i].id}: ${users[i].name} `);
    }
    choices.push('Back to main menu');
    const answers = await inquirer.prompt({
        name:'listUsers',
        type:'list',
        message:'Select user to view:',
        choices: choices,
    });
    if(answers.listUsers !== 'Back to main menu'){
        let repos = await database.listRepos(answers.listUsers.split(':')[0]);
        console.log(repos);
       
    }
}

// Query users
export async function queryUsers(){
    const answers = await inquirer.prompt({
        name:'queryUsers',
        type:'list',
        message:'Search by:',
        choices: ['username','name','location','language'],
    });
    const queryAnswers = await inquirer.prompt({
        name:'query',
        type:'input',
        message:`Search ${answers.queryUsers}:`,
        default(){
            return 'no query';
        }
    });
    let users = await database.queryUsers(answers.queryUsers,queryAnswers.query);
   
    
    console.log(users);
}

