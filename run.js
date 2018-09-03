/**
 * ヤフオクcsv全部落とすくん
 * 
 * .env file
 *  BIZ_ID=""
 *  BIZ_PASS=""
 *  Y_ID=""
 *  Y_PASS=""
 */
const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = (await browser.pages())[0];

    await page.goto('https://login.yahoo.co.jp');
    await page.type('#username', process.env.Y_ID);
    await page.waitFor(1000);
    await page.click('#btnNext');
    await page.waitFor(1000);
    await page.type('#passwd', process.env.Y_PASS);
    await page.waitFor(1000);
    await page.click('#btnSubmit');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 })
        .catch((e) => console.error(e));


    await page.goto('https://onavi.auctions.yahoo.co.jp/onavi/show/storelist?select=selling&page=1&op=4&od=1&rpp=100');
    await page.type('#user_name', process.env.BIZ_ID);
    await page.type('#password', process.env.BIZ_PASS);
    await page.waitFor(500);
    await page.click('[type=submit]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 })
        .catch((e) => console.error(e));

    //商品データ全DL Script

    let page_no = 1;
    const selling_url = "https://onavi.auctions.yahoo.co.jp/onavi/show/storelist?select=selling&op=4&od=1&rpp=100";

    //ダウンロードの保存先書き換え
    await page._client.send('Page.setDownloadBehavior',
        { behavior: 'allow', downloadPath: './downloads' });

    while (true) {
        //一覧画面移動
        page.goto(`${selling_url}&page=${page_no}`);
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 3000 })
            .catch((e) => console.error(e));

        //ダウンロードができるかどうかチェック、無理ならbreak
        if (!(await page.$('#upperAllOn').catch(() => false))) {
            break;
        }

        await page.click('#upperAllOn');
        await page.click('[value="ダウンロード"]');
        // await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 })
        // .catch((e) => console.error(e));
        await page.waitFor(1000);
        page_no++;
    }

    await browser.close();
})();