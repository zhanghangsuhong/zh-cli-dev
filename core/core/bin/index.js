#! /usr/bin/env node


const importLocal = require('import-local')

const {core} = require('../lib')

if(importLocal(__filename)){
    console.log('cli','正在使用本地脚手架')
}else{
    core(process.argv.slice(2))
}