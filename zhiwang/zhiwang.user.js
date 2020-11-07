const my_css = GM_getResourceText("IMPORTED_CSS");
// const my_html = GM_getResourceText("IMPORTED_HTML");
GM_addStyle(my_css);

const removeList = () => {
  let xgaoListDom = document.body.querySelector('#item-list-container')
  xgaoListDom.parentElement.removeChild(xgaoListDom)
}

const load = (height) => {
  let linkList = document.querySelectorAll('.result-table-list a[target="online_open"]')
  let hrefList = []
  linkList.forEach(link => {
    hrefList.push(link.href)
  })
  console.log(hrefList)
  const listDom = hrefList.map(href => {
    return `<li class="item-line"><a href="${href}">打开</a><iframe class="${height}" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" src="${href}" width="100%" height="600"></iframe></li>`
  })
  $(document.body).append(`<div id="item-list-container"><button id="xgao-close">Close</button><ul id="item-list">${listDom.join('')}</ul></div>`)
  document.body.querySelector('#xgao-close').addEventListener('click', removeList)
}

const attachButton = ()  => {
  $(document.body).append(`
<div id='xgao-toolbar'>
  <button id="xgao-load">Load</button>
  <button id="xgao-load-high">Load High</button>
</div>
  `)
  document.body.querySelector('#xgao-load').addEventListener('click', () => {
    load('short')
  })
  document.body.querySelector('#xgao-load-high').addEventListener('click', () => {
    load('high')
  })
}

window.onload = () => {
  attachButton()
}