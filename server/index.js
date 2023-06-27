import { MongoClient } from 'mongodb'
import { fetchListedStocks, fetchTSEEquitiesQuotes, } from './TwseScraperService.js';
import { fetchOTCEquitiesQuotes } from './TpexScraperService.js';
import moment from 'moment';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'stock';

async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db(dbName);
    const collection = db.collection('stockList');

    // await collection.drop({});

    // const tse = await fetchListedStocks({ market: 'TSE' });
    // await collection.insertMany(tse);

    // const otc = await fetchListedStocks({ market: 'OTC' });
    // await collection.insertMany(otc);

    let nowDate = moment('2023-06-27').format('YYYYMMDD');
    let tenYearsAgo = moment('2006-06-23').format('YYYYMMDD');

    while (nowDate !== tenYearsAgo) {
        console.log(nowDate)
        const TSEQuotes = await fetchTSEEquitiesQuotes(nowDate)
        const OTCQuotes = await fetchOTCEquitiesQuotes(nowDate)
        for (let i = 0; i < TSEQuotes.length; i++) {
            await collection.updateOne({ symbol: TSEQuotes[i].symbol }, { $push: { candles: TSEQuotes[i] } });
        }
        for (let i = 0; i < OTCQuotes.length; i++) {
            await collection.updateOne({ symbol: OTCQuotes[i].symbol }, { $push: { candles: OTCQuotes[i] } });
        }
        console.log(nowDate + ' done!')
        nowDate = moment(nowDate).subtract(1, 'days').format('YYYYMMDD');
    }
    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());