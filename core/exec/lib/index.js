'use strict';

const log = require('@zhang-cli-dev/log')
const Package = require('@zhang-cli-dev/package')
const path = require('path')

const SETTINGS = {
  init: 'zhanghang666'
}

let pkg 

const CACHE_DIR = 'dependencies'

async function exec() {   
    let storeDir = ''
    let targetPath = process.env.CLI_TARGET_PATH
    const homePath = process.env.CLI_HOME_PATH
    log.verbose('targetPath',targetPath)
    log.verbose('homePath',homePath)
    
    const cmdObj = arguments[arguments.length - 1]
    const cmdName = cmdObj.name()
    const packageName = SETTINGS[cmdName]
    const packageVersion = 'latest'
    console.log('cmdName',cmdName)
    console.log('packageName',packageName)
    if(!targetPath){
      targetPath = path.resolve(homePath,CACHE_DIR)
      storeDir = path.resolve(targetPath,'node_modules')

      log.verbose('targetPath',targetPath)
      log.verbose('storeDir',storeDir)

      pkg = new Package({
        targetPath,
        packageName,
        packageVersion,
        storeDir
      })

      if(pkg.exist()){
        //更新package
      }else{
        //安装package
        await pkg.install()
      }

    }else{
      pkg = new Package({
        targetPath,
        packageName,
        packageVersion
      })
    }
    const rootFile = pkg.getRootFilePath()
    console.log(rootFile)
    if(rootFile){
      const {init} = require(rootFile)
      init.apply(null,arguments)
    }
    
}

module.exports = {
  exec
};
