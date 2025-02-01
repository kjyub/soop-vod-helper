const DATA_WAIT_DURATION = 2000
const REPLY_WAIT_DURATION = 2000
const GO_TIMELINE_READY_DURATION = 3000
const GTL_PREPERATION_OVERLAY_ID = 'gtl-preperation-overlay'
const GTL_TIMELINE_DETECTED_ID = 'gtl-timeline-detected' // 미사용

let gtlState = {
  isActive: false, // 활성화 상태
  commentCountObserver: null, // 댓글 개수 변경 감시자
  isReadyGoTimeline: false, // 타임라인으로 이동 준비 상태
  timer: null, // 타임라인으로 이동 준비 타이머
  timelineComments: [], // 타임라인을 가지고있는 댓글
  timelineKeys: [], // 댓글 속 타임라인 시간 키값
  timelineDic: {}, // 키: 타임라인 시간, 값: 타임라인 a.time_link element
  timelineSecondDic: {}, // 키: 모든 초, 값: 해당 초에 해당하는 timelineDic의 키
  timelineIntervalId: null // 타임라인 업데이트 setInterval id
}

const gtlMount = () => {
  gtlState.isActive = true

  // 이벤트 리스너 추가
  window.addEventListener('wheel', handleWheelEvent)

  // 타임라인 댓글 찾기
  setTimeout(() => {
    getTimelineComment()
  }, DATA_WAIT_DURATION)
}
const gtlUnmount = () => {
  gtlState.isActive = false

  window.removeEventListener('wheel', handleWheelEvent)
  clearInterval(gtlState.timelineIntervalId)
  gtlState = {
    isReadyGoTimeline: false,
    timer: null,
    timelineKeys: [],
    timelineComments: [],
    timelineIntervalId: null
  }
}

// 페이지 변경 시 초기화
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'change_url') {
    gtlUnmount()
    gtlMount()
  }
});
