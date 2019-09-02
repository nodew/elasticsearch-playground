const http = require("http");
const path = require("path");
const fs = require("fs");

const utils = require("./utils");

const ES_CONFIG = {
    host: "127.0.0.1",
    port: 9200
};

const MOCK_USERS = [
    "userA",
    "userB",
    "userC",
    "userD",
    "userE",
    "userF",
    "userG",
    "userH",
    "userI",
    "userG",
    "userK",
];

const TOTAL_TWEET_COUNT = 1000;

let index = 0;

function requestES(method, url, data = "") {
    return new Promise((resolve, reject) => {
        const buffer = typeof(data) === "string" ? data : JSON.stringify(data);
        const options = {
            host: ES_CONFIG.host,
            port: ES_CONFIG.port,
            path: url,
            data,
            method,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": buffer.length,
            }
        }

        let chunks = "";

        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                chunks += chunk;
            });

            res.on('end', () => {
                const resp = JSON.parse(chunks);
                resolve(resp);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(buffer);
        req.end();
    });
}

function createFakeUrl() {
    if (utils.getRandomInt(10) > 8) {
        return "https://" + utils.genRandomWord(20) + ".com/" + utils.genRandomWord(32);
    }
    return "";
}

function createFakeImages() {
    if (utils.getRandomInt(10) > 7) {
        return new Array(utils.getRandomInt(3)).fill(undefined).map(createFakeUrl)
    }
    return [];
}

function genRandomDate() {
    const now = new Date();
    now.setDate(utils.getRandomInt(30));
    now.setHours(utils.getRandomInt(24));
    now.setMinutes(utils.getRandomInt(60));
    return now;
}

function genDateAfter(date) {
    const d = new Date(date.getTime() + utils.getRandomInt(1000000000));
    return d;
}

function createTweet() {
    return {
        user: MOCK_USERS[utils.getRandomInt(MOCK_USERS.length)],
        content: utils.genRandomSentence(3, 20),
        created_at: genRandomDate(),
        images: createFakeImages(),
        referred_links: createFakeUrl(),
        join_type: "tweet"
    }
}

function getIndex(date) {
    const dateStr = date.getFullYear() +
                    utils.paddingZero(date.getMonth() + 1, 2) +
                    utils.paddingZero(date.getDate(), 2);
    return "daily_" + dateStr +"_tweet";
}

function genTweetData() {
    const records = [];
    let tweets = [];
    for (i = 0; i < TOTAL_TWEET_COUNT; i++) {
        let tweet = createTweet();
        const esIndex = getIndex(tweet.created_at);
        index++;
        id = "" + index;
        records.push(JSON.stringify({
            index: {
                _index: esIndex,
                _type: "_doc",
                _id: "" + id,
                routing: "" + id
            }
        }));
        records.push(JSON.stringify(tweet));
        tweet._index = esIndex;
        tweet._id = id;
        tweets.push(tweet);
    }

    records.push("")

    const postData = records.join("\n");

    return requestES("PUT", "/_bulk?pretty&refresh", postData).then(() => tweets);
}

function createTemplate() {
    const tweetTemplate = fs.readFileSync(path.resolve(__dirname, "../templates/tweets.json"), { encoding: "utf8"});
    return requestES("PUT", "/_template/tweet", tweetTemplate);
}

function clearIndices() {
    return requestES("DELETE", "/_all");
}

function genDateAfter(date) {
    return
}

function genLike(tweet) {
    return JSON.stringify({
        user: MOCK_USERS[utils.getRandomInt(MOCK_USERS.length)],
        liked_at: genDateAfter(tweet.created_at),
        join_type: {
            parent: tweet._id,
            name: "likes"
        }
    });
}

function genShare(tweet) {
    return JSON.stringify({
        user: MOCK_USERS[utils.getRandomInt(MOCK_USERS.length)],
        shared_at: genDateAfter(tweet.created_at),
        join_type: {
            parent: tweet._id,
            name: "shares"
        }
    });
}

function genComment(tweet) {
    return JSON.stringify({
        user: MOCK_USERS[utils.getRandomInt(MOCK_USERS.length)],
        created_at: genDateAfter(tweet.created_at),
        join_type: {
            parent: tweet._id,
            name: "comments"
        }
    });
}

function genChildDoc(tweets, generator) {
    let records = [];
    tweets.forEach(tweet => {
        if (utils.getRandomInt(10) > 5) {
            let count = utils.getRandomInt(20);
            for (let i = 0; i < count; i++) {
                index++;
                id = "" + index;
                records.push(JSON.stringify({
                    index: {
                        _index: tweet._index,
                        _type: "_doc",
                        _id: id,
                        routing: tweet._id
                    }
                }));
                records.push(generator(tweet));
            }
        }

    });
    records.push("")
    const postData = records.join("\n");
    return requestES("PUT", "/_bulk?pretty&refresh", postData);
}

(async function main() {
    try {
        await clearIndices();
        await createTemplate();
        const tweets = await genTweetData();
        await genChildDoc(tweets, genComment);
        await genChildDoc(tweets, genLike);
        await genChildDoc(tweets, genShare);
    } catch (error) {
        console.log(error);
    }
})()
