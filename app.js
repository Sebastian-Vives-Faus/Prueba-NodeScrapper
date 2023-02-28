const axios = require('axios');
const cheerio = require('cheerio');

const fetchCategories = async (url, type) => {
    let categories = []
    try {
        await axios.get(url).then((response) => {
            const $ = cheerio.load(response.data);
            $('div#refinement-Categoría > ul > li').each(async (i, el) => {
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
            }).then(() => {
                return categories;
            })
        })
        
    } catch (error) {
        console.log(error)
        return categories
    }
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

        await fetchCategories(url, true).then((response) => {
            result.categories = response;
            let fetchSubPromises = result.categories.map(async (category, i) => {
                if(i > 0){
                    return fetchCategories(category.url, false).then((subcategory) => category.subcategories = subcategory);
                }
                
            })
            Promise.all(fetchSubPromises).then(response => {
                response.forEach((res,i) => {
                    result.categories[i].subcategories = res
                })
                fs.writeFile('myjsonfile.json', JSON.stringify(result),  function(err) {
                    if (err) throw err;
                    console.log('complete');
                    console.log(result.categories);
                    }
                );
            })
        })
        
        
    } catch (error) {
        throw error
    }
}

getDespensaCategories()