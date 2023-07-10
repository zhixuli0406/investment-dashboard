import * as cheerio from 'cheerio';
import axios from 'axios';
import { DateTime } from 'luxon';
import numeral from 'numeral';

export async function fetchTSEListedStocks() {
    const decoder = new TextDecoder("big5");
    let url = 'https://isin.twse.com.tw/isin/class_main.jsp?market=1'

    // 取得 HTML 並轉換為 Big-5 編碼
    const page = await axios.get(url, { responseType: 'arraybuffer' })
        .then(response => decoder.decode(response.data));

    // 使用 cheerio 載入 HTML 以取得表格的 table rows
    const $ = cheerio.load(page);
    const rows = $('.h4 tr');

    // 遍歷每個 table row 並將其轉換成我們想要的資料格式
    const data = rows.slice(1).map((i, el) => {
        const td = $(el).find('td');
        return {
            symbol: td.eq(2).text().trim(),   // 股票代碼
            name: td.eq(3).text().trim(),     // 股票名稱
            market: td.eq(4).text().trim(),   // 市場別
            type: td.eq(5).text().trim(),   // 市場別
            industry: td.eq(6).text().trim(), // 產業別
        };
    }).toArray();

    return data;
}

export async function fetchTSEEquitiesQuotes(date) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');

    const url = `https://www.twse.com.tw/exchangeReport/MI_INDEX`;

    // 取得回應資料
    const responseData = await axios.get(url, {
        params: {
            response: 'json',     // 指定回應格式為 JSON
            date: formattedDate,  // 指定資料日期
            type: 'ALLBUT0999',   // 指定分類項目為全部
        }
    })
        .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return [];

    // 整理回應資料
    const data = responseData.data9.map(row => {
        const [symbol, name, ...values] = row;
        const [
            tradeVolume,  // 成交股數
            transaction,  // 成交筆數
            tradeValue,   // 成交金額
            openPrice,    // 開盤價
            highPrice,    // 最高價
            lowPrice,     // 最低價
            closePrice,   // 收盤價
        ] = values.slice(0, 7).map(value => numeral(value).value());

        // 計算漲跌
        const change = values[7].includes('green')
            ? numeral(values[8]).multiply(-1).value()
            : numeral(values[8]).value();

        // 回推參考價
        const referencePrice = closePrice && numeral(closePrice).subtract(change).value();

        // 計算漲跌幅
        const changePercent = closePrice && +numeral(change).divide(referencePrice).multiply(100).format('0.00');

        return {
            date,
            symbol,
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

export async function fetchTSEMarketTrades(date) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');

    const url = `https://www.twse.com.tw/exchangeReport/FMTQIK`;

    const responseData = await axios.get(url, {
        params: {
            response: 'json',
            date: formattedDate,
        }
    })
        .then(response => (response.data.stat === 'OK') && response.data);

    if (!responseData) return null;

    // 整理回應資料
    const data = responseData.data
        .map(row => {
            // [ 日期, 成交股數, 成交金額, 成交筆數, 發行量加權股價指數, 漲跌點數 ]
            const [date, ...values] = row;

            const [year, month, day] = date.split('/');
            const formattedDate = `${+year + 1911}${month}${day}`;

            // 轉為數字格式
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

export async function fetchTSEMarketBreadth(date) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');

    const url = `https://www.twse.com.tw/exchangeReport/MI_INDEX`;


    const responseData = await axios.get(url, {
        params: {
            response: 'json',     // 指定回應格式為 JSON
            date: formattedDate,  // 指定資料日期
            type: 'MS',           // 指定類別為大盤統計資訊
        }
    })
        .then(response => (response.data.stat === 'OK') && response.data);

    if (!responseData) return null;

    const raw = responseData.data7.map(row => row[2]);
    const [up, limitUp, down, limitDown, unchanged, unmatched, notApplicable] = [
        ...raw[0].replace(')', '').split('('),
        ...raw[1].replace(')', '').split('('),
        ...raw.slice(2),
    ].map(value => numeral(value).value());

    const data = {
        date,
        up,
        limitUp,
        down,
        limitDown,
        unchanged,
        unmatched: unmatched + notApplicable,
    };

    return data;
}

export async function fetchTSEInstInvestorsTrades(date) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');

    const url = `https://www.twse.com.tw/fund/BFI82U`;

    const responseData = await axios.get(url, {
        params: {
            response: 'json',         // 指定回應格式為 JSON
            dayDate: formattedDate,   // 指定資料日期
            type: 'day',              // 指定輸出日報表
        }
    })
        .then(response => (response.data.stat === 'OK') && response.data);

    if (!responseData) return null;

    const raw = responseData.data
        .map(data => data.slice(1)).flat()
        .map(data => numeral(data).value() || +data);

    const [
        dealersProprietaryBuy,            // 自營商(自行買賣)買進金額
        dealersProprietarySell,           // 自營商(自行買賣)賣出金額
        dealersProprietaryNetBuySell,     // 自營商(自行買賣)買賣超
        dealersHedgeBuy,                  // 自營商(避險)買進金額
        dealersHedgeSell,                 // 自營商(避險)賣出金額
        dealersHedgeNetBuySell,           // 自營商(避險)買賣超
        sitcBuy,                          // 投信買進金額
        sitcSell,                         // 投信賣出金額
        sitcNetBuySell,                   // 投信買賣超
        foreignDealersExcludedBuy,        // 外資及陸資(不含外資自營商)買進金額
        foreignDealersExcludedSell,       // 外資及陸資(不含外資自營商)賣出金額
        foreignDealersExcludedNetBuySell, // 外資及陸資(不含外資自營商)買賣超
        foreignDealersBuy,                // 外資自營商買進金額
        foreignDealersSell,               // 外資自營商賣出金額
        foreignDealersNetBuySell,         // 外資自營商買賣超
    ] = raw;

    const foreignInvestorsBuy = foreignDealersExcludedBuy + foreignDealersBuy;

    const foreignInvestorsSell = foreignDealersExcludedSell + foreignDealersSell;

    const foreignInvestorsNetBuySell = foreignDealersExcludedNetBuySell + foreignDealersNetBuySell;

    const dealersBuy = dealersProprietaryBuy + dealersHedgeBuy;

    const dealersSell = dealersProprietarySell + dealersHedgeSell;

    const dealersNetBuySell = dealersProprietaryNetBuySell + dealersHedgeNetBuySell;

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

export async function fetchTSEEquitiesInstInvestorsTrades(date) {
    // 將 `date` 轉換成 `yyyyMMdd` 格式
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');

    const url = `https://www.twse.com.tw/fund/T86`;

    // 取得回應資料
    const responseData = await axios.get(url, {
        params: {
            response: 'json',     // 指定回應格式為 JSON
            date: formattedDate,  // 指定資料日期
            selectType: 'ALLBUT0999',   // 指定分類項目為全部(不含權證、牛熊證、可展延牛熊證)
        }
    })
        .then((response) => (response.data.stat === 'OK' ? response.data : null));

    // 若該日期非交易日或尚無成交資訊則回傳 null
    if (!responseData) return null;

    // 整理回應資料
    const data = responseData.data.reduce((tickers, row) => {
        const [symbol, name, ...values] = row;
        const [
            foreignDealersExcludedBuy,        // 外陸資買進股數(不含外資自營商)
            foreignDealersExcludedSell,       // 外陸資賣出股數(不含外資自營商)
            foreignDealersExcludedNetBuySell, // 外陸資買賣超股數(不含外資自營商)
            foreignDealersBuy,                // 外資自營商買進股數
            foreignDealersSell,               // 外資自營商賣出股數
            foreignDealersNetBuySell,         // 外資自營商買賣超股數
            sitcBuy,                          // 投信買進股數
            sitcSell,                         // 投信賣出股數
            sitcNetBuySell,                   // 投信買賣超股數
            dealersNetBuySell,                // 自營商買賣超股數
            dealersProprietaryBuy,            // 自營商買進股數(自行買賣)
            dealersProprietarySell,           // 自營商賣出股數(自行買賣)
            dealersProprietaryNetBuySell,     // 自營商買賣超股數(自行買賣)
            dealersHedgeBuy,                  // 自營商買進股數(避險)
            dealersHedgeSell,                 // 自營商賣出股數(避險)
            dealersHedgeNetBuySell,           // 自營商買賣超股數(避險)
            instInvestorsNetBuySell,          // 三大法人買賣超股數
        ] = values.map(value => numeral(value).value());

        // 計算外資合計買進股數
        const foreignInvestorsBuy = foreignDealersExcludedBuy + foreignDealersBuy;

        // 外資合計賣出股數
        const foreignInvestorsSell = foreignDealersExcludedSell + foreignDealersSell;

        // 計算外資合計買賣超股數
        const foreignInvestorsNetBuySell = foreignDealersExcludedNetBuySell + foreignDealersNetBuySell;

        // 計算自營商合計買進股數
        const dealersBuy = dealersProprietaryBuy + dealersHedgeBuy;

        // 計算自營商合計賣出股數
        const dealersSell = dealersProprietarySell + dealersHedgeSell;

        const ticker = {
            date,
            symbol,
            name: name.trim(),
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
        return [...tickers, ticker];
    }, []);

    return data;
}