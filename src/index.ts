import { createServer, IncomingMessage, ServerResponse } from "http";
import url, { UrlWithParsedQuery } from "url";
import fs from "fs";
import { CsvFileReader } from "./CsvFileReader";
import { SpeechData, SpeechTopic } from "./SpeechData";

const PORT: number = 8080;

type Answer = {
    mostSpeechesIn2012: number | null,
    mostSecurity: string,
    leastWordy: string
}


const speeches: SpeechData[] = [];

createServer((req: IncomingMessage, res: ServerResponse) => {
    const urlWithParsedQuery: UrlWithParsedQuery = url.parse(req.url!, true);
    const _url = urlWithParsedQuery.query.url;
    if (urlWithParsedQuery.pathname === "/evaluation" && _url) {
        const promisesDownload: Promise<boolean>[] = [];
        if (Array.isArray(_url)) {
            for (let i = 0; i < _url.length; i++) {
                promisesDownload.push(downloadFile(_url[i], i));
            }
        } else {
            promisesDownload.push(downloadFile(_url, 0));
        }
        Promise.all(promisesDownload)
        .then(results => {
            for (let k = 0; k < results.length; k++) {
                if (results[k] === true) {
                    console.log(`Reading file with index: ${k}`);
                    const reader = new CsvFileReader(`fashion_digital_${k}.csv`);
                    reader.read();
                    speeches.push(...reader.data);
                }
            }
            //console.log(speeches);

            generateAnswerObject();
        });

        res.end("OK");
    }
    else {
        res.statusCode = 404;
        res.end("Page not found.");
    }
}).listen(PORT, () => {
    console.log(`Listening to requests on port ${PORT}`);
});


const generateAnswerObject = () => {
    const answerObj: Answer = {
        mostSpeechesIn2012: null,
        mostSecurity: "",
        leastWordy: ""
    }

    // Answer to the first question: Which politician gave the most speeches in 2013?
    const year = 2012;
    let count = speeches.reduce((acc, cur) => cur[2].getFullYear() === year ? ++acc : acc, 0);
    if (count > 0) {
        answerObj.mostSpeechesIn2012 = count;
    }
    //console.log(answerObj);

    // Answer to the second question: Which politician gave the most speeches on the topic „Internal Security"?
    const filteredSpeeches = speeches.filter(s => s[1] == SpeechTopic.InternalSecurity);
    //console.log(filteredSpeeches);
    let hash = new Map<string, number>();
    for (let i = 0; i < filteredSpeeches.length; i++) {
        let politician: string = filteredSpeeches[i][0];
        if (hash.has(politician)) {
            hash.set(politician, hash.get(politician)! + 1);
        } else {
            hash.set(politician, 1);
        }
    }
    let sortedArrFromHash = Array.from([...hash.entries()]).sort((a, b) => { return b[1] - a[1] });
    //console.log(sortedArrFromHash);
    answerObj.mostSecurity = sortedArrFromHash[0][0];
    console.log(answerObj);

    // Answer to the third question: Which politician used the fewest words (in total)?

}


const downloadFile = (url: string, index: number): Promise<boolean> => {
    //console.log(url, index);
    return new Promise((resolve, reject) => {
        try {
            fetch(url)
            .then(response => response.text())
            .then(respText => {
                fs.writeFile(`${__dirname}/fashion_digital_${index}.csv`, respText, (err: unknown) => {
                    if (err) {
                        if (err instanceof Error) {
                            console.log(err.message);
                        } else {
                             console.log(err);
                        }
                        reject(err);
                    } else {
                        console.log(`File ${index} saved successfully`);
                        resolve(true);
                    }
                });
            })
        }
        catch (err: unknown) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log(err);
            }
            reject(err);
        }
    })
}