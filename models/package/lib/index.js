'use strict';

const npminstall = require('npminstall')
const pkgDir = require('pkg-dir').sync
const path = require('path')
const {formatPath} = require('@zhang-cli-dev/format-path')
const {isObject} = require('@zhang-cli-dev/utils')
const {getDefaultRegistry} = require('@zhang-cli-dev/get-npm-info')


class Package{ 
  constructor(options){
    if(!options && !isObject(options)){
      throw new Error('Package类的options参数不能为空')
    }

    //package的路径
    this.targetPath = options.targetPath
    //package的存储路径
    this.storeDir = options.storeDir
    //package的name
    this.packageName = options.packageName
    //package的version
    this.packageVersion = options.packageVersion
  }

  /**
   * @description 判断当前package是否存在
   */
  exist(){
 
  }

  /**
   * @description 安装package
   */
  install(){
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    })
  }

  /**
   * @description 更新package
   */
  update(){

  }

  /**
   * @description 获取入口文件路径
   */
  getRootFilePath(){
    //获取package.json所在目录
    const dir = pkgDir(this.targetPath)
    if(dir){
      //读取package.json
      const pkgFile = require(path.resolve(dir,'package.json'))
      //寻找main/lib
      if(pkgFile && pkgFile.main){
        return formatPath(path.resolve(dir, pkgFile.main))
      }
      //路径兼容
    }
    return null
  }
}

module.exports = Package;
