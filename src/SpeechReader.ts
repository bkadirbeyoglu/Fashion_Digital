import { CsvFileReader } from "./CsvFileReader";
import { SpeechData, SpeechTopic } from "./SpeechData";
import { dateStringToDate } from "./utils";

export class SpeechReader extends CsvFileReader<SpeechData> {

    constructor(public filename: string) {
        super(filename);
    }

    mapRow(row: string[]): SpeechData {
        return [
            row[0],
            row[1].trim() as SpeechTopic,
            dateStringToDate(row[2]),
            parseInt(row[3])
        ]
    }

    prepareStrData(strData: string[][]): string[][] {
        strData.shift();
        strData.pop();

        return strData;
    }
}