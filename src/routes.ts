import { Stock } from "./types/stock";
import { ResponseType } from "./types/responseTypes";
import { Request, Response } from 'express'
import { buildResponse } from "./utils/responseBuilder";
import * as stockService from './datasources/yahoo';

module.exports = (app: any) => {
    app.get('/:tickers', async (req : Request, res : Response) => {
        const responseType = getResponseType(req);
        console.log(`Format type: ${ResponseType[responseType]}`)
        const tickers = req.params.tickers.split(',').map((ticker: string) => ticker.trim());

        const stocks: Stock[] = [];
        for (let i = 0; i < tickers.length; i++) {
            const ticker = tickers[i];
            stocks.push(await stockService.fetchData(ticker));
        }

        let response = buildResponse(stocks, responseType);
        res.send(response);
    });
}

const getResponseType = (req: Request): ResponseType => {
    if (req.query['format'] === "json" || req.is('application/json')) {
        return ResponseType.json;
    }
    else if (req.query['format'] === "yaml" || req.is('application/yaml')) {
        return ResponseType.yaml;
    }
    else if (req.query['format'] === "table" || req.is('application/table')) {
        return ResponseType.table;
    }
    else {
        return ResponseType.text;
    }
}