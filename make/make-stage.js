const container = document.querySelector(".container");

function MakeStageButton() {
  const button = document.createElement("button");
  button.textContent = "ステージを作る";
  button.classList.add("stage-button");

  button.addEventListener("click", setStageState);

  container.append(button);
}

// ステージの状態
// 最終的にローカルストレージに保存
const stageState = [];
let numberOfPanel = 0;

function createUniqueId() {
  const number = Math.floor(Math.random() * 10000);
  const char = ["a", "b", "c", "d", "e", "f"];
  const charRandom1 = Math.floor(Math.random() * char.length);
  const charRandom2 = Math.floor(Math.random() * char.length);
  const uniqueId = char[charRandom1] + number + char[charRandom2];

  return uniqueId;
}

getAllStage()
function getAllStage() {
  const allStage = JSON.parse(localStorage.getItem("allStage"));
}

function setStageState() {
  const allPanel = Array.from(document.querySelectorAll(".panel"));
  const allPanelState = allPanel.filter(panel => panel.state).map(panel => panel.state);

  const stageNamePrompt = prompt("ステージの名前を入力してください\n20文字以内にしてください。");

  if(stageNamePrompt.length > 20) {
    alert("20文字以内にしてください。");
    return;
  }

  if(stageNamePrompt) {
    const stage = {};
    
    stage.id = createUniqueId();
    stage.name = stageNamePrompt;
    stage.numberOfPanel = numberOfPanel;
    stage.panelEvent = allPanelState;

    const allStage = JSON.parse(localStorage.getItem("allStage"));
    allStage.push(stage);
    localStorage.setItem("allStage", JSON.stringify(allStage));
  }
}

// 選択中のパネルのステート
// ユーザーの編集用
let isEditing = false;
let currentPanelCount = 0;
let targetPanelCount = 0;
let currentEventType;

addEventListener("dblclick", e => {
  console.log("isEditing", isEditing)
  console.log("currentPanelCount", currentPanelCount)
  console.log("targetPanelCount", targetPanelCount)
  console.log("currentEventType", currentEventType)
})

// 初期化
init();
function init() {
  // 選択したステージのハッシュに変更
  const getStage = getSelectStage();
  location.hash = getStage;

  if(getStage !== "new-stage") {
    const getAllStage = JSON.parse(localStorage.getItem("allStage"));

    const filtered = getAllStage.filter(stage => stage.id === getStage && stage);

    SelectStageMap(filtered[0]);
    return;
  }

  // DOM初期化
  NewStage();
}

function getSelectStage() {
  const getStageType = sessionStorage.getItem("stage-type");

  if(getStageType === "new-stage") return "new-stage";

  return getStageType;
}


function NewStage() {
  const explainText = document.createElement("p");
  explainText.textContent = "20から100までの数を選んでください";
  explainText.classList.add("explain");
  container.append(explainText);

  InputNumberOfPanel();
  ChangeNumberButton("incremental");
  ChangeNumberButton("decremental");
  NumberOfPanelButton();
}

function ChangeNumberButton(calcType) {
  const button = document.createElement("button");

  if(calcType === "incremental") {
    button.textContent = "+";
    button.classList.add("calc-button")
    button.classList.add("increment")
    button.addEventListener("click", () => calcPanel("incremental"));
  }

  if(calcType === "decremental") {
    button.textContent = "-";
    button.classList.add("calc-button")
    button.classList.add("decrement")
    button.addEventListener("click", () => calcPanel("decremental"));
  }

  container.append(button);
}

function calcPanel(calcType) {
  const input = document.querySelector(".input-panel-of-number").value;
  let value = Number(input);

  if(calcType === "incremental") value += 1;
  if(calcType === "decremental") value -= 1;

  if(value < 20 || 100 < value) return;
  document.querySelector(".input-panel-of-number").value = value;
}

function InputNumberOfPanel() {
  const input = document.createElement("input");
  input.type = "number";
  input.classList.add("input-panel-of-number");
  input.disabled = true;

  // パネルの範囲　10 ~ 100
  input.min = 20;
  input.max = 100;

  // デフォルトのマス
  input.value = 20;

  container.append(input);
}

function NumberOfPanelButton() {
  const button = document.createElement("button");
  button.classList.add("stage-button");
  button.textContent = "マスを作る";

  button.addEventListener("click", NewStageMap);
  container.append(button);
}


function NewStageMap() {
  // 選択したパネルの数をもとにマップを作る
  const getNumberOfPanel = document.querySelector(".input-panel-of-number").value;
  numberOfPanel = Number(getNumberOfPanel);

  // 画面内を一度リセット
  container.textContent = "";

  const stage = document.createElement("div");
  stage.classList.add("stage");

  [...new Array(numberOfPanel)].map((_, index) => {
    const panel = document.createElement("div");
    panel.id = index;
    panel.textContent = index;
    panel.classList.add("panel");
    panel.addEventListener("mouseover", hoverPanelState);

    // スタートとゴールは編集不可
    if(index === 0 || index === numberOfPanel - 1) panel.notEditable = true;

    // イベント追加用ボタン
    const eventButton = document.createElement("button");
    eventButton.textContent = "イベント";
    // id重複はバグの温床なので、ボタンはdomオブジェクトにidを割り当てる
    eventButton.buttonId = index;
    eventButton.classList.add("edit-event-button");
    eventButton.classList.add("add");

    // 編集用のモーダル表示
    eventButton.addEventListener("click", e => setCurrentState(e, "panelId"));
    eventButton.addEventListener("click", SelectEventModal);

    panel.append(eventButton);
    stage.append(panel);
  })

  container.append(stage);

  StartPanel();
  GoalPanel();

  MakeStageButton();
}

function SelectStageMap(selectStage) {
  console.log(selectStage)
  numberOfPanel = selectStage.numberOfPanel;

  const panelEvent = selectStage.panelEvent;

  const stage = document.createElement("div");
  stage.classList.add("stage");
  [...new Array(numberOfPanel)].map((_, index) => {
    const panel = document.createElement("div");
    panel.id = index;
    panel.textContent = index;
    panel.classList.add("panel");
    panel.addEventListener("mouseover", hoverPanelState);

    // EventButton(panel);
    stage.append(panel);
  })

  container.append(stage);

  panelEvent.map(state => {
    const panel = document.getElementById(state.panelCount);
    const panelState = {};

    panelState.type = state.type;
    panelState.panelCount = state.panelCount;

    if(state.type === "foward") panelState.moveCount = state.moveCount;
    if(state.type === "back") panelState.moveCount = state.moveCount;
    if(state.type === "swap") panelState.targetCount = state.targetCount;

    panel.state = panelState;
    PanelEventLavel(panel, panelState);
  })

}

function StartPanel() {
  const panel = document.getElementById(0);
  panel.textContent = "スタート";
}

function GoalPanel() {
  const panel = document.getElementById(numberOfPanel - 1);
  panel.textContent = "ゴール";
}

function hoverPanelState(e) {
  const panelState = e.target.state;

  if(panelState) {
    console.log(panelState);
  }
}

function indicateCurrentEditPanel() {
  const allPanel = Array.from(document.querySelectorAll(".panel"));
  // allPanel.map(panel => panel.classList.remove("editing"));
  const currentPanel = allPanel[currentPanelCount];

  if(currentPanel.classList.contains("editing")) {
    currentPanel.classList.remove("editing");
  } else {
    currentPanel.classList.add("editing");
  }
}


// 現在編集中のグローバル変数変更用の関数
function setCurrentState(e, stateString) {
  if(isEditing) return;

  // buttonIdはdomオブジェクト
  // 親要素にidがついているので被るのを防ぐため
  if(stateString === "panelId") currentPanelCount = e.target.buttonId;
  console.log(currentPanelCount)
}

function SelectEventModal() {
  if(isEditing) return;

  const modal = document.createElement("div");
  modal.textContent = "追加するイベントを選んで下さい";

  modal.classList.add("select-event-modal");
  modal.classList.add("apper");

  container.append(modal);

  // 全てのイベントボタンを追加
  SelectEventTypeButton("foward");
  SelectEventTypeButton("back");
  SelectEventTypeButton("loseTurn");
  SelectEventTypeButton("swap");

  // モーダル削除ボタン
  DeleteEventModalButton(modal);

  // モーダルを表示したあと編集中に
  isEditing = true;

  indicateCurrentEditPanel();
}

function DeleteEventModalButton(modal) {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "パネルを選びなおす";
  deleteButton.classList.add("delete-modal-button");

  deleteButton.addEventListener("click", () => modal.remove());
  deleteButton.addEventListener("click", indicateCurrentEditPanel);
  deleteButton.addEventListener("click", resetAllEditingState);
  deleteButton.addEventListener("click", resetAllPanelColor);

  modal.append(deleteButton);
}

function SelectEventTypeButton(eventType) {
  const modal = document.querySelector(".select-event-modal");
  const button = document.createElement("button");

  if(eventType === "foward") {
    button.textContent = "進む";
    button.id = "foward";
    button.classList.add("foward");
  }

  if(eventType === "back") {
    button.textContent = "戻る";
    button.id = "back";
    button.classList.add("back");
  }

  if(eventType === "loseTurn") {
    button.textContent = "1回休み";
    button.id = "loseTurn";
    button.classList.add("lose-turn");
  }

  if(eventType === "swap") {
    button.textContent = "場所交換";
    button.id = "swap";
    button.classList.add("swap");
  }

  button.addEventListener("click", e => currentEventType = e.target.id);
  button.addEventListener("click", changeModalContent);

  modal.append(button);
}


// ユーザー操作

function changeModalContent() {
  const modal = document.querySelector(".select-event-modal");
  
  // モーダル内をリセット
  modal.textContent = "";

  if(currentEventType === "loseTurn") {
    decidePanelState();
    return;
  }

  EditEventBox(modal);
  DeleteEventModalButton(modal);
}

// 編集用モーダル内の中身
function EditEventBox(modal) {
  EditEventInput(modal);

  const addEventButton = document.createElement("button");
  addEventButton.textContent = "決定";
  addEventButton.addEventListener("click", decidePanelState);

  modal.append(addEventButton);
}

function EditEventInput(modal) {
  const input = document.createElement("input");
  input.id = "target-count-input";
  input.type = "number";
  input.min = 0;
  input.disabled = true;

  modal.append(input);

  if(currentEventType === "back") calc("decremental");
  calc("incremental");

  TargetCountButton(modal);
}

function TargetCountButton(modal) {
  const incrementalButton = document.createElement("button");
  const decrementalButton = document.createElement("button");
  incrementalButton.textContent = "🔜";
  decrementalButton.textContent = "🔙";

  incrementalButton.addEventListener("click", () => calc("incremental"));
  decrementalButton.addEventListener("click", () => calc("decremental"));

  modal.append(decrementalButton);
  modal.append(incrementalButton);
}

function checkCanEditPanel(calcType) {
  let targetPanelId;
  if(calcType === "incremental") targetPanelId = currentPanelCount + targetPanelCount + 1;
  if(calcType === "decremental") targetPanelId = currentPanelCount + targetPanelCount - 1;

  const targetPanel = document.getElementById(targetPanelId);
  const editingCurrentPanel = targetPanel && targetPanel.classList.contains("editing");
  const notEditablePanel = targetPanel.notEditable;

  const isNextPanelGoal = targetPanelId + 1;
  if(isNextPanelGoal === numberOfPanel) {
    alert("これ以上進めません");
    alert("他のイベントを選ぶか、パネルを変えてください");

    const modal = document.querySelector(".select-event-modal");
    modal.remove();
    indicateCurrentEditPanel();
    resetAllEditingState();

    return;
  }

  if(targetPanel && !editingCurrentPanel && !notEditablePanel) return targetPanel;
}

function calc(calcType) {
  const targetPanelCountInput = document.getElementById("target-count-input");
  const targetPanel= checkCanEditPanel(calcType);

  if(!targetPanel) return;

  if(calcType === "incremental") targetPanelCount++;
  if(calcType === "decremental") targetPanelCount--;

  targetPanelCountInput.value = targetPanelCount;
  indicateSelectTargetPanel(targetPanel);
}

function indicateSelectTargetPanel(targetPanel) {
  resetAllPanelColor();
  targetPanel.style.background = "red";
}

// 全てのパネルの色をリセット
function resetAllPanelColor() {
  const allPanel = Array.from(document.querySelectorAll(".panel"));
  allPanel.map(panel => panel.style.background = "");
}

// 編集中の状態をリセット
function resetAllEditingState() {
  isEditing = false;
  currentPanelCount = 0;
  targetPanelCount = 0;
  currentEventType = "";
}


function decidePanelState() {
  indicateCurrentEditPanel();

  const panelState = {};
  
  // この２つはどのイベントでも確定の値
  panelState.type = currentEventType;
  panelState.panelCount = currentPanelCount;

  if(currentEventType === "foward") panelState.moveCount = targetPanelCount;
  if(currentEventType === "back") panelState.moveCount = -targetPanelCount;
  if(currentEventType === "swap") panelState.targetCount = currentPanelCount + targetPanelCount;

  // domオブジェクトに格納
  const panel = document.getElementById(currentPanelCount);
  panel.state = panelState;

  changePanelContent(panel, panel.state);

  if(currentEventType === "swap") {
    const targetPanel = document.getElementById(targetPanelCount + currentPanelCount);
    const panelState = {};

    panelState.type = "swap";
    panelState.panelCount = targetPanelCount + currentPanelCount;
    panelState.targetCount = currentPanelCount; 
    targetPanel.state = panelState;

    changePanelContent(targetPanel, targetPanel.state);
  }

  // イベントモーダル削除
  const modal = document.querySelector(".select-event-modal");
  modal.remove();

  resetAllPanelColor();
  resetAllEditingState();
}

function PanelEventLavel(panel, panelState) {
  const { type } = panelState;
  const eventLavel = document.createElement("div");
  eventLavel.classList.add("event-lavel");

  if(type === "foward") {
    eventLavel.textContent = `${panelState.moveCount}進む`;
    eventLavel.classList.add("foward");
  }

  if(type === "back") {
    eventLavel.textContent = `${panelState.moveCount}戻る`;
    eventLavel.classList.add("back");
  }

  if(type === "loseTurn") {
    eventLavel.textContent = `1回休み`;
    eventLavel.classList.add("lose-turn");
  }

  if(type === "swap") {
    eventLavel.textContent = `${panelState.targetCount}と交換`;
    eventLavel.classList.add("swap");
  }

  panel.append(eventLavel);
}


// decidePanelState関数によって選択されたパネルの中身を変更
function changePanelContent(panel, panelState) {
  // 選択したパネルの中身を一度リセット
  const panelContent = Array.from(panel.children);
  panelContent.map(content => content.remove());

  const resetEventButton = document.createElement("button");
  resetEventButton.textContent = "リセット";
  resetEventButton.classList.add("edit-event-button");
  resetEventButton.classList.add("remove");
  resetEventButton.addEventListener("click", e => {

    const panel = e.target.parentElement;

    if(panel.state.type === "swap") {
      const targetPanelId = panel.state.targetCount;

      resetPanelState(targetPanelId);
    }

    resetPanelState(panel.id);
  });

  PanelEventLavel(panel, panelState);
  panel.append(resetEventButton);
}


// 選択したパネルをリセットする
function resetPanelState(panelId) {
  const panel = document.getElementById(panelId);

  // domオブジェクトを削除
  delete panel.state;

  // パネルの内容をリセット
  const content = Array.from(panel.children);
  content.map(el => el.remove());

  // イベント追加用ボタン
  const eventButton = document.createElement("button");
  eventButton.textContent = "イベント";
  // 親要素のidをdomオブジェクトに設定
  eventButton.buttonId = Number(panel.id);
  eventButton.classList.add("edit-event-button");
  eventButton.classList.add("add");
  eventButton.addEventListener("click", e => currentPanelCount = e.target.buttonId);
  eventButton.addEventListener("click", SelectEventModal);

  panel.append(eventButton);
}

function EventButton(panel) {
  // イベント追加用ボタン
  const eventButton = document.createElement("button");
  eventButton.textContent = "イベント";
  // 親要素のidをdomオブジェクトに設定
  eventButton.buttonId = Number(panel.id);
  eventButton.classList.add("edit-event-button");
  eventButton.classList.add("add");
  eventButton.addEventListener("click", e => currentPanelCount = e.target.buttonId);
  eventButton.addEventListener("click", SelectEventModal);

  panel.append(eventButton);
}
