
const bttn = document.querySelectorAll(".bttn");
// Add a click event listener to each button
bttn.forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.innerHTML === "Accept") {
            btn.innerHTML = "Request is Accepted";
            const reject = btn.closest(".btn").querySelector(".reject");
            const accept = btn.closest(".btn").querySelector(".accept");
            accept.style.width = "280px";
            reject.style.display = "none";
        } else if (btn.innerHTML === "Reject") {
            btn.innerHTML = "Request is Rejected";
            const reject = btn.closest(".btn").querySelector(".reject");
            const accept = btn.closest(".btn").querySelector(".accept");
            reject.style.width = "280px";
            accept.style.display = "none";
        }
    });
});
