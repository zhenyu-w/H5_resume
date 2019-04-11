// node文件, 用于读取img下的所有图片
let fs = require('fs');
let result = [];


let imgObj = fs.readdirSync('../img/');
imgObj.forEach((item)=>{
    if (/\.(png|jpg|gif)/i.test(item)) {
        result.push('img/' + item);
    }
});

fs.writeFileSync('./result.txt', JSON.stringify(result));
