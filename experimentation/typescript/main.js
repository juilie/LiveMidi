const color = document.querySelector("#color");
color.addEventListener("change", function (e) {
    console.log(Number(`0x${e.target.value.substr(1)}`));
});