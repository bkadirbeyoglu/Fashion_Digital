import fs from "fs";


export abstract class CsvFileReader<T> {
    data: T[] = [];

    constructor(public filename: string) { }

    abstract mapRow(row: string[]): T

    abstract prepareStrData(strData: string[][]): string[][]

    read(): void {
        let strData: string[][];
        strData = fs.readFileSync(`${__dirname}/${this.filename}`, { encoding: "utf-8" })
                    .split("\n")
                    .map((line: string): string[] => {
                        return line.split(",");
                    });
        //strData.shift();
        //strData.pop();
        this.prepareStrData(strData);
        //console.log(this.data);
        this.data = strData.map(this.mapRow);
    }
}