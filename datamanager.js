const dataserarch = require('./datasearch');
const connection = require('./mysqlConnection');
const cron = require('node-cron');

var resultsDatas = [];

exports.getResultsData = () => {

    resultsDatas.sort(function(a,b) {
        return (a.date > b.date ? 1 : -1);
    });

    var results = [["日付", "感染者数", "増加人数"]];

    for(let i in resultsDatas) {
        if (i > 1 && resultsDatas[i].date != resultsDatas[i-1].date) {
            results.push([resultsDatas[i].date, Number(resultsDatas[i].num), Number(resultsDatas[i].num) - Number(resultsDatas[i-1].num)]);
        }
    }
    console.log(results);
    return results;
};

function updateLatestData() {

    dataserarch.getResultsURLs(function(res){

        console.log(res);

        if (res.length > resultsDatas.length) {
            for(let i = resultsDatas.length; i < res.length; i++) {
                connection.addData(res[i]);
            }
        }
        resultsDatas = res;
    })
}

dataManagerInit = async function() {

    const dbData = await connection.getData();

    console.log(dbData);
    dbData.forEach(element => {
        resultsDatas.push({"date" : element.created_date, 
                          "num"  : element.Total_num, 
                          "numByday" : element.Numbyday});
    });
    console.log(resultsDatas);

    updateLatestData();

    cron.schedule('0 0 */3 * * *', () => updateLatestData());

}();
