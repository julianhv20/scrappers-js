const puppeteer = require('puppeteer');

const randomUserAgent = require('random-useragent');
const { get } = require('request');

let iphoneList = [];
let count = 0;
let browser = null;
let page = null;

// Almacenar la información en un fichero CSV
function saveInCSV(arrayToCSV,path) {
  const otocsv = require('objects-to-csv');
  const transformed = new otocsv(arrayToCSV);
  try {
    transformed.toDisk(path);
    return true;
  } catch(e) {
    return false;
  }
  
}

const init = async (url = false) => {

    const urlMain = 'https://listado.mercadolibre.com.co/iphone#D[A:Iphone]'
    console.log('Vuelta numero -->', count);
    console.log('URL -->', url);

    if(url === false) {
        browser = await puppeteer.launch({headless: false});
        page = await browser.newPage();
        const header = randomUserAgent.getRandom((ua) => {
            return ua.browserName === 'Firefox'
        });
        await page.setUserAgent(header);
        await page.setViewport({ width: 1920, height: 1080 })
    }

    if (count > 5) {
        await browser.close();
    } else {
        
        
        await page.goto((url) ? url : urlMain);
        await page.screenshot({ path: 'example.png' })

        await page.waitForSelector('.ui-search-results')

        const listPagination = await page.$('.andes-pagination__button--next a')
        const getPagination = await page.evaluate(listPagination => listPagination.getAttribute('href'), listPagination)


        const itemsList = await page.$$('.ui-search-layout__item')
        for (const item of itemsList) {
            const price = await item.$('.price-tag-fraction')
            const getPrice = await page.evaluate(price => price.textContent, price)
            const name = await item.$('.ui-search-item__title')
            const getName = await page.evaluate(name => name.textContent, name)
            const image = await item.$('.ui-search-result-image__element')
            const getImage = await page.evaluate(image => image.getAttribute('src'), image)

            const data = {
                name: getName,
                price: getPrice,
                image: getImage
            }

            iphoneList.push(data)
        }
        
        saveInCSV(iphoneList, 'iphone.csv')
        count++;
        init(getPagination)
    }


    /* let nextPage = null
    
    for (const pagination of listPagination) {
        const getPagination = await pagination.getProperty('href')
        if (getPagination['_remoteObject'].hasOwnProperty('value')) {
            nextPage = (getPagination['_remoteObject']['value'])
        }
    } */

    

}


init()
