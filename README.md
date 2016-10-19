## Example

> example.js
```js
import path from 'path'
import fe from './src'

fe(path.resolve(__dirname, './fes/test.fe'))
```

## .fe file

> fes/test.fe

``` html
<config>
  basePath: ../out
</config>

<!-- test.vue -->
<!-- 
  handle: w/write d/del m/merge
-->
<file path="src/views/test.vue" handle="w">
  <template>
    <div id="editor">
      <textarea :value="input" @input="update"></textarea>
      <div v-html="compiledMarkdown"></div>
    </div>
  </template>
</file>

<!-- test.js -->
<file path="src/test.js" handle="w">
  new Vue({
    el: '#editor',
    data: {
      input: '# hello'
    },
    computed: {
      compiledMarkdown: function () {
        return marked(this.input, { sanitize: true })
      }
    },
    methods: {
      update: _.debounce(function (e) {
        this.input = e.target.value
      }, 300)
    }
  })
</file>
```

## out file

> out/src/views/test.vue

``` html
<template>
  <div id="editor">
    <textarea :value="input" @input="update"></textarea>
    <div v-html="compiledMarkdown"></div>
  </div>
</template>
```

> out/src/test.js

```js
new Vue({
  el: '#editor',
  data: {
    input: '# hello'
  },
  computed: {
    compiledMarkdown: function () {
      return marked(this.input, { sanitize: true })
    }
  },
  methods: {
    update: _.debounce(function (e) {
      this.input = e.target.value
    }, 300)
  }
})
```