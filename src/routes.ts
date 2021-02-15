import { Stock } from "./types/stock";
import { ResponseType } from "./types/responseTypes";
import { Request, Response } from 'express'
import { buildResponse } from "./utils/responseBuilder";
import * as stockService from './datasources/yahoo';

module.exports = (app: any) => {
    app.get('/:tickers', async (req : Request, res : Response) => {
        const responseType = getResponseType(req);
        const tickers = req.params.tickers.split(',').map((ticker: string) => ticker.trim());

        const stocks: Stock[] = [];
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            console.info(`Fetching data for ticker: ${ticker}...`);
            stocks.push(await stockService.fetchData(ticker));
        }

        let response = buildResponse(stocks, responseType);
        res.send(response);
    });
}

const getResponseType = (req: Request): ResponseType => {
    if (req.query['format'] === "yaml" || req.is('application/yaml')) {
        return ResponseType.yaml;
    }
    else if (req.query['format'] === "table" || req.is('application/table')) {
        return ResponseType.table;
    }
    else if (req.query['format'] === "text" || req.is('application/text')) {
        return ResponseType.text;
    }
    else {
        return ResponseType.json;
    }
}