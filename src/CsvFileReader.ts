import fs from "fs";
import { dateStringToDate } from "./utils";
import { SpeechData, SpeechTopic } from "./SpeechData"


export class CsvFileReader {
    data: SpeechData[] = [];

    constructor(public filename: string) { }

    read(): void {
        let strData: string[][];
        strData = fs.readFileSync(`${__dirname}/${this.filename}`, { encoding: "utf-8" })
                    .split("\n")
                    .map((line: string): string[] => {
                        return line.split(",");
                    });
        strData.shift();
        strData.pop();
        //console.log(this.data);
        this.data = strData.map((row: string[]): SpeechData => {
                        return [
                            row[0],
                            row[1] as SpeechTopic,
                            dateStringToDate(row[2]),
                            parseInt(row[3])
                        ]
                    });
    }
}