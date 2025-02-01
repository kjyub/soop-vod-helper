const isScrollUp = (e) => {
  return e.wheelDelta > 0 || e.detail < 0
}

// 현재 활성화 된 타임라인으로 이동하는 스크립트

// 타임라인으로 이동 준비 상태 생성
const startReadyGoTimeline = () => {
  if (gtlState.timelineKeys.length === 0) {
    return
  }

  gtlState.isReadyGoTimeline = true

  createGTLPreperationOverlay()
}

// 타임라인으로 이동 준비 상태 생성
const createGTLPreperationOverlay = () => {
  const overlay = document.createElement('div')
  overlay.id = GTL_PREPERATION_OVERLAY_ID
  document.body.appendChild(overlay)
}

// 타임라인으로 이동 준비 상태 제거
const stopReadyGoTimeline = () => {
  gtlState.isReadyGoTimeline = false
  gtlState.timer = null

  if (document.getElementById(GTL_PREPERATION_OVERLAY_ID)) {
    document.getElementById(GTL_PREPERATION_OVERLAY_ID).remove()
  }
}

// 타임라인으로 이동
const goToTimeline = () => {
  stopReadyGoTimeline()
  
  const timelineValue = document.querySelector(".time_link.active")
  if (!timelineValue) {
    return
  }
  
  timelineValue.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  })
}

const handleScrollUp = () => {
  if (gtlState.isReadyGoTimeline || gtlState.timer) {
    return
  }

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (scrollTop <= 0) {
    startReadyGoTimeline()
  }

  gtlState.timer = null
  gtlState.timer = setTimeout(() => {
    stopReadyGoTimeline()
  }, GO_TIMELINE_READY_DURATION)
}

const handleScrollDown = () => {
  if (!gtlState.isReadyGoTimeline) {
    return
  }

  stopReadyGoTimeline()
  goToTimeline()
}

const handleWheelEvent = (e) => {
  // 현재 스크롤 위치
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop

  if (isScrollUp(e)) {
    handleScrollUp()
  } else {
    handleScrollDown()
  }
}

const updateScrollDownButtonTip = (timelineA) => {
  const timelineScrollButton = document.querySelector("#timeline-down-button")
  if (timelineScrollButton) {
    let text = `${timelineA.querySelector('strong').textContent} `
    text += timelineA.nextSibling.textContent

    timelineScrollButton.removeAttribute("disabled")
    timelineScrollButton.setAttribute("tip", text)
  }
}

const createScrollDownButton = () => {
  const parent = document.querySelector('.depend_item')
  const li = document.createElement('li')
  const button = document.createElement('button')
  button.id = 'timeline-down-button'
  button.className = 'time'
  button.type = 'button'
  button.disabled = true
  button.setAttribute("tip", "로딩 중입니다...")
  button.addEventListener('click', goToTimeline)
  
  const buttonSpan = document.createElement('span')
  buttonSpan.textContent = '현재 타임라인'
  button.appendChild(buttonSpan)

  li.appendChild(button)
  parent.appendChild(li)
}

const createToTopButton = () => {
  const button = document.createElement('button')
  button.id = 'to-top-button'
  button.textContent = '위로'
  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
    })
  })

  document.body.appendChild(button)
}