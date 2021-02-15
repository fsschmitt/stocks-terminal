import { ResponseType } from "./src/types/responseTypes";
import * as stockService from './src/datasources/yahoo';
import { buildResponse } from "./src/utils/responseBuilder";

const args = process.argv.slice(2);

if(args.length === 0) {
    const express = require('express');
    const routes = require('./src/routes');
    const app = express();
    const port = process.env.PORT || 80;
    routes(app);
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}


const results = args.map(ticker => stockService.fetchData(ticker));
Promise.all(results).then(stocks => {
    console.log(buildResponse(stocks, ResponseType.text));
});
