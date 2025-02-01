// 기능 실행 관리
window.addEventListener('load', () => {
    observeDOMChanges()
  })
  
  const observeDOMChanges = () => {  
    const parentNode = document.body
  
    const callback = (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(node => {
            if (node.id === "webplayer") {
              gtlMount()
              createScrollDownButton()
              createToTopButton()
              observeFloatBox()
            }
          })
        }
      }
    }
  
    const observer = new MutationObserver(callback)
    observer.observe(parentNode, {
      childList: true,
      subtree: true
    })
  }