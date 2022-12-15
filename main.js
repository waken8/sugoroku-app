if(localStorage.getItem("allStage")) {
  console.log("allStage")
} else {
  const allStage = [];
  localStorage.setItem("allStage", JSON.stringify(allStage));
}
