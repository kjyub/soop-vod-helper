const playerState = {
  isMiniMode: false,
  inset: "auto 446px 50px auto",
  width: "500px",
}

const saveMiniModeState = (floatBox) => {
  playerState.inset = floatBox.style.inset;
  playerState.width = floatBox.style.width;
}

const restoreMiniModeState = (floatBox) => {
  floatBox.style.inset = playerState.inset;
  floatBox.style.width = playerState.width;
}

const observeFloatBox = () => {
  const floatBox = document.querySelector('.float_box');
  const floatBoxObserver = new MutationObserver(() => {
    if (floatBox.style.width === '') {
      // 미니모드 해제 된 경우
      playerState.isMiniMode = false;
    } else {
      // 미니모드 상태에서 크기가 변경된 경우
      if (playerState.isMiniMode) {
        saveMiniModeState(floatBox);
        return;
      }

      // 미니모드로 변경된 경우
      playerState.isMiniMode = true;
      restoreMiniModeState(floatBox);
    }
  });
  floatBoxObserver.observe(floatBox, { attributes: true });
}