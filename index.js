const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const mainUrl = 'https://www.procyclingstats.com/';
const url = `${mainUrl}rankings.php`; 
const rankingItems = [];
// Almacenar la información en un fichero CSV
function saveInCSV() {
  const otocsv = require('objects-to-csv');
  const transformed = new otocsv(rankingItems);
  try {
    transformed.toDisk('./ranking-uci-pro-tour-riders-2019.csv');
    return true;
  } catch(e) {
    return false;
  }
  
}
requestPromise(url)  
.then(html => {
   ///success!
   const $ = cheerio.load(html);
   const rankingTable = $('.tableCont .basic tbody tr', html);
   //console.log(rankingTable);  
   rankingTable.each((i,el) => {
    // console.log($(el).text());
    const rank = $('td:nth-child(1)', el).text();
    const rider = $('td:nth-child(4)', el).text();
    const team = $('td:nth-child(5)', el).text();
    const points = $('td:nth-child(6)', el).text();
    const url = mainUrl.concat($('td:nth-child(4) a', el).attr("href"));
    console.log(rank, rider, team, points, url);
    rankingItems.push(
      {
        position: rank,
        name: rider,
        team: team,
        totalPoints: points,
        details: url
      }
    )
    
  });
  
  return saveInCSV();
})
.then(data => {
  if (data) {
    console.log('Data save correctly');
  } else {
    console.log('Data NOT save correctly. Please try again later');
  }
})
.catch(error => {
  ///handling error
  console.log(error);
});