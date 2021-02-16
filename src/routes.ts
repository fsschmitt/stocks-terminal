import { Stock } from "./types/stock";
import { ResponseType } from "./types/responseTypes";
import { Request, Response } from 'express'
import { buildResponse } from "./utils/responseBuilder";
import * as stockService from './datasources/yahoo';

module.exports = (app: any) => {
    app.get('/:tickers', async (req : Request, res : Response) => {
        const responseType = getResponseType(req);
        const tickers = req.params.tickers.split(',').map((ticker: string) => ticker.trim());
        const results = tickers.map(ticker => stockService.fetchData(ticker));
        const stocks: Stock[] = await Promise.all(results);
        let response = buildResponse(stocks, responseType);
        res.send(response + '\n');
    });
}

const getResponseType = (req: Request): ResponseType => {
    if (req.query['format'] === "yaml" || req.is('application/yaml')) {
        return ResponseType.yaml;
    }
    if (req.query['format'] === "text" || req.is('application/text')) {
        return ResponseType.text;
    }
    if (req.query['format'] === "json" || req.is('application/json')) {
        return ResponseType.json;
    }
    return ResponseType.table;
}
