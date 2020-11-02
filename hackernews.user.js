const my_css = GM_getResourceText("IMPORTED_CSS");
const my_html = GM_getResourceText("IMPORTED_HTML");
GM_addStyle(my_css);

let pageIndex = new URL(window.location.href).searchParams.get('p')
pageIndex = pageIndex == null ? 1 : pageIndex

const pageTimeoutStrategy = () => {
  if (pageIndex <= 1) {
    return 0
  }
  if (pageIndex <= 10) {
    return 2000
  }

  if (pageIndex <= 20) {
    return 4000
  }
}

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const commentTimeoutStrategy = () => {
  if (pageIndex <= 1) {
    return 0
  }
  if (pageIndex <= 10) {
    return 0
  }

  if (pageIndex <= 20) {
    return 500
  }
}

const getArticleList = async () => {
  let itemDomList = document.querySelectorAll("table.itemList tr.athing")
  let itemList = []
  itemDomList.forEach(itemDom => {
    let storylinkTag = itemDom.querySelector('a.storylink')
    let scoreTag = document.querySelector(`#score_${itemDom.id}`)
    let item = {
      id: itemDom.id,
      title: storylinkTag.textContent,
      url: storylinkTag.href,
      age: scoreTag && scoreTag.nextElementSibling && scoreTag.nextElementSibling.nextElementSibling ? scoreTag.nextElementSibling.nextElementSibling.textContent : null
    }
    itemList.push(item)
  })

  console.log(itemList)
  return itemList
}

const reloadComment = async event => {
  let commentTree
  try {
    commentTree = await getComment(event.target.id)
  } catch (e) {
  }
  if (commentTree != undefined) {
    $(`#article_${event.target.id} .cover-comment`).empty()
    $(`#article_${event.target.id} .cover-comment`).append(commentTree)
  }
}

const getData = async () => {
  addCoverPage()
  let commentProgress = 0
  $('#comment-progress').text('0')
  let itemList = await getArticleList()
  // itemList = [itemList[0]]
  for (let item of itemList) {
    await timeout(commentTimeoutStrategy())
    let commentTree
    try {
      commentTree = await getComment(item.id)
    } catch (e) {
      $('#comment-progress').text(`${commentProgress} exception`)
    }
    if (commentTree === undefined) {
      $('#comment-progress').text(`${commentProgress} exception`)
      item.comment = `<button class='reload-comment' id="${item.id}">Reload Comment</button>`
    } else {
      item.comment = commentTree
    }
    commentProgress++
    $('#comment-progress').text(commentProgress+'')
  }
  console.log(itemList)
  for (let item of itemList) {
    $('#item-list').append(`<li class="item-line"><div class="left-side" id="article_${item.id}"><a class="item-title" href="${item.url}">${item.title}</a><span class="age">${item.age}</span><a class="comment-link" href="https://news.ycombinator.com/item?id=${item.id}">comments</a><div class="cover-comment">${item.comment}</div></div><iframe class="right-side" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" src="${item.url}" width="800" height="600"></iframe></li>`)
  }
  document.querySelectorAll(".reload-comment").forEach(elem => {
    elem.addEventListener('click',  reloadComment)
  })
}

const addCoverPage = () => {
  $(window.document.head).append(`<meta http-equiv="Content-Security-Policy" content="default-src gap://ready file://* *; style-src 'self' http://* https://* 'unsafe-inline'; script-src 'self' http://* https://* 'unsafe-inline' 'unsafe-eval'">`)
  $(window.document.body).append(my_html)
  let closeCoverDom = $('#close-cover')[0]
  closeCoverDom.addEventListener('click', () => {
    let coverContainer = $('#cover-container')[0]
    coverContainer.parentNode.removeChild(coverContainer)
  })
}

const getComment = async articleId => {
  let resp = await $.ajax({
    type: 'GET',
    url: `https://news.ycombinator.com/item?id=${articleId}`
  })
  let parser = new DOMParser()
  let htmlDoc = parser.parseFromString(resp, 'text/html')
  let commentTreeDom = htmlDoc.querySelector('.comment-tree')
  if (!commentTreeDom) return ''
  let elemList = commentTreeDom.querySelectorAll('.reply')
  elemList.forEach(elem => {
    elem.parentNode.removeChild(elem)
  })
  // let commHeadElemList = commentTreeDom.querySelectorAll('.comhead')
  // commHeadElemList.forEach(elem => {
  //   elem.parentNode.removeChild(elem)
  // })
  return commentTreeDom.outerHTML
}

$(document.body).append('<span style="position: absolute; left: 10px; top: 10px;"><button id="load">Load</button>')
document.querySelector('#load').addEventListener('click', getData)