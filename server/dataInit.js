import { MongoClient } from 'mongodb'
import { fetchListedStocks, fetchTSEEquitiesQuotes, fetchTSEMarketTrades, fetchTSEMarketBreadth, fetchTSEInstInvestorsTrades,fetchTSEEquitiesInstInvestorsTrades } from './TwseScraperService.js';
import { fetchOTCEquitiesQuotes, fetchOTCMarketTrades, fetchOTCMarketBreadth, fetchOTCInstInvestorsTrades,fetchEquitiesInstInvestorsTrades } from './TpexScraperService.js';
import moment from 'moment';

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function main() {
    // Use connect method to connect to the server
    const db = client.db('stock');
    const historicalDB = client.db('historical');
    const InstInvestorsTradesDB = client.db('InstInvestorsTrades');
    const collection = db.collection('stockList');
    const tseCollection = db.collection('tseMarket');
    const otcCollection = db.collection('otcMarket');

    // let data = collection.find();
    // for await (const item of data) {
    //     if (item.candles) {
    //         let col = historicalDB.collection(`${item.symbol}`)
    //         col.createIndex({ date: 1 }, { unique: true });
    //         for await (const candles of item.candles){
    //             let date = await col.find({date:candles.date}).toArray()
    //             if(date.length === 0)
    //                 await col.insertOne(candles)
    //         }
    //     }
    // }
    // await collection.drop();
    // await collection.createIndex({ symbol: 1 }, { unique: true });
    // await collection.insertMany(await fetchListedStocks({market:'TSE'}));
    // await collection.insertMany(await fetchListedStocks({market:'OTC'}));

    let nowDate = moment('2022-09-05').format('YYYYMMDD');
    let tenYearsAgo = moment('2013-06-30').format('YYYYMMDD');

    // while (nowDate !== tenYearsAgo) {
    //     console.log(nowDate)
    //     const TSEInstInvestorsTrades = await fetchTSEInstInvestorsTrades(nowDate)
    //     const OTCInstInvestorsTrades = await fetchOTCInstInvestorsTrades(nowDate)
    //     if(TSEInstInvestorsTrades) await TSECollection.insertOne(TSEInstInvestorsTrades);
    //     if(OTCInstInvestorsTrades) await OTCCollection.insertOne(OTCInstInvestorsTrades);
    //     console.log(nowDate + ' done!')
    //     nowDate = moment(nowDate).subtract(1, 'days').format('YYYYMMDD');
    // }

    //while (nowDate !== tenYearsAgo) {
    //    console.log(nowDate)
    //    const TSEMarketTrades = await fetchTSEMarketTrades(nowDate)
    //    await sleep(6000);
    //    const TSEMarketBreadth = await fetchTSEMarketBreadth(nowDate)
    //    await sleep(6000);
    //    const OTCMarketTrades = await fetchOTCMarketTrades(nowDate)
    //    await sleep(6000);
    //    const OTCMarketBreadth = await fetchOTCMarketBreadth(nowDate)
    //    await sleep(6000);
    //    if (TSEMarketTrades && TSEMarketBreadth) {
    //        let TSE = { ...TSEMarketTrades, ...TSEMarketBreadth };
    //        await tseCollection.insertOne(TSE);
    //    }
    //    if (OTCMarketTrades && OTCMarketBreadth) {
    //        let OTC = { ...OTCMarketTrades, ...OTCMarketBreadth };
    //        await otcCollection.insertOne(OTC);
    //    }
    //    console.log(nowDate + ' done!')
    //    nowDate = moment(nowDate).subtract(1, 'days').format('YYYYMMDD');
    //}

    while (nowDate !== tenYearsAgo) {
        console.log(nowDate)
        const TSEQuotes = await fetchTSEEquitiesInstInvestorsTrades(nowDate)
        const OTCQuotes = await fetchEquitiesInstInvestorsTrades(nowDate)
        if(TSEQuotes&&OTCQuotes){
            for (let i = 0; i < TSEQuotes.length; i++) {
                let col = InstInvestorsTradesDB.collection(`${TSEQuotes[i].symbol}`)
                col.createIndex({ date: 1 }, { unique: true });
                let date = await col.find({ date: TSEQuotes[i].date }).toArray()
                if (date.length === 0)
                    await col.insertOne(TSEQuotes[i])
            }
            for (let i = 0; i < OTCQuotes.length; i++) {
                let col = InstInvestorsTradesDB.collection(`${OTCQuotes[i].symbol}`)
                col.createIndex({ date: 1 }, { unique: true });
                let date = await col.find({ date: OTCQuotes[i].date }).toArray()
                if (date.length === 0)
                    await col.insertOne(OTCQuotes[i])
            }
        }
        console.log(nowDate + ' done!')
        nowDate = moment(nowDate).subtract(1, 'days').format('YYYYMMDD');
    }
    await client.close();
    return 'done.';
}

main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());