const stage = document.querySelector(".stage");

const defalutEvent = [
  {
    type: "foward",
    panelCount: 3,
    moveCount: 2
  },
  {
    type: "swap",
    panelCount: 4,
    targetCount: 8
  },
  {
    type: "loseTurn",
    panelCount: 5,
  },
  {
    type: "swap",
    panelCount: 8,
    targetCount: 4
  },
  {
    type: "loseTurn",
    panelCount: 10,
  },
  {
    type: "back",
    panelCount: 12,
    moveCount: 1
  },
  {
    type: "loseTurn",
    panelCount: 13,
  },
  {
    type: "foward",
    panelCount: 15,
    moveCount: 2
  },
  {
    type: "back",
    panelCount: 17,
    moveCount: 3
  },
  {
    type: "foward",
    panelCount: 18,
    moveCount: 2
  },
  {
    type: "foward",
    panelCount: 21,
    moveCount: 4
  },
  {
    type: "swap",
    panelCount: 23,
    targetCount: 27
  },
  {
    type: "back",
    panelCount: 25,
    moveCount: 6 
  },
  {
    type: "swap",
    panelCount: 27,
    targetCount: 23
  },
  {
    type: "loseTurn",
    panelCount: 29,
  },
  {
    type: "back",
    panelCount: 30,
    moveCount: 3
  },
  {
    type: "loseTurn",
    panelCount: 32,
  },
  {
    type: "loseTurn",
    panelCount: 33,
  },
]

const defalutStage = {
  id: "defalut",
  name: "デフォルトのステージ",
  numberOfPanel: 35,
  panelEvent: defalutEvent
}

// ステージやユーザーのゲームの状態
const playingState = {};

function setPlayingState() {
  // ローカルストレージのステージからフィルタリング

  const getStage = (() => {
    if(checkDefalutStage()) {
      sessionStorage.removeItem("select-defalut-stage");
      return defalutStage;
    }

    return filterStage();
  })();


  // セッションストレージから
  const getNumberOfUser = Number(sessionStorage.getItem("play-number-of-user"));
  const getUserIcon = sessionStorage.getItem("play-user-icon");

  // ゲームのステートに追加
  playingState.stage = getStage;
  playingState.numberOfUser = getNumberOfUser;
  playingState.userIcon = getUserIcon;

  // CPUのユーザーアイコン追加
  const cpuIcon = setCpuIcon();
  playingState.allUserIcon = [playingState.userIcon, ...cpuIcon];

  // 全てのユーザーの状態を追加
  const allUserState = setUserState();
  playingState.allUser = allUserState;

  setUserState();
}

function checkDefalutStage() {
  const checkSelecet = sessionStorage.getItem("select-defalut-stage");

  if(checkSelecet) {
    console.log("defalutfffff")
    return defalutStage;
  } 

  return false;
}

function filterStage() {
  const getStage = sessionStorage.getItem("play-stage");
  const getAllStage = Array.from(JSON.parse(localStorage.getItem("allStage")));
  const filterdStage = getAllStage.filter(stage => stage.id === getStage);

  const { id, name, numberOfPanel, panelEvent } = filterdStage[0];
  const stage = {
    id,
    name,
    numberOfPanel,
    panelEvent
  }

  return stage;
}

// ユーザーの内部id
// テストとかしやすいように
let userId = 0;

function setUserState() {
  const allUserIcon = playingState.allUserIcon;

  const allUser = allUserIcon.map(icon => {
    const user = {};

    user.icon = icon;
    user.currentPanel = 0;
    user.loseTurnCount = 0;
    user.didEvent = false;
    user.didGoal = false;

    user.id = userId;
    userId++;

    return user;
  })

  return allUser;
}

function setCpuIcon() {
  const allIcon = ["🐦", "🐧", "🐨", "🐭", "🐮", "🐯", "🐰", "🐱", "🐲", "🐳", "🐴", "🐵", "🐶"] ;

  // プレイヤーが選んだもの以外をCPUのアイコンに振り分ける
  const userIcon = playingState.userIcon;
  const filterdAllIcon = allIcon.filter(icon => userIcon !== icon);
  const shuffledAllIcon = arrayShuffle(filterdAllIcon);

  const allCpuIcon = [];
  for(let i = 0; i < playingState.numberOfUser - 1; i++) {
    allCpuIcon.push(shuffledAllIcon[i]);
  }

  return allCpuIcon;
}

function arrayShuffle(array) {
  for(let i = (array.length - 1); 0 < i; i--){

    let r = Math.floor(Math.random() * (i + 1));

    let tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
}

// 初期化
init();
function init() {
  setPlayingState();

  // DOM初期化
  Stage();
  AllUserFromStart();
  UserStateCard();
  indicateCurrentUser(0);

  const stageTitle = document.querySelector(".stage-title");
  stageTitle.textContent = playingState.stage.name;

  setTimeout(() => {
    alert("ユーザーの1人がゴールした時点でこのゲームは終了です。\nイベントは基本的に連鎖しません。\n交換イベントの場合はサイコロを振ったユーザーのみ連鎖しません。");
    alert("スクロールのアニメーションがおかしい場合は一旦戻ってやり直してください。(ずっと縦にしかスクロールされない)")
  }, 200);
}

// DOMの初期状態に関する関数群
function Stage() {
  const numberOfPanel = [...new Array(playingState.stage.numberOfPanel)];

  numberOfPanel.map((_, index) => {
    const panel = document.createElement("div");
    panel.id = index;
    panel.classList.add("panel");

    const panelHeader = document.createElement("div");
    panelHeader.classList.add("panel-header");

    const panelNumber = document.createElement("div");
    panelNumber.classList.add("panel-number");
    panelNumber.textContent = index;

    panelHeader.append(panelNumber);
    panel.append(panelHeader);
    stage.append(panel);

    PanelEventLavel(index);
  })

  StartPanel();
  GoalPanel();
}

function StartPanel() {
  const startPanel = document.querySelector(".panel");
  startPanel.classList.add("start");

  const panelHeader = document.querySelector(".panel-header");
  panelHeader.textContent = "スタート";
  panelHeader.classList.add("panel-message");
  panelHeader.classList.add("start");
}

function GoalPanel() {
  const goal = playingState.stage.numberOfPanel - 1;
  const goalPanel = document.querySelectorAll(".panel")[goal];
  goalPanel.classList.add("goal");

  const panelHeader = document.querySelectorAll(".panel-header")[goal];
  panelHeader.textContent = "ゴール";
  panelHeader.classList.add("panel-message");
  panelHeader.classList.add("goal");
}

function PanelEventLavel(index) {
  const allPanelEvent = playingState.stage.panelEvent;
  const getHasEventState = allPanelEvent.filter(panel => panel.panelCount === index && panel);
  if(getHasEventState.length === 0) return;

  const eventState = getHasEventState[0];
  const { type } = eventState;

  const panelEventLabel = document.createElement("div");
  panelEventLabel.classList.add("panel-event-lavel");

  if(type === "foward") {
    panelEventLabel.textContent = `${eventState.moveCount}マス進む`;
    panelEventLabel.classList.add("foward");
  }

  if(type === "back") {
    panelEventLabel.textContent = `${eventState.moveCount}マス戻る`;
    panelEventLabel.classList.add("back");
  }

  if(type === "loseTurn") {
    panelEventLabel.textContent = `1回休み`;
    panelEventLabel.classList.add("lose-turn");
  }

  if(type === "swap") {
    panelEventLabel.textContent = `${eventState.targetCount}マスの人と🔄`;
    panelEventLabel.classList.add("swap");
  }

  const panelHeader = document.querySelectorAll(".panel-header")[index];
  panelHeader.append(panelEventLabel);
}

// 最初のユーザー追加
function AllUserFromStart() {
  const allUser = playingState.allUser;
  allUser.map(user => addUserToPanel(user.currentPanel, user));
}

function UserStateCard() {
  const indicater = document.querySelector(".user-indicater");

  const allUser = playingState.allUser;
  allUser.map(user => {
    const card = document.createElement("div");
    card.classList.add("user-card");

    const icon = document.createElement("div");
    icon.textContent = user.icon;
    icon.classList.add("user-card-icon");

    const loseTurn = document.createElement("div");
    loseTurn.classList.add("user-lose-turn");

    card.append(icon);
    card.append(loseTurn);

    indicater.append(card);
  })
}




// スクロール用の各パネルの座標
const panelCors = setPanelCor();

function setPanelCor() {
  const allPanel = Array.from(document.querySelectorAll(".panel"));

  const cors = allPanel.map((_, index) => {
    const panel = document.getElementById(index);
    const cor = panel.getBoundingClientRect();

    const { x, y } = cor;

    return { x, y };
  })

  return cors;
}


// プレイ中の処理

// イベントのメッセージの表示やサイコロのアニメなどの表示用
const overlay = document.querySelector(".overlay");

const userStepSpeed = 700;

let currentTurn = 1;

let currentUserIndex = 0;
let moveabelAllUser = playingState.allUser;
let currentUser = moveabelAllUser[currentUserIndex];

function indicateCurrentUser(currentUserIndex) {
  const allUserCard = Array.from(document.querySelectorAll(".user-card"));
  allUserCard.map(card => card.style.background = "");

  const selectUserColor = "#99FFFF";
  const currenUser = allUserCard[currentUserIndex];
  currenUser.style.background = selectUserColor;
}


// ユーザーのイベント
// サイコロボタンを押して操作が始まる

const diceButton = document.querySelector(".dice-button");
diceButton.addEventListener("click", rollDice);

function rollDice() {
  diceButton.removeEventListener("click", rollDice);

  let result = Math.floor( Math.random() * 6 ) + 1;

  overlay.textContent = `🎲 ${result}`;
  overlay.classList.add("event-message");
  overlay.classList.add("appear");

  setTimeout(() => {
    overlay.classList.remove("appear");
  }, 1000);

  // 進む前に一旦スクロール
  const nextUser = currentUser.currentPanel;
  scrollToPanel(nextUser);

  fowardUser(result, currentUser);

}


function reset() {
  // 全てのユーザーのイベントフラグをリセット
  playingState.allUser.map(user => user.didEvent = false);
  // 一回休みのラベルをリセット
  removeAllLoseTurnLavelOfUserCard();
}

function changeUser() {
  diceButton.addEventListener("click", rollDice);

  currentUserIndex++;
  currentUser = moveabelAllUser[currentUserIndex];

  if(currentUserIndex === moveabelAllUser.length) {
    currentTurn++;
    console.log("turn", currentTurn)

    reset();

    if(calcMoveabelUser()) {
      currentUserIndex = 0;
      currentUser = moveabelAllUser[currentUserIndex];
    } else {
      alert("全員が1回休みなので1ターン飛ばします");

      currentTurn++;
      calcMoveabelUser();

      reset();

      currentUserIndex = 0;
      currentUser = moveabelAllUser[currentUserIndex];
    }
  }

  indicateCurrentUser(currentUser.id);
}

function calcMoveabelUser() {
  const allUser = playingState.allUser;

  const filetedAllUser = allUser.filter(user => {
    if(user.loseTurnCount !== currentTurn && !user.didGoal) {
      return user;
    }
  })

  if(filetedAllUser.length === 0) {
    return false;
  }

  moveabelAllUser = filetedAllUser;

  return true;
}

// 移動に関する関数
// 基本的にaddUserToPanleとremoveUserFromPanelはセットで使う

function addUserToPanel(panelId, user) {
  const panel = document.getElementById(panelId);
  const userIcon = document.createElement("div");
  userIcon.id = `user-${user.icon}`;
  userIcon.textContent = user.icon;
  userIcon.classList.add("user-icon");
  panel.append(userIcon);
}

function removeUserFromPanel(user) {
  const userIcon = document.getElementById(`user-${user.icon}`);
  userIcon.remove();
}

let prev = 0
function scrollToPanel(panelCount) {
  const x = panelCors[panelCount].x;
  const y = panelCors[panelCount].y;
  const spaceXFromEdge = 40;

  window.scroll({
    top: y,
    left: x - spaceXFromEdge,
    behavior: "smooth"
  })
}


function fowardUser(result, user) {
  let targetMoveCount = user.currentPanel + result;
  let movedCount = user.currentPanel;

  // ゴールより大きい数字の時点で終わり
  // ぴったりではない
  const goal = playingState.stage.numberOfPanel - 1;
  if(targetMoveCount >= goal) {
    targetMoveCount = goal;
    user.didGoal = true;
  }

  const intervalId = setInterval(() => {
    if(targetMoveCount === movedCount) {
      clearInterval(intervalId);

      // 現在のパネル位置をセット
      user.currentPanel = targetMoveCount;

      if(user.didGoal) {
        alert(`${user.icon}がゴール`);
        alert("誰かがゴールしたのでゲームを終了します");

        location.assign("../index.html");
        return;
      }
 
      // パネルのイベントがあれば呼び出す関数 
      panelEventHappen(user);

      return;
    }

    movedCount++;
    addUserToPanel(movedCount, user);
    removeUserFromPanel(user);
    scrollToPanel(movedCount);
  }, userStepSpeed);
}

function backUser(result, user) {
  const targetMoveCount = user.currentPanel - result;
  let movedCount = user.currentPanel;

  const intervalId = setInterval(() => {
    if(targetMoveCount === movedCount) {
      clearInterval(intervalId);

      // 現在のパネル位置をセット
      user.currentPanel = targetMoveCount;

      changeUser();

      return;
    }

    removeUserFromPanel(user);
    movedCount--;
    addUserToPanel(movedCount, user);
    scrollToPanel(movedCount);
  }, userStepSpeed);
}

function loseTurn(user) {
  const loseTurnCount = currentTurn + 1;
  user.loseTurnCount = loseTurnCount;

  changeUser();
}

function swapUser(target, user) {
  const exitAllTargetUser = moveabelAllUser.filter(user => user.currentPanel === target && user);

  if(exitAllTargetUser.length === 0) {
    alert("交換可能なユーザーはいませんでした。");
    changeUser();
    return;
  }

  // 移動先にいたユーザーがイベント元のパネルに移動するため
  const currentUserWasPanel = user.currentPanel;

  scrollToPanel(target);
  disappearUserFromPanel(user);
  appearUserToPanel(target, user);

  setTimeout(() => {
    exitAllTargetUser.map(user => {
      disappearUserFromPanel(user);
      appearUserToPanel(currentUserWasPanel, user);
      user.currentPanel = currentUserWasPanel;
    })

    user.currentPanel = target;

    changeUser();
  }, 1200);
}


// 下２つの関数はswapUser関数のみに使われる
function disappearUserFromPanel(user) {
  const userIcon = document.getElementById(`user-${user.icon}`);
  userIcon.remove();
}

function appearUserToPanel(target, user) {
  const panel = document.getElementById(target);
  const userIcon = document.createElement("div");
  userIcon.id = `user-${user.icon}`;
  userIcon.textContent = user.icon;
  userIcon.classList.add("user-icon");
  userIcon.classList.add("swaped");
  panel.append(userIcon);

  setTimeout(() => userIcon.classList.add("appear"), 300);
  userIcon.addEventListener("transitionend", () => {
    userIcon.classList.remove("appear");
    userIcon.classList.remove("swaped");
  })
}


// パネルのイベント実行のメイン関数
function panelEventHappen(user) {
  const panelEvent = checkPanelEvent(user.currentPanel);
  const notDidEvent = !user.didEvent;

  // パネルのイベントが存在しターンの最初のイベントなら実行
  if(panelEvent && notDidEvent) {
    overlayEventMessage(panelEvent);
    setTimeout(() => overlay.classList.remove("appear"), 1200);
    setTimeout(() => setPanelEvent(panelEvent, user), 1200);
  } else {
    changeUser();
  }
}

function checkPanelEvent(panelCount) {
  const allPanelEvnet = playingState.stage.panelEvent;
  const getPanel = allPanelEvnet.filter(panel => panel.panelCount === panelCount);
  const panelEvent = getPanel[0];

  if(getPanel.length === 0) return;

  return panelEvent;
}

function setPanelEvent(panelEvent, user) {
  const type = panelEvent.type;

  user.didEvent = true;

  if(type === "foward") {
    const target = panelEvent.moveCount;
    fowardUser(target, user)
  }

  if(type === "back") {
    const target = panelEvent.moveCount;
    backUser(target, user);
  }

  if(type === "loseTurn") {
    loseTurnLavelOfUserCard(currentUserIndex);
    loseTurn(user);
  }

  if(type === "swap") {
    const target = panelEvent.targetCount;
    swapUser(target, user);
  }
}

function loseTurnLavelOfUserCard(currentUserIndex) {
  const userCard = document.querySelectorAll(".user-card")[currentUserIndex];
  const lavel = userCard.children[1];
  lavel.classList.add("lose-turn");
  lavel.textContent = "休み中";
}

function removeAllLoseTurnLavelOfUserCard() {
  const allUser = playingState.allUser;
  console.log(allUser)
  allUser.map(user => {
    if(user.loseTurnCount !== currentTurn) {
      const lavel = document.querySelectorAll(".user-lose-turn")[user.id];
      lavel.classList.remove("lose-turn");
      lavel.textContent = "";
    }
  })
}

function overlayEventMessage(eventState) { 
  overlay.textContent = "";
  overlay.classList.add("event-message");

  const type = eventState.type;
  const message = document.createElement("div");
  const currentUserIcon = currentUser.icon;

  if(type === "foward") {
    const moveCount = eventState.moveCount;
    message.textContent = `${currentUserIcon}が${moveCount}マス進む`;
  }

  if(type === "back") {
    const moveCount = eventState.moveCount;
    message.textContent = `${currentUserIcon}が${moveCount}マス戻る`;
  }

  if(type === "loseTurn") {
    message.textContent = `${currentUserIcon}が1回休み`;
  }

  if(type === "swap") {
    message.textContent = `ユーザーを交換`;
  }

  overlay.classList.add("appear");
  overlay.append(message);
}

