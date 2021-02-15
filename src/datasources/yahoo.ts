import axios, { AxiosResponse } from "axios";
import { Stock } from "../types/stock";
import { parse } from "node-html-parser";
import { Parser } from "acorn";
import * as Recast from "recast";
import { writeFile } from "fs/promises";

const yahooUrl = "https://finance.yahoo.com/quote/";

const getStoreJson = (storeScript: any): any => {
  const ast = Parser.parse(storeScript.rawText as string, {
    ecmaVersion: "latest",
    allowAwaitOutsideFunction: false,
  });
  let json;
  Recast.visit(ast, {
    visitObjectExpression: async function (node: any) {
      if (node.parent.value.left?.property.name === "main") {
        json = JSON.parse(Recast.print(node.value).code);

        return false;
      }
      this.traverse(node);
    },
  });

  return json;
};

export const fetchData = async (tickers: string[]): Promise<Stock[]> => {
  const remoteUrl = encodeURI(yahooUrl + tickers.join(","));
  return await axios.get(remoteUrl).then(
    async (response: AxiosResponse) => {
      const html = parse(response.data);

      // Find script that contains store
      const storeScript = [...html.querySelectorAll("script")].find((node) => {
        if (node.rawText.includes("root.App.main")) {
          return node;
        }
      });

      // Parse js to get store value
      const json = getStoreJson(storeScript);
      const stocks: Stock[] = [];
      console.log(JSON.stringify(json.context.dispatcher.stores.StreamDataStore.quoteData));
      tickers.forEach(ticker => {
        const quoteData = json.context.dispatcher.stores.StreamDataStore.quoteData[ticker];
        console.log(JSON.stringify(quoteData));
        stocks.push(getStockInfo(quoteData, ticker));
      });
      // Get ticker from store

      return stocks;
    },
  ).catch((error) => {
    console.error(
      `An error has occured while fetching data about the tickers ${tickers}:`,
      error,
    );
    return [];
  });
};

const parseValue = (data: object, key: string): any => {
  //@ts-ignore
  return data[key].raw;
};

const parseName = (data: object, key: string): string => {
  //@ts-ignore
  return data[key];
};

const parseDate = (data: object, key: string): string => {
  //@ts-ignore
  return new Date(data[key].raw * 1000).toLocaleDateString();
};

const getStockInfo = (quoteData: object, ticker: string): Stock => {
  let stock: Stock = {
    ticker,
    name: parseName(quoteData, "shortName"),
    price: parseValue(quoteData, "regularMarketPrice"),
    change: parseValue(quoteData, "regularMarketChange"),
    changePercentage: parseValue(quoteData, "regularMarketChangePercent"),
    date: parseDate(quoteData, "regularMarketTime"),
    time: parseValue(quoteData, "regularMarketTime"),
    dayLow: parseValue(quoteData, "regularMarketDayRange").split("-")[0].trim(),
    dayHigh: parseValue(quoteData, "regularMarketDayRange").split("-")[1]
      .trim(),
    week52Low: parseValue(quoteData, "fiftyTwoWeekRange").split("-")[0].trim(),
    week52High: parseValue(quoteData, "fiftyTwoWeekRange").split("-")[1].trim(),
  };

  return stock;
};
