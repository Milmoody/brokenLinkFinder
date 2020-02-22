const axios = require('axios');
const cheerio = require('cheerio');

const inputUrl = process.argv[2];

// get site data with axios
axios.get(inputUrl).then((response) => {
  // load data into cheerio instance
  const $ = cheerio.load(response.data)
  const urlArr = [];

  let domain = inputUrl;
  domain.replace(/https?:\/\/[^\/]+/i, "");

  // pull link tags from cheerio data, loop over hrefs 
  $('a').attr('href', (i, val) => {
    // if value is defined (link exists)
    if(val && val[0] !== '#'){
      // if value is a direct link, concatenate source url with value
      if(val[0] === '/'){
        val = domain.concat(val);
      }
      urlArr.push(val)
    }
  });

  // create promise array
  const promises = [];

  // loop over urls, creating a new promise for each axios request
  for (let url of urlArr) {
    promises.push(new Promise((resolve, reject) => {
      axios.get(url)
      // on successful response, resolve without url
      .then(response => {
        resolve();
      })
      // on fail, resolve with url
      .catch(err => {
        resolve(url);
      })
    }))
  }

  // once all promises return, filter resolution array for existing elements (only broken links)
  Promise.all(promises)
  .then(resolutionArr => {
    console.log(resolutionArr.filter(element => element)); 
  });

})
.catch(err => console.log(err))




