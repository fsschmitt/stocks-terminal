import { ResponseType } from "../types/responseTypes";
import yaml from 'js-yaml';
import Table from "cli-table3";
import colors from "colors";

const unallowedValues = ['function', 'object'];

export const buildResponse = (responseObj: any[], responseType: ResponseType): any => {
    switch (responseType) {
        case ResponseType.json:
            return responseObj;
        case ResponseType.yaml:
            return yaml.dump(responseObj);
        case ResponseType.table:
            return buildTable(responseObj);
        case ResponseType.text:
            return responseObj.join(' ');
        default:
            return responseObj;
    }
}

const buildHeader = (row: any): string[] => {
    let head: string[] = [];
    Object.keys(row).filter(key => !unallowedValues.includes(typeof row[key])).forEach(key => {
        var tmp = key.replace( /([A-Z])/g, " $1" );
        var headerName = tmp.charAt(0).toUpperCase() + tmp.slice(1);
        head.push(colors.dim(headerName));
    });
    return head;
}

const buildTable = (responseObj: any) => {
    let responseArr = !Array.isArray(responseObj) ? [responseObj] : responseObj;
    let head = buildHeader(responseArr[0]);
    let table = new Table({
        head,
        style: {
            head: []
        },
    });
    responseArr.forEach(obj => {
        let values: string[] = Object.values(obj);
        table.push(values.filter(v => !unallowedValues.includes(typeof v)).map(v => setColor(v)));
    });
    return table.toString();
}

const setColor = (str: string): string => {
    if (String(str).includes('%') && !isNaN(Number(str.split('%')[0]))) {
        return (Number(str.split('%')[0]) > 0.0) ? colors.green(str) : colors.red(str);
    }
    return colors.cyan(str);
}