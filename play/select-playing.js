const container = document.querySelector(".stage-container");
const subTitle = document.querySelector(".sub-title");

// 初期化
init();
function init() {
  location.hash = "stage";
  
  Stage();
}

// 画面変更のイベント
window.addEventListener("hashchange", changeDisplay);

function changeDisplay() {
  console.log("url changed")

  // 画面リセット
  container.textContent = "";

  // 画面遷移
  if(location.hash === "#stage") Stage();
  if(location.hash === "#number-of-user") NumberOfUser();
  if(location.hash === "#user-icon") UserIcon();
}


// ボタンクリック時に引数に基づきハッシュの変更をできるように
// changeDisplay()が呼び出される
function changeButtonUseHash(selectString) {
  if(selectString === "stage") location.hash = "#number-of-user";
  if(selectString === "number-of-user") location.hash = "#user-icon";
}


// localStorageに依存しない選択ステージ
// ステージを一つも作ってなくても遊べる用に
function DefalutStageButton() {
  const defalutStageButton = document.createElement("button");
  defalutStageButton.textContent = "デフォルトのステージ";
  defalutStageButton.id = "defalut";
  defalutStageButton.classList.add("stage-button");

  defalutStageButton.addEventListener("click", () => useSessionStorage("stage", "defalut"));
  defalutStageButton.addEventListener("click", () => changeButtonUseHash("stage"));

  container.append(defalutStageButton);
}

function StageButton(stage) {
  const button = document.createElement("button");
  button.textContent = stage.name;
  button.id = stage.id;
  button.classList.add("stage-button");

  button.addEventListener("click", e => useSessionStorage("stage", e.target.id));
  button.addEventListener("click", () => changeButtonUseHash("stage"));

  container.append(button);
}


// ハッシュに基づいた画面変更の関数群
function Stage() {
  subTitle.textContent = "ステージを選択してください";

  const getAllStage = JSON.parse(localStorage.getItem("allStage"));

  if(!getAllStage) {
    const allStage = [];
    localStorage.setItem("allStage", JSON.stringify(allStage));
    return;
  }

  getAllStage.map(stage => {
    if(stage.id === "defalut") return;
    StageButton(stage);
  })

  DefalutStageButton();
}

function NumberOfUser() {
  subTitle.textContent = "プレイする人数を選択してください";

  const modeNumberOfUser = [2, 3, 4, 5, 6];

  modeNumberOfUser.map(number => {
    const button = document.createElement("button");
    button.id = number;
    button.textContent = `${number}人`;
    button.classList.add("stage-button");

    button.addEventListener("click", e => useSessionStorage("number-of-user", e.target.id));
    button.addEventListener("click", () => changeButtonUseHash("number-of-user"));

    container.append(button);
  })
}

function UserIcon() {
  subTitle.textContent = "あなたのアイコンを選んでください";

  const userIcons = ["🐦", "🐧", "🐨", "🐭", "🐮", "🐯", "🐰", "🐱", "🐲", "🐳", "🐴", "🐵", "🐶"] ;

  userIcons.map(icon => {
    const button = document.createElement("button");
    button.id = icon;
    button.textContent = icon;
    button.classList.add("user-icon-button");

    button.addEventListener("click", e => useSessionStorage("user-icon", e.target.id));

    container.append(button);
  })

  PlayButton();
}

function PlayButton() {
  const playButton = document.createElement("button");
  playButton.textContent = "ゲームを始める";
  playButton.addEventListener("click", gameStart);
  playButton.classList.add("stage-button");
  container.append(playButton);
}


// ボタンクリック時にbutton要素のIdを確認して、ストレージに記録
function useSessionStorage(selectString, selectId) {
  if(selectString === "stage" && selectId === "defalut") {
    sessionStorage.setItem("select-defalut-stage", true);
  }

  if(selectString === "stage") sessionStorage.setItem("play-stage", selectId);
  if(selectString === "number-of-user") sessionStorage.setItem("play-number-of-user", selectId);
  if(selectString === "user-icon") sessionStorage.setItem("play-user-icon", selectId);

}


function gameStart() {
  // 選択肢が全て選ばれている場合ゲーム開始
  const isPlayStage = sessionStorage.getItem("play-stage");
  const isPlayNumberOfUser = sessionStorage.getItem("play-number-of-user");
  const isPlayUserIcon = sessionStorage.getItem("play-user-icon");

  if(isPlayStage && isPlayNumberOfUser && isPlayUserIcon) {
    location.assign("game.html");
  } else {
    alert("アイコンを選んでください。")
  }
}
