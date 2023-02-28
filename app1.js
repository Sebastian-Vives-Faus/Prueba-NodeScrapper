const axios = require('axios');
const cheerio = require('cheerio');


const getProducts =  async (url) => {
    const fs = require('fs');
    let url = 'https://www.soriana.com/despensa/comida-oriental/'
    let result = {
        url: url,
        products: [{name: '', price: ''}]
    }
    let i = 1;
    let breakCondition = false;

    while(i >= 1) {
        
        try {
            let tempUrl = url+'?page='+i
            await axios.get(tempUrl).then((response) => {
                let names = [];
                let prices = []
                const $ = cheerio.load(response.data);
                $('div.product-grid > div > div:nth-child(4)>div>div:nth-child(3)>div:nth-child(1)>a').each(async (ind, el) => {
                    names.push($(el).text())
                })
                if((i > 1 && result.products[result.products.length-1].name === names[names.length-1])){
                    breakCondition = true;
                }
    
                $('div.product-grid>div>div:nth-child(4)>div>div:nth-child(3)>div:nth-child(5)>div>div:nth-child(1)>div>span:nth-child(2)').each(async (ind, el) => {
                    prices.push($(el).text().replaceAll('\n', ''))
                })

                for (let j = 0; j < names.length; j++) {
                    result.products.push({name: names[j], price: prices[j]})
                }
                console.log('Scrapping Page: ', i)
                i++
            })

            if(breakCondition){
                fs.writeFile('myjsonfile1.json', JSON.stringify(result),  function(err) {
                    if (err) throw err;
                    console.log('complete');
                    console.log(result);
                    }
                );
                break;
            }
            
        } catch (error) {
            console.log(error)
            break;
        }
    }
}

getProducts()