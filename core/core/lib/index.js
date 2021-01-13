'use strict';

const pkg = require('../package.json')
const semver = require('semver')
const constant = require('./const')
const colors = require('colors')
const rootCheck = require('root-check')
const userHome = require('user-home')
const pathExists = require('path-exists').sync
const minimist = require('minimist')
const dotenv = require('dotenv')
const path = require('path')
const commander = require('commander')
const program = new commander.Command()

const { getrSemverVersion } = require('@zhang-cli-dev/get-npm-info')
const log = require('@zhang-cli-dev/log');
const { init } = require('@zhang-cli-dev/init')
const { exec } = require('@zhang-cli-dev/exec')

let config

async function core() {
  try {
   
    await prepare()
    //注册命令
    registerCommand()



  } catch (e) {
    log.error(e.message)
  }
}

/**
 * @description 注册命令
 */
function registerCommand(){
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式',false)
    .option('-tp, --targetPath <targetPath>','是否指定本地调试文件路径','')
    // .option('-e, --envName <envName>', '获取环境变量')
  
  program
    .command('init [projectName]')  
    .option('-f, --force','是否强制初始化项目')
    .action(exec)

  program.on('option:debug',function(){
    process.env.LOG_LEVEL = program.debug ? 'vebose' : 'info'
    log.level = process.env.LOG_LEVEL
    log.verbose('debug', 'cli debug---')
  }) 
  
  program.on('option:targetPath',function(){
    process.env.CLI_TARGET_PATH = program.targetPath
  }) 

  program.on('command:*',function(obj){
    const availableCommand = program.commands.map(cmd => cmd.name())
    console.log(colors.red(`无效的命令：${obj[0]}`))
    if(availableCommand.length > 0){
      console.log(colors.red(`可用的命令：${availableCommand.join(',')}`))
    }
  })
  
  program.parse(process.argv)

  if(program.args &&  program.args.length < 1){
    program.outputHelp()
  }
}

async function prepare(){
   //检查脚手架版本号
   checkPkgVersion()
   //检查node版本号
   checkNodeVersion()
   //检查root
   checkRoot()
   //检查用户主目录
   checkUserHome()
   //获取环境变量
   checkEnv()
   //检查版本号是否最新
   await checkGlobalUpdate()
}

/**
 * @description 检查版本号是否最新
 */
async function checkGlobalUpdate() {
  const currentVersion = pkg.version
  const npmName = pkg.name

  const lastVersion = await getrSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn('更新提示：', colors.yellow(`请手动更新 ${npmName}, 当前版本 ${currentVersion}, 最新版本 ${lastVersion}
    更新命令：npm install -g ${npmName}`))
  }
}




/**
 * @description 检查环境变量
 */
function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')

  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  cliConfig['cliHome'] = process.env.CLI_HOME ?
    path.join(userHome, process.env.CLI_HOME) : path.join(userHome, constant.DEFAULT_CLI_HOME)

  process.env.CLI_HOME_PATH = cliConfig['cliHome']
}


/**
 * @description 检查用户主目录
 */
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red('当前用户主目录不存在'))
  }
}

/**
 * @description 检查root
 */
function checkRoot() {
  rootCheck()
}


/**
* @description 检查node版本号
*/
function checkNodeVersion() {
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION
  const currentVersion = process.version
  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`zh-cli-dev需要安装${lowestNodeVersion}以上版本的node.js`))
  }
}

/**
 * @description 检查脚手架版本号
 */
function checkPkgVersion() {
  // log.info('cli', pkg.version)
}







module.exports = {
  core
}