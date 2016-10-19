import path from 'path'
import yaml from 'yamljs'
import { EventEmitter } from 'events'
import { Parser, TreeSerializer } from 'parse5'

/**
 * 遍历节点的attribute，找到path属性
 * @param  {[type]} fg [description]
 * @return {[type]}    [description]
 */
const parseAttrs = (fg) => {
  const attrs = {}
  if (fg.attrs) {
    let len = fg.attrs.length
    let attr
    while(len--) {
      attr = fg.attrs[len]
      attrs[attr.name] = attr.value
    }
  }
  return attrs
}

// 监听对象，
// compiler.on('output', ...) 交给用户自己完成
const compiler = new EventEmitter()

/**
 * 编译
 * @param  {[type]} content  [description]
 * @param  {[type]} filePath [description]
 * @param  {[type]} options  [description]
 * @return {[type]}          [description]
 */
compiler.compile = (content, filePath, options) => {
  let config = ''
  let file = ''
  let cfg = ''
  let jobs = []

  let _opts = Object.assign({
    encodeHtmlEntities: false
  }, options)

  const parser = new Parser()
  // Serializer和TreeSerializer其实是一个东西，只是为了兼容以后的parse5版本
  const serializer = new TreeSerializer(null, _opts)

  // 把xml格式的文件转换为一颗html树
  const fragment = parser.parseFragment(content)
  fragment.childNodes.forEach((fg) => {
    switch(fg.nodeName) {

      // <config>
      case 'config':
        config = serializer.serialize(fg)
        cfg = yaml.parse(config)
        // console.log('config', path.join(cfg.basePath))
        break

      // <file>
      case 'file':
        file = serializer.serialize(fg)
        const attrs = parseAttrs(fg)
        const { handle, to } = attrs
        // TODO path.isAbsolute
        const outputFile = path.join(cfg.basePath, attrs.path || __dirname)
        if (handle === 'dup' || 'duplicate') {
          attrs.to = attrs.to || `${outputFile}.dup`
        }
        // console.log('file', handle, `${outputFile}`, file)
        jobs.push({
          outputFile,
          to,
          handle,
          file
        })
        break
    }
  })

  compiler.emit('output', jobs)
}

export default compiler


