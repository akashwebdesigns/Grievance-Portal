
//Home Page 
function increment() {
    const counters = document.querySelectorAll(".counter");
    counters.forEach((counter) => {
        counter.innerHTML = 0;
        //update counter
        const updateCounter = () => {
            const targetcount = counter.getAttribute("data-target");
            const incr = targetcount / 100;
            const startingCount = Number(counter.innerHTML);//string to number
            if (startingCount < targetcount) {
                counter.innerHTML = `${Math.round(startingCount + incr)}`;
                setTimeout(updateCounter, 100);
            }
            else {
                counter.innerHTML = targetcount;
            }
        }
        updateCounter();
    })
}

$(window).scroll(function () {

    if ($(window).scrollTop() > $("#increment").offset().top) {
        increment();
    }

});

//Success Msg
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove();
    }, 2000)
}

//Forgot Password

$("#forgot").click(async function () {
    const email = document.getElementById("email").value;
    if (!email) {
        $("#modal-text").text("Please enter the email");
        $("#myModal").modal("show");

    } else {
        fetch("/forgot-password", {
            method: "POST",
            // Adding body or contents to send
            body: JSON.stringify({
                emailId: email,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(response => response.json())
            .then((json) => {
                $("#modal-text").text(json.message);
                $("#myModal").modal("show");
            });
    }
})
