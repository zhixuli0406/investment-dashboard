import { MongoClient } from 'mongodb'

const url = 'mongodb://127.0.0.1:27017';

export const client = new MongoClient(url);

export const stockDB = client.db('stock');

export const historicalDB = client.db('historical');

export const instInvestorsTradesDB = client.db('InstInvestorsTrades');