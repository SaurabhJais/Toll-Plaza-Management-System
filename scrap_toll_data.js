const puppeteer = require('puppeteer');

let get_toll_detail = async (id) => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`https://tis.nhai.gov.in/TollInformation.aspx?TollPlazaID=${id}`);
      const bodyHandle = await page.$('.blogDetailsDec');
      const html = await page.evaluate((body) => body.innerHTML, bodyHandle);
      await browser.close();
      return html
}


module.exports = {get_toll_detail}