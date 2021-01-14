'use strict';

const npminstall = require('npminstall')
const pkgDir = require('pkg-dir').sync
const path = require('path')
const pathExists = require('path-exists').sync
const fse = require('fs-extra')

const {formatPath} = require('@zhang-cli-dev/format-path')
const {isObject} = require('@zhang-cli-dev/utils')
const {getDefaultRegistry,getNpmLatestVersion} = require('@zhang-cli-dev/get-npm-info')


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
    //package的缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/','_')
  }

  /**
   * @description 判断当前package是否存在
   */
  async exist(){
    if(this.storeDir){
      await this.prepare()
      console.log('this.cacheFilePath：',this.cacheFilePath)
      return pathExists(this.cacheFilePath)
    }else{
      return pathExists(this.targetPath)
    }
  }

  async prepare(){
    if(this.storeDir && !pathExists(this.storeDir)){
      fse.mkdirpSync(this.storeDir)
    }

    if(this.packageVersion === 'latest'){
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
    console.log(this.packageVersion)
  }

  get cacheFilePath(){
    return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion){
    return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  /**
   * @description 安装package
   */
  async install(){
    await this.prepare()
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
  async update(){
    await this.prepare()
    //1.获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    //2.查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    //3.如果不存在，就安装最新版本
    if(!pathExists(latestFilePath)){
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          { name: this.packageName, version: latestPackageVersion }
        ]
      })
      this.packageVersion = latestPackageVersion
    }
  }

  /**
   * @description 获取入口文件路径
   */
  getRootFilePath(){
    function _getRootPath(targetPath){
      //获取package.json所在目录
      const dir = pkgDir(targetPath)
      if(dir){
        //读取package.json
        const pkgFile = require(path.resolve(dir,'package.json'))
        //寻找main/lib
        console.log('pkgFile.main：',pkgFile.main)
        if(pkgFile && pkgFile.main){
          return formatPath(path.resolve(dir, pkgFile.main))
        }
        //路径兼容
      }
        return null
     }

     if(this.storeDir){
       return _getRootPath(this.cacheFilePath)
     }else{
       return _getRootPath(this.targetPath)
     }


  }

  
}

module.exports = Package;
