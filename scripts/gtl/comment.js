// Description: 타임라인 댓글 관련 스크립트
// 타임라인 댓글 찾기
// 현재 타임라인 찾기

// 루트 댓글 가져오기
const getBaseComment = () => {
  // 1단계. HH:MM:SS 형식의 시간이 있는 댓글 찾기
  const comments = document.querySelectorAll(".cmmt-list>li")

  // 타임라인이 있는 댓글 찾기 (5개 이상)
  let filteredComments = Array.from(comments).filter(comment => {
    const strongTags = comment.querySelectorAll('strong')
    const timeTags = Array.from(strongTags).filter(tag => /^\d{2}:\d{2}:\d{2}$/.test(tag.textContent))
    return timeTags.length >= 5
  })

  if (filteredComments.length === 0) {
    return null
  } else if (filteredComments.length === 1) {
    return filteredComments[0]
  }

  // 2단계. BEST 댓글 찾기
  filteredComments = filteredComments.filter(comment => {
    const bestTag = comment.querySelector('.best')
    return bestTag !== null
  })

  if (filteredComments.length === 0) {
    return null
  } else if (filteredComments.length === 1) {
    return filteredComments[0]
  }

  // 3단계. 타임라인이 가장 많은 댓글 찾기
  max = filteredComments.reduce((a, b) => {
    const al = a.querySelectorAll('.time_link').length
    const bl = b.querySelectorAll('.time_link').length
    return (al > bl ? a : b)
  })

  return max
  
  // 4단계. 댓글 펼치고 확인하기
  // 이거까지 할 필요는 아직 없지 않나 싶음
}

// 답글들 가져오기
const getReplyComment = (baseComment) => {
  const replies = baseComment.querySelectorAll('li')

  const baseWriter = baseComment.querySelector('p.ictFunc').textContent

  // 작성자가 같은 답글만 가져오기
  const filteredReplies = Array.from(replies).filter(reply => reply.id.includes('reply_child') && reply.querySelector('p.ictFunc').textContent === baseWriter)

  return filteredReplies
}

// 타임라인으로 사용하는 댓글 찾기
const getTimelineComment = () => {
  // 1. 루트 댓글 가져오기
  const baseComment = getBaseComment()
  if (baseComment === null) {
    console.log("타임라인 댓글을 찾지 못했습니다.")
    return
  }

  const commentContent = baseComment.querySelector('.info_box').textContent
  console.log("타임라인 댓글을 찾았습니다.", commentContent)

  gtlState.timelineComments = [baseComment]

  // 2. 답글 가져오기
  const replyCountText = baseComment.querySelector('.btn-basic em').textContent
  const replyCount = parseInt(replyCountText)
  const hasReply = replyCount > 0

  if (!hasReply) {
    initTimeline()
    return
  }

  // 3. 답글 펼치기
  const replyButton = baseComment.querySelector('button.btn-basic')
  replyButton.click()

  // 답글 닫기 버튼 비활성화
  replyButton.disabled = true

  setTimeout(() => {
    const replyComments = getReplyComment(baseComment)
    gtlState.timelineComments = [...gtlState.timelineComments, ...replyComments]
    initTimeline()
  }, [REPLY_WAIT_DURATION])
}

// 현재 타임라인 업데이트
const updateActiveTimeline = () => {
  if (gtlState.timelineKeys.length === 0) {
    return
  }

  // 현재 재생 시간 가져오기
  const timeCurrentSpan = document.querySelector(".time-current")
  if (!timeCurrentSpan) {
    return
  }
  const timeCurrent = timeCurrentSpan.textContent
  
  // 현재 활성화된 타임라인 찾기
  const currentTimelineA = document.querySelector("a.time_link.active")

  // 업데이트할 타임라인 찾기
  const timeKey = gtlState.timelineSecondDic[timeCurrent] // 현재 보고있는 타임라인 시간 가져오기
  let newTimelineA = gtlState.timelineDic[timeKey] // 타임라인 element 가져오기


  // 타임라인 키가 없다면 아직 없는 타임라인으로 간주
  if (!timeKey || !newTimelineA) {
    // 현재 시간이 마지막 타임라인 이후면 마지막 타임라인 유지
    const lastTimelineKey = gtlState.timelineKeys[gtlState.timelineKeys.length - 1]
    if (timeCurrent >= lastTimelineKey) {
      newTimelineA = gtlState.timelineDic[lastTimelineKey]
    } else {
      // 타임라인 비활성화
      document.querySelectorAll("a.time_link.active").forEach(timelineA => {
        timelineA.classList.remove('active')
      })
      return
    }
  }
  
  // 현재 타임라인과 업데이트할 타임라인이 다르면 업데이트
  if (!currentTimelineA || (currentTimelineA.getAttribute("data-time") !== newTimelineA.getAttribute("data-time"))) {
    if (currentTimelineA) {
      currentTimelineA.classList.remove('active')
    }
    newTimelineA.classList.add('active')

    // 타임라인 스크롤 버튼 tip에 현재 타임라인 내용 표시
    updateScrollDownButtonTip(newTimelineA)
  }
}

// 타임라인 기능 초기화
const initTimeline = () => {
  // 1. 댓글 속 타임라인 찾기
  const comments = gtlState.timelineComments

  const timelines = []
  comments.forEach(comment => {
    timelines.push(...Array.from(comment.querySelectorAll('a.time_link')))
  })

  if (timelines.length === 0) {
    return
  }

  // 타임라인을 빠르게 찾기 위한 키값 생성
  const timelineKeys = []
  const timelineDic = {}
  const timelineSecondDic = {}

  // 타임라인 데이터 정리 (timelineKeys, timelineDic)
  let lastTimelineKey = "00:00:00" // 마지막 타임라인 키
  timelines.forEach(timeline => {
    let timeKey = timeline.querySelector('strong').textContent

    if (timeKey.length === 5) {
      timeKey = `00:${timeKey}`
    }

    timelineKeys.push(timeKey)
    timelineDic[timeKey] = timeline
    lastTimelineKey = timeKey
  })

  // 초 단위 타임라인 데이터 정리 (timelineSecondDic)
  const [hours, minutes, seconds] = lastTimelineKey.split(':').map(Number)
  const lastTimeInSeconds = hours * 3600 + minutes * 60 + seconds

  const reversedTimeKeys = timelineKeys.toReversed()

  for (let i = 0; i <= lastTimeInSeconds; i++) {
    const hours = String(Math.floor(i / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((i % 3600) / 60)).padStart(2, '0')
    const seconds = String(i % 60).padStart(2, '0')
    const time = `${hours}:${minutes}:${seconds}`

    let timeKey = "00:00:00"

    for (const _timeKey of reversedTimeKeys) {
      if (time >= _timeKey) {
        timeKey = _timeKey
        break
      }
    }
    timelineSecondDic[time] = timeKey
  }

  // 값 저장
  gtlState.timelineKeys = timelineKeys
  gtlState.timelineDic = timelineDic
  gtlState.timelineSecondDic = timelineSecondDic

  // 2. 일정 간격으로 현재 타임라인 업데이트
  const intervalId = setInterval(() => {
    updateActiveTimeline()
  }, 1000)

  gtlState.timelineIntervalId = intervalId
}