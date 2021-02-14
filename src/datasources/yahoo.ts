import axios, { AxiosResponse } from 'axios';
import { Stock } from '../types/stock';

const yahooUrl = 'https://finance.yahoo.com/quote/';

export const fetchData = async (ticker: string): Promise<Stock> => {
    return await axios.get(yahooUrl + ticker).then( (response: AxiosResponse) => {
        return getStockInfo(response.data, ticker);
    }).catch( error => {
        console.error(`An error has occured while fetching data about the ticker ${ticker}:`, error);
        return {
            ticker
        };
    });
}

const parseValue = (data: string, key: string): any => {
    return data.split(key)[1].split("fmt\":\"")[1].split("\"")[0];
}

const parseName = (data: string, key: string): string => {
    return data.split(key)[1].split(":")[1].split(",")[0].replace(/"/g, '');
}

const parseDate = (data: string, key: string): string => {
    let d = new Date(0);
    let seconds = Number.parseInt(data.split(key)[1].split(":{\"raw\":\"")[0].split(":{\"raw\":")[1].split("\"")[0].split(',')[0]);
    d.setUTCSeconds(seconds);
    return d.toLocaleDateString()
}

const getStockInfo = (body: any, ticker: string): Stock => {
    let stockInfo = body.split(`"${ticker}":{"sourceInterval"`)[1];

    let stock: Stock = {
        ticker,
        name: parseName(stockInfo, 'shortName'),
        price: parseValue(stockInfo, 'regularMarketPrice'),
        change: parseValue(stockInfo, 'regularMarketChange'),
        changePercentage: parseValue(stockInfo, 'regularMarketChangePercent'),
        date: parseDate(stockInfo, 'regularMarketTime'),
        time: parseValue(stockInfo, 'regularMarketTime'),
        dayLow: parseValue(stockInfo, 'regularMarketDayRange').split('-')[0].trim(),
        dayHigh: parseValue(stockInfo, 'regularMarketDayRange').split('-')[1].trim(),
        week52Low: parseValue(stockInfo, 'fiftyTwoWeekRange').split('-')[0].trim(),
        week52High: parseValue(stockInfo, 'fiftyTwoWeekRange').split('-')[1].trim(),
    }

    return stock;
}
