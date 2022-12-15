const container = document.querySelector(".container");
const makeNewStageButton = document.querySelector(".new");

AllStageButton();
function AllStageButton() {
  const allStage = getAllStage();

  allStage.map(stage => StageButton(stage));
  DeleteStageButton();
}

function getAllStage() {
  const allStage = JSON.parse(localStorage.getItem("allStage"));

  return allStage;
}

function StageButton(stage) {
  const button = document.createElement("button");
  button.id = stage.id;
  button.textContent = stage.name;
  button.classList.add("stage-button");
  button.classList.add("maked");
  button.addEventListener("click", changeUrlMakeStage);

  container.append(button);
}

function DeleteStageButton() {
  const allStageButton = Array.from(document.querySelectorAll(".stage-button"));
  allStageButton.map(button => {
    if(button.id === "new-stage") return;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "消去";
    deleteButton.classList.add("delete-stage-button");

    // dom オブジェクトに格納
    deleteButton.stageId = button.id;

    deleteButton.addEventListener("click", deleteStage);
    button.append(deleteButton);
  })
}

function deleteStage(e) {
  e.stopPropagation();

  const checkDelete = confirm("このステージを本当に削除しますか？");

  if(!checkDelete) return;

  const stageButton = e.target.parentElement;
  stageButton.remove();

  const allStage = getAllStage();
  const target = e.target.stageId;

  const filterAllStage = allStage.filter(stage => stage.id !== target && stage);
  localStorage.setItem("allStage", JSON.stringify(filterAllStage));
}

function changeUrlMakeStage(e) {
  const makedAllStage = document.querySelectorAll(".maked");
  if(makedAllStage.length > 10) {
    alert("ステージを作れるのは10個までです。");
    alert("他のステージを消してください。");
    return;
  }

  const buttonID = e.target.id;

  if(buttonID === "new-stage") {
    // 画面遷移時に新しいステージを作るためのフラグ
    sessionStorage.setItem("stage-type", "new-stage");
  } else {
    sessionStorage.setItem("stage-type", buttonID);
  }

  location.assign("make-stage.html")
}

makeNewStageButton.addEventListener("click", changeUrlMakeStage);
