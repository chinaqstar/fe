import path from 'path'
import fs from 'fs'
import through from 'through'
import async from 'async'
import compiler from './compiler'
import s2 from 'small2'
import MemoryFileSystem from "memory-fs"

const fe = (fePath) => {

  const mfs = new MemoryFileSystem()

  const startTime = new Date().getTime()

  // const filePath = path.resolve(__dirname, fePath)
  const filePath = fePath

  // 流的读写操作
  let stream
  let data = ''

  const writeFile = (data, cb) => {
      // =========================================
      // 1.先去除首尾多余的换行

      // TODO 只检测了\n，在windows中估计要检测\r\n
      let source = data.file.replace(/^\n*|\n*$/,'')
      const indentSpaces = (source.match(/(^\s+)/) || [])[0]

      // 开头至少有一个空格，则每行都进行相应的缩进
      if (indentSpaces) {
        const reg = new RegExp(`^${indentSpaces}`, 'gm')
        source = source.replace(reg, '')
      }

      // =========================================
      // 2.创建文件夹，如果不存在的话
      // const dirPath = path.dirname(data.outputFile)
      // mfs.mkdirpSync(dirPath)
      // mfs.writeFileSync(data.outputFile, source)
      // console.log(fs.readFileSync(data.outputFile))
      // mfs.createReadStream(data.outputFile).pipe(fs.createWriteStream(data.outputFile))
      // return cb()

      // =========================================
      // 2.创建文件夹，如果不存在的话
      const dirPath = path.dirname(data.outputFile)
      s2.mkdirPath(dirPath, (err) => {
        if (err) {
          console.log(`err：${err}`)
          process.exit(1)
        }

        // =========================================
        // 3.写文件

        // 开始写文件，其实核心就这句
        fs.writeFile(data.outputFile, source, (err) => {
          if (err) {
            return cb(err)
          }
          return cb()
        }) // writeFile
      }) // mkdirPath
  }

  const write = (buf) => {
    data += buf
  }

  const output = (datas) => {

    // TODO 暂时先用异步的办法，以后可以改为promise + async/await
    async.each(datas, (data, cb) => {

      if (!path.isAbsolute(data.outputFile)) {
        data.outputFile = path.resolve(fePath, '../', data.outputFile)
      }

      fs.stat(data.outputFile, (err) => {
        if (err && err.code !== 'ENOENT') {
          return cb()
        }

        if (data.handle && (data.handle === 'd' || data.handle === 'del')) {
          if (!err || err.code !== 'ENOENT') {
            // TODO 把目录全删除
            fs.unlinkSync(data.outputFile)
          }
          return cb()
        }

        return writeFile(data, cb)
      })
    }, // (data, cb) => end
    (err) => {
      if(err) {
        return console.log('err:', err)
      }
      console.log('success (!- -)')
      console.log('[end]', `${new Date - startTime}ms`)
    }) // async.each 
  } // output

  const end = () => {
    compiler.on('output', output)
    compiler.compile(data, filePath, (err, result) => {
      if (err) console.log('err', err)
      console.log(result)
      stream.queue(null)
    })
  }

  stream = through(write, end)

  // 从filePath中获取文件流
  const rs = fs.createReadStream(filePath).pipe(stream)
}

export default fe