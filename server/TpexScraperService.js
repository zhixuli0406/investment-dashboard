import * as cheerio from 'cheerio';
import axios from 'axios';
import { DateTime } from 'luxon';
import numeral from 'numeral';

export async function fetchOTCEquitiesQuotes(date) {
    const dt = DateTime.fromISO(date);
    const year = dt.get('year') - 1911;
    const formattedDate = `${year}/${dt.toFormat('MM/dd')}`;

    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_close_quotes/stk_quote_result.php`;

    // 取得回應資料
    const responseData = await axios.get(url, {
        params: {
            l: 'zh-tw',       // 指定語系為正體中文
            d: formattedDate, // 指定資料日期
            o: 'json',        // 指定回應格式為 JSON
        }
    })
        .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return [];

    // 整理回應資料
    const data = responseData.aaData
        .map(row => {
            const [symbol, name, ...values] = row;
            const [
                closePrice,   // 收盤價
                change,       // 漲跌
                openPrice,    // 開盤價
                highPrice,    // 最高價
                lowPrice,     // 最低價
                avgPrice,     // 均價
                tradeVolume,  // 成交股數
                tradeValue,   // 成交金額
                transaction,  // 成交筆數
            ] = values.slice(0, 9).map(value => numeral(value).value());

            // 回推參考價
            const referencePrice = (closePrice && change !== null) && numeral(closePrice).subtract(change).value() || null;

            // 計算漲跌幅
            const changePercent = (closePrice && change !== null) && +numeral(change).divide(referencePrice).multiply(100).format('0.00') || null;

            return {
                date,
                symbol,
                name,
                openPrice,
                highPrice,
                lowPrice,
                closePrice,
                change,
                changePercent,
                tradeVolume,
                tradeValue,
                transaction,
            };
        });

    return data;
}

export async function fetchOTCMarketTrades(date) {
    const dt = DateTime.fromISO(date);
    const year = dt.get('year') - 1911;
    const formattedDate = `${year}/${dt.toFormat('MM')}`;

    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_index/st41_result.php?${query}`;

    const responseData = await axios.get(url, {
        params: {
            l: 'zh-tw',
            d: formattedDate,
            o: 'json',
        }
    })
        .then(response => (response.data.iTotalRecords > 0) && response.data);

    if (!responseData) return null;

    const data = responseData.aaData.map(row => {
        // [ 日期, 成交股數, 金額, 筆數, 櫃買指數, 漲/跌 ]
        const [date, ...values] = row;

        const [year, month, day] = date.split('/');
        const formatted = `${+year + 1911}${month}${day}`;
        const formattedDate = DateTime.fromFormat(formatted, 'yyyyMMdd').toISODate();

        const [tradeVolume, tradeValue, transaction, price, change]
            = values.map(value => numeral(value).value());

        return {
            date: formattedDate,
            tradeVolume,
            tradeValue,
            transaction,
            price,
            change,
        };
    })
        .find(data => data.date === date) || null;

    return data;
}

export async function fetchOTCMarketBreadth(date) {
    // `date` 轉換成 `民國年/MM/dd` 格式
    const dt = DateTime.fromISO(date);
    const year = dt.get('year') - 1911;
    const formattedDate = `${year}/${dt.toFormat('MM/dd')}`;
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/market_highlight/highlight_result.php?${query}`;

    const responseData = await axios.get(url, {
        params: {
            l: 'zh-tw',
            d: formattedDate,
            o: 'json',
        }
    })
        .then(response => (response.data.iTotalRecords > 0) && response.data);

    if (!responseData) return null;

    const { upNum, upStopNum, downNum, downStopNum, noChangeNum, noTradeNum } = responseData;
    const [up, limitUp, down, limitDown, unchanged, unmatched] = [
        upNum, upStopNum, downNum, downStopNum, noChangeNum, noTradeNum
    ].map(value => numeral(value).value());

    const data = {
        date,
        up,
        limitUp,
        down,
        limitDown,
        unchanged,
        unmatched,
    };

    return data;
}

export async function fetchOTCInstInvestorsTrades(date) {
    const dt = DateTime.fromISO(date);
    const year = dt.get('year') - 1911;
    const formattedDate = `${year}/${dt.toFormat('MM/dd')}`;

    const query = new URLSearchParams({
        l: 'zh-tw',         // 指定語系為正體中文
        t: 'D',             // 指定輸出日報表
        d: formattedDate,   // 指定資料日期
        o: 'json',          // 指定回應格式為 JSON
    });
    const url = `https://www.tpex.org.tw/web/stock/3insti/3insti_summary/3itrdsum_result.php?${query}`;


    const responseData = await axios.get(url, {
        params: {
            l: 'zh-tw',
            d: formattedDate,
            o: 'json',
        }
    })
        .then(response => (response.data.iTotalRecords > 0) && response.data);

    if (!responseData) return null;

    // 整理回應資料
    const raw = responseData.aaData
        .map(data => data.slice(1)).flat()
        .map(data => numeral(data).value() || +data);

    const [
        foreignInvestorsBuy,                // 外資及陸資合計買進金額
        foreignInvestorsSell,               // 外資及陸資合計賣出金額
        foreignInvestorsNetBuySell,         // 外資及陸資合計買賣超
        foreignDealersExcludedBuy,          // 外資及陸資(不含外資自營商)買進金額
        foreignDealersExcludedSell,         // 外資及陸資(不含外資自營商)賣出金額
        foreignDealersExcludedNetBuySell,   // 外資及陸資(不含外資自營商)買賣超
        foreignDealersBuy,                  // 外資自營商買進金額
        foreignDealersSell,                 // 外資自營商賣出金額
        foreignDealersNetBuySell,           // 外資自營商買賣超
        sitcBuy,                            // 投信買進金額
        sitcSell,                           // 投信賣出金額
        sitcNetBuySell,                     // 投信買賣超
        dealersBuy,                         // 自營商合計買進金額
        dealersSell,                        // 自營商合計賣出金額
        dealersNetBuySell,                  // 自營商合計買賣超
        dealersProprietaryBuy,              // 自營商(自行買賣)買進金額
        dealersProprietarySell,             // 自營商(自行買賣)賣出金額
        dealersProprietaryNetBuySell,       // 自營商(自行買賣)買賣超
        dealersHedgeBuy,                    // 自營商(避險)買進金額
        dealersHedgeSell,                   // 自營商(避險)賣出金額
        dealersHedgeNetBuySell,             // 自營商(避險)買賣超
    ] = raw;

    return {
        date,
        foreignDealersExcludedBuy,
        foreignDealersExcludedSell,
        foreignDealersExcludedNetBuySell,
        foreignDealersBuy,
        foreignDealersSell,
        foreignDealersNetBuySell,
        foreignInvestorsBuy,
        foreignInvestorsSell,
        foreignInvestorsNetBuySell,
        sitcBuy,
        sitcSell,
        sitcNetBuySell,
        dealersProprietaryBuy,
        dealersProprietarySell,
        dealersProprietaryNetBuySell,
        dealersHedgeBuy,
        dealersHedgeSell,
        dealersHedgeNetBuySell,
        dealersBuy,
        dealersSell,
        dealersNetBuySell,
    };
}