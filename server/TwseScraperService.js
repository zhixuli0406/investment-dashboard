import * as cheerio from 'cheerio';
import axios from 'axios';
import { DateTime } from 'luxon';
import numeral from 'numeral';

export async function fetchListedStocks(options) {
    const decoder = new TextDecoder("big5");
    let url = ''
    if (options?.market === 'TSE') url = 'https://isin.twse.com.tw/isin/class_main.jsp?market=1'
    else if (options?.market === 'OTC') url = 'https://isin.twse.com.tw/isin/class_main.jsp?market=2'

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