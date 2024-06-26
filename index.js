const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify','https://www.googleapis.com/auth/gmail.metadata'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

//authorization using google oauth
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

//checking if user is authorized and then fetching emails

const Queue=require('bullmq').Queue;

const emailQueue = new Queue('emailQueue');

async function init(data){
    const res=await emailQueue.add('emailQueue', data);
    console.log('Email added to the queue->',res.id);
}


//other
async function listThreads(auth){
    const gmail = google.gmail({version: 'v1',auth});
    const res=await gmail.users.threads.list({
        userId: 'me',
        q: 'is:unread',
        });
    const threads = res.data.threads;
    if (!threads || threads.length === 0) {
        console.log('No threads found.');
        return;
    }
    threads.forEach((thread) => {
        init(thread.snippet);
    });
  }

authorize().then(listThreads).catch(console.error);