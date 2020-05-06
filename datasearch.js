var monthlyURL = ["https://www.mhlw.go.jp/stf/houdou/houdou_list_202002.html",
                  "https://www.mhlw.go.jp/stf/houdou/houdou_list_202003.html",
                  "https://www.mhlw.go.jp/stf/houdou/houdou_list_202004.html",
                  "https://www.mhlw.go.jp/stf/houdou/houdou_list_202005.html"] //ダウンロードURL

const https = require('https'); //モジュール
const client = require('cheerio-httpcli');

var resultsDatas = [];

function Zenkaku2hankaku(str) {
    return str.replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
};
function toDate (str, delim) {
    var arr = str.replace(' ','').split(delim)
    var m = ("00" + arr[0]).slice(-2);
    var d = ("00" + arr[1]).slice(-2);

    return '2020' + "/" + m + "/" + d;
};

function apaptDate(str) {
    return toDate(Zenkaku2hankaku(str.replace('月','/').replace('日','')), '/');
};

var parseAvtiveNumber = function(url, results){
    const p = new Promise((resolve, reject) => {
        client.fetch(url, {}, function(err, $, res) {

            var date = '';
            var activeNum = '';

            $("div[class=m-grid__col1]").each( function(idx) {

                var lines = $(this).text().split( '\n' );
                for ( var i = 0; i < lines.length; i++ ) {
                    // 空行は無視する
                    if ( lines[i] == '' ) {
                        continue;
                    }

                    var result = lines[i].match(/[1-9１-９]{1,2}月[0-9０-９]{1,2}\s?日[）、].*/);
                    if (result!=null){
                        date = apaptDate(result[0].substr(0, result[0].indexOf('日')+1));
                    }

                    var isdata = lines[i].indexOf('国内感染者は');
                    if(isdata !== -1) {
                        var activeText = lines[i].slice(isdata).replace(/[,，]/, '');
                        var result = activeText.match(/\d{2,6}/);
                        activeNum = result[0];
                        if(date != '' && activeNum != '') {
                            results.push({"date": date, 
                                     "num": activeNum});
                            break;
                        }
                    }
                }
            });
            resolve(results);
        });
    });
    return p;
};

var searchClearlyResultsURL = function( url, results){
    const p = new Promise((resolve, reject) => {
        client.fetch(url, {}, function(err, $, res) {
            $("li").each( function(idx) {
                
                var isdata = $(this).text().indexOf('新型コロナウイルスに関連した患者');
                if(isdata !== -1) {
                    var anchor = $(this).find("a").eq(0);
                    results.push({
                        "title" : $(this).text(), 
                        "href"  : anchor.attr("href"), 
                    });
                }
            });
            resolve(results);
        });
    });
    return p;
};

exports.getResultsURLs = (async (fn) => {
    var resultsURLs = [];

    for(let i in monthlyURL) {
        const result = await searchClearlyResultsURL(monthlyURL[i], resultsURLs);
    }
    
    for(let i in resultsURLs) {
        var url = 'https://www.mhlw.go.jp'+resultsURLs[i].href;
        const result = await parseAvtiveNumber(url, resultsDatas);
    }
    //console.log(resultsDatas);
    //var url = 'https://www.mhlw.go.jp'+resultsURLs.pop().href;
    //console.log(url);
    //const result = await parseAvtiveNumber(url);

    resultsDatas.sort(function(a,b) {
        return (a.date > b.date ? 1 : -1);
    });

    for(let i in resultsDatas) {
        if (i == 0) {
            resultsDatas[i].numByday = 0;
        }
        if (i > 0) {
            resultsDatas[i].numByday =  Number(resultsDatas[i].num) - Number(resultsDatas[i-1].num)
        }
    }

    fn(resultsDatas);

});

