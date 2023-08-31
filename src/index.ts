import { createServer, IncomingMessage, ServerResponse } from "http";
import url, { UrlWithParsedQuery } from "url";
import fs from "fs";
import { CsvFileReader } from "./CsvFileReader";
import { SpeechData } from "./SpeechData";

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
    // 1. Which politician gave the most speeches in 2013?
    // 2. Which politician gave the most speeches on the topic „Internal Security"?
    // 3. Which politician used the fewest words (in total)?

    const answerObj: Answer = {
        mostSpeechesIn2012: null,
        mostSecurity: "",
        leastWordy: ""
    }

    // Answering first question...
    const year = 2012;
    let count = speeches.reduce((acc, cur) => cur[2].getFullYear() === year ? ++acc : acc, 0);
    //console.log(count);
    if (count > 0) {
        answerObj.mostSpeechesIn2012 = count;
    }
    console.log(answerObj);
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