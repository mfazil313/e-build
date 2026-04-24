import { Client, Account, Databases, Storage, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('69982e8d002d1ba49951');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { client, ID };
