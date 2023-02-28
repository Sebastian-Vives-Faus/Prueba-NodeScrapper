'use strict';

const express = require('express');

// Constants
const PORT = 8080;

const axios = require('axios');
const cheerio = require('cheerio');

const fetchCategories = async (url, type) => {
    let categories = []
    try {
        await axios.get(url).then(async (response) => {
            const $ = await cheerio.load(response.data);
            await $('div#refinement-Categoría > ul > li').each(async (i, el) => {
                const input = $(el).children('input').attr('id').split('category-');
                const label = $(el).children('label').text() 
                if(type){
                    if(i > 0){
                        categories.push({
                            name: label.replaceAll('\n', ''),
                            url: url+input[1]+'/',
                            subcategories: ''
                        })

                    }
                }
                else {
                    if(i > 1){
                        categories.push({
                            name: label.replaceAll('\n', ''),
                            url: url+input[1]+'/'
                        })
                        
                        
                    }
                }
            /* }).then(() => {return categories}) */
            })
            
            
        })
        
    } catch (error) {
        console.log(error)
        return []
    }
    return categories
}

const getDespensaCategories =  async () => {
    const fs = require('fs');
    const url = 'https://www.soriana.com/despensa/'
    //let categories = [];
    let result = {
        department: 'Despensa',
        url: url,
        categories: []
    }

    try {

        await fetchCategories(url, true).then(async(response) => {
            result.categories = response;
            let fetchSubPromises = result.categories.map(async (category, i) => {
                if(i > 0){
                    return fetchCategories(category.url, false).then((subcategory) => category.subcategories = subcategory);
                }
                
            })
            return Promise.all(fetchSubPromises).then(response => {
                response.forEach((res,i) => {
                    result.categories[i].subcategories = res
                })
                /* fs.writeFile('myjsonfile.json', JSON.stringify(result),  function(err) {
                    if (err) throw err;
                    console.log('complete');
                    console.log(result.categories);
                    }
                ); */
                console.log(result)
                return JSON.stringify(result);
            })
        })
        
        
        
        
    } catch (error) {
        throw error
    }
    return result
}

const getProducts =  async (url) => {
    const fs = require('fs');
    let result = {
        url: url,
        products: []
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
                if((i > 1 && result.products[result.products.length-1].name === names[names.length-1]) || i > 2){
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
                break;
            }
            
        } catch (error) {
            console.log(error)
            break;
        }
    }

    return result;
}


// App
const app = express();
app.get('/pregunta1', async (req, res) => {
   // res.set("Content-Security-Policy", "default-src 'self'");
    const data = await getDespensaCategories()
    .catch(err => console.log(err));
    //console.log(data)
    return res.status(200).json({ data: { data } });
	
});
app.get('/pregunta2', async (req, res) => {
   // res.set("Content-Security-Policy", "default-src 'self'");
    const url = req.query.url
    const data = await getProducts(url)
    .catch(err => console.log(err));
    //console.log(data)
    return res.status(200).json({ data: { data } });
	
});

app.listen(PORT, () => {
  console.log(`Running on localhost:${PORT}`);
});