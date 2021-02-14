export interface Stock {
    ticker: string,
    name?: string,
    price?: number,
    change?: number,
    changePercentage?: number,
    date?: string,
    time?: string,
    dayLow?: number,
    dayHigh?: number,
    week52Low?: number,
    week52High?: number,
}