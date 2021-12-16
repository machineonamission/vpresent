// get json URL, passed through GET params
const jsonurl = new URLSearchParams(window.location.search).get("file");

let currentvideo = 0;
// read json file using main thread
window.electron.ipcinvoke("readjson", jsonurl).then(vdata => {
    console.log(vdata);
    // open video window
    let videowindow = window.open("video.html", "_blank", "autoHideMenuBar=true");
    // close if child closes (doesnt work?)
    videowindow.onclose = () => {
        window.location = "filepicker.html"
    }

    // "send" videos to other window
    vdata.forEach(v => {
        videowindow.postMessage({"type": "preload", "data": v.video})
    });

    // set up events
    function playvideo() {
        videowindow.postMessage({"type": "src", "data": vdata[currentvideo].video});
        if('caption' in vdata[currentvideo]) {
            document.querySelector("#captioncont").innerHTML = vdata[currentvideo].caption;
        } else {
            document.querySelector("#captioncont").innerHTML = vdata[currentvideo].name;
        }
    }

    $(() => {
        playvideo();
        document.getElementById("beginning").onclick = () => {
            currentvideo = 0;
            playvideo();
        }
        document.getElementById("end").onclick = () => {
            currentvideo = vdata.length - 1;
            playvideo();
        }
        document.getElementById("forward").onclick = () => {
            if (currentvideo < vdata.length - 1) {
                currentvideo++;
                playvideo();
            }
        }
        document.getElementById("back").onclick = () => {
            if (currentvideo > 0) {
                currentvideo--;
                playvideo();
            }
        }
        document.getElementById("playpause").onclick = () => {
            videowindow.postMessage({"type": "playpause"})
        }
    })
    // reveal buttons
    document.querySelector("#charcont").classList.remove("d-none")
}).catch(err => {
    console.error(err);
    document.querySelector("#captioncont").innerHTML = "<i class=\"fas fa-exclamation-triangle\"></i>" +
        err.toString();
});

function refreshtooltips() {
    // really ugly without jquery
    // activate tooltips

    // tooltips persist if element is removed (like undo button), remove all existing tooltips for this reason
    document.querySelectorAll(".tooltip").forEach((item) => {
        item.remove();
    });
    // based on bootstrap docs code to activate all tooltips based on attrs
    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            placement: "top",
            customClass: "char-tooltip"
        })
    });
}

// initially activate tooltips
$(() => refreshtooltips());
