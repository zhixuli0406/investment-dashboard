import * as cron from 'node-cron'
import { historicalDB, instInvestorsTradesDB } from './mongoDB.js';
import { fetchTSEEquitiesQuotes, fetchTSEMarketTrades, fetchTSEMarketBreadth, fetchTSEInstInvestorsTrades, fetchTSEEquitiesInstInvestorsTrades } from './TwseScraperService.js';
import { fetchOTCEquitiesQuotes, fetchOTCMarketTrades, fetchOTCMarketBreadth, fetchOTCInstInvestorsTrades, fetchOTCEquitiesInstInvestorsTrades } from './TpexScraperService.js';

const schedule = '30 14 * * *';

export const cronJob = () => {
    const jobQuotes = cron.schedule(schedule, async () => {
        let nowDate = moment().format('YYYYMMDD');
        const TSEQuotes = await fetchTSEEquitiesQuotes(nowDate)
        await sleep(6000);
        const OTCQuotes = await fetchOTCEquitiesQuotes(nowDate)
        await sleep(6000);
        if (TSEQuotes && OTCQuotes) {
            for (let i = 0; i < TSEQuotes.length; i++) {
                let col = historicalDB.collection(`${TSEQuotes[i].symbol}`)
                let date = await col.find({ date: TSEQuotes[i].date }).toArray()
                if (date.length === 0)
                    await col.insertOne(TSEQuotes[i])
            }
            for (let i = 0; i < OTCQuotes.length; i++) {
                let col = historicalDB.collection(`${OTCQuotes[i].symbol}`)
                let date = await col.find({ date: OTCQuotes[i].date }).toArray()
                if (date.length === 0)
                    await col.insertOne(OTCQuotes[i])
            }
        }
    })
    const jobInvestorsTrades = cron.schedule(schedule, async () => {
        const TSEQuotes = await fetchTSEEquitiesInstInvestorsTrades(nowDate)
        await sleep(6000);
        const OTCQuotes = await fetchOTCEquitiesInstInvestorsTrades(nowDate)
        await sleep(6000);
        if (TSEQuotes && OTCQuotes) {
            for (let i = 0; i < TSEQuotes.length; i++) {
                let col = instInvestorsTradesDB.collection(`${TSEQuotes[i].symbol}`)
                col.createIndex({ date: 1 }, { unique: true });
                let date = await col.find({ date: TSEQuotes[i].date }).toArray()
                if (date.length === 0)
                    await col.insertOne(TSEQuotes[i])
            }
            for (let i = 0; i < OTCQuotes.length; i++) {
                let col = instInvestorsTradesDB.collection(`${OTCQuotes[i].symbol}`)
                col.createIndex({ date: 1 }, { unique: true });
                let date = await col.find({ date: OTCQuotes[i].date }).toArray()
                if (date.length === 0)
                    await col.insertOne(OTCQuotes[i])
            }
        }
    })
    const jobMarketTrades = cron.schedule(schedule, async () => {
        const tseCollection = stockDB.collection('tseMarket');
        const otcCollection = stockDB.collection('otcMarket');
        const TSEMarketTrades = await fetchTSEMarketTrades(nowDate)
        await sleep(6000);
        const TSEMarketBreadth = await fetchTSEMarketBreadth(nowDate)
        await sleep(6000);
        const OTCMarketTrades = await fetchOTCMarketTrades(nowDate)
        await sleep(6000);
        const OTCMarketBreadth = await fetchOTCMarketBreadth(nowDate)
        await sleep(6000);
        if (TSEMarketTrades && TSEMarketBreadth) {
            let TSE = { ...TSEMarketTrades, ...TSEMarketBreadth };
            await tseCollection.insertOne(TSE);
        }
        if (OTCMarketTrades && OTCMarketBreadth) {
            let OTC = { ...OTCMarketTrades, ...OTCMarketBreadth };
            await otcCollection.insertOne(OTC);
        }
    })
}





