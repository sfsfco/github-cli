import pgPromise from 'pg-promise';
import  * as conf from './config.js';

const pgp = pgPromise({});
const config = conf.conf();

// Connect to the database
async function connect() : Promise<any> {
    try {
        conf.conf();
        const db = await pgp(`pstgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`);
        console.log('Database Connected');
        return db;
    } catch (err) {
        console.log(err);
    }
}

// Initialize the database
async function dataInit(db: any) {
    let res = await db.any(`CREATE TABLE IF NOT EXISTS users
    (
        id serial PRIMARY KEY,
        user_id integer NULL,
        username varchar(255) NULL,
        repos_url varchar(255) NULL,
        name varchar(255) NULL,
        company varchar(255) NULL,
        location varchar(255) NULL,
        email varchar(255) NULL,
        bio varchar(255) NULL,
        public_repos integer NULL,
        followers integer NULL,
        following integer NULL,
        created_at timestamp NULL,
        updated_at timestamp NULL,
        user_created_at timestamp NULL,
        user_updated_at timestamp NULL
    );
    CREATE TABLE IF NOT EXISTS repos
    (
        id serial PRIMARY KEY,
        user_id integer NULL,
        name varchar(255) NULL,
        description text NULL,
        language varchar(255) NULL,
        created_at timestamp NULL,
        updated_at timestamp NULL,
        repo_created_at timestamp NULL,
        repo_updated_at timestamp NULL
    );

    `);
    console.log('Database Initialized');
}
const db:any = await connect();
await dataInit(db);

// Save user data to the database
export async function saveUserData(user: any) {
    let userExists = await db.any(`SELECT * FROM users WHERE user_id = ${user.id}`);
    if(userExists.length === 0){
        let userId = await db.one(`INSERT INTO users (user_id, username, repos_url, name, company, location, email, bio, public_repos, followers, following, created_at, updated_at, user_created_at, user_updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`, [user.id, user.login, user.repos_url, user.name, user.company, user.location, user.email, user.bio, user.public_repos, user.followers, user.following, user.created_at, user.updated_at, user.created_at, user.updated_at]);
        let userRepos = user.repos;
        for(let i = 0; i < userRepos.length; i++){
            let repoId = await db.one(`INSERT INTO repos (user_id, name, description, language, created_at, updated_at, repo_created_at, repo_updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [userId.id, userRepos[i].name, userRepos[i].description, userRepos[i].language, userRepos[i].created_at, userRepos[i].updated_at, userRepos[i].created_at, userRepos[i].updated_at]);
        }
    }else{
        await db.any(`DELETE FROM repos WHERE user_id = ${userExists[0].id}`);
        let userRepos = user.repos;
        for(let i = 0; i < userRepos.length; i++){
            let repoId = await db.one(`INSERT INTO repos (user_id, name, description, language, created_at, updated_at, repo_created_at, repo_updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [userExists[0].id, userRepos[i].name, userRepos[i].description, userRepos[i].language, userRepos[i].created_at, userRepos[i].updated_at, userRepos[i].created_at, userRepos[i].updated_at]);
        }
    }
    
}

// List users
export async function listUsers(){
    return await db.any(`SELECT * FROM users`);
}

// List users repos
export async function listRepos(userId: number){
    return await db.any(`SELECT name,description,language FROM repos WHERE user_id = ${userId}`);
}

// Query users
export async function queryUsers(searchTerm: string,keyword: string){
    let res;
    keyword = keyword.replace(/[^\w\s]/gi, '');
    if(searchTerm === 'language'){
        res = await db.any(`SELECT users.name as owner,users.username,repos.name as repo_name,repos.description from users left join repos on users.id = repos.user_id WHERE ${searchTerm} LIKE '%${keyword}%'  `);
    }else{
        res = await db.any(`SELECT users.name,users.username,users.location from users WHERE ${searchTerm} LIKE '%${keyword}%'`);
    }
    return res;
    
}