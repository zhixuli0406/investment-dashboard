import { MongoClient } from 'mongodb'
import { fetchListedStocks } from './TwseScraperService.js';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'stock';

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('stockList');

    await collection.drop({});

    const tse = await fetchListedStocks({ market: 'TSE' });
    await collection.insertMany(tse);

    const otc = await fetchListedStocks({ market: 'OTC' });
    await collection.insertMany(otc);

    const findResult = await collection.find({ symbol: '00679B' }).toArray();
    console.log('Found documents =>', findResult);

    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());