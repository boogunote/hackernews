let pageIndex = 1

const go = () => {
  pageIndex = parseInt($("#page-index").val())
  if (pageIndex <= 1) return
  getData()
}

const pageUp = () => {
  if (pageIndex <= 1) return
  pageIndex--
  getData()
}

const pageDown = () => {
  pageIndex++
  $("#page-index").val(pageIndex)
  getData()
}

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

const commentTimeoutStrategy = () => {
  if (pageIndex <= 1) {
    return 0
  }
  if (pageIndex <= 10) {
    return 0
  }

  if (pageIndex <= 20) {
    return 1000
  }
}

const getData = async () => {
  let currIndex = pageIndex
  let commentProgress = 0
  $('#comment-progress').text('0')
  $('#item-list').empty()
  let resp = await $.ajax({
    type: 'GET',
    url: `https://news.ycombinator.com/news?p=${pageIndex}`
  })
  let parser = new DOMParser()
  let htmlDoc = parser.parseFromString(resp, 'text/html')
  let itemDomList = htmlDoc.querySelectorAll("table.itemList tr.athing")
  let itemList = []
  itemDomList.forEach(itemDom => {
    let storylinkTag = itemDom.querySelector('a.storylink')
    let scoreTag = htmlDoc.querySelector(`#score_${itemDom.id}`)
    let item = {
      id: itemDom.id,
      title: storylinkTag.textContent,
      url: storylinkTag.href,
      age: scoreTag && scoreTag.nextElementSibling && scoreTag.nextElementSibling.nextElementSibling ? scoreTag.nextElementSibling.nextElementSibling.textContent : null
    }
    itemList.push(item)
  })
  await timeout(pageTimeoutStrategy())
  for (let item of itemList) {
    if (currIndex != pageIndex) break
    await timeout(commentTimeoutStrategy())
    let commentTree
    try {
      commentTree = await getComment(item.id)
    } catch (e) {
      $('#comment-progress').text(`${commentProgress} exception`)
    }
    if (!commentTree) {
      $('#comment-progress').text(`${commentProgress} exception`)
    }
    item.comment = commentTree
    commentProgress++
    $('#comment-progress').text(commentProgress+'')
  }

  for (let item of itemList) {
    $('#item-list').append(`<li class="item-line"><div class="left-side" id="${item.id}"><a href="${item.url}">${item.title}</a><span class="age">${item.age}</span><a class="comment" href="https://news.ycombinator.com/item?id=${item.id}">comments</a>${item.comment}</div><iframe class="right-side" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" src="${item.url}" width="800" height="600"></iframe></li>`)
  }
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

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.onload = () => {
  $("#page-index").val(pageIndex)
  getData()
}