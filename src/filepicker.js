let dropArea;
let root = document.documentElement;

// register event listeners related to drag-and-drop file uploading


function noelectron() {
    bootbox.alert({
        title: "<i class=\"fas fa-exclamation-triangle\"></i> Cannot access electron!",
        closeButton: false,
        centerVertical: true,
        message: "You're seeing this error message because the renderer process (this window) is unable to communicat" +
            "e with Electron's main process. Ensure you're running this using electron, not in your browser.",
        callback: noelectron
    });
}

document.addEventListener("DOMContentLoaded", function (event) {
    if (!window.electron) {
        noelectron();
    }
    dropArea = document.getElementById('dropzone');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    });
    dropArea.addEventListener('drop', handleDrop, false)
    document.querySelector('#choosefile').addEventListener("change", handleSelect);
});

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

// highlight class if file is hovering over the window, actual effects of this are css only
function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

function handleSelect(e) {
    // redirect file uploads (not drag-n-drop) to the file function
    handleFileUpload(e.target.files);
}

function handleDrop(e) {
    // redirect file drops to the file function
    handleFileUpload(e.dataTransfer.files);
}

// const {ipcRenderer} = require('electron');

function handleFileUpload(filelist) {
    // perform basic validation on the file upload
    if (filelist.length > 1) { // only possible with drag and drop
        document.querySelector("#error-message").innerHTML = "Too many files!";
        errorshake();
        return
    }
    if (filelist.length < 1) { // i think hitting cancel on the file choose dialog can do this?
        document.querySelector("#error-message").innerHTML = "Too few files!";
        errorshake();
        return
    }
    // filelist.length == 1
    let file = filelist[0];
    // set some animations, next validation is done on the main process and can take a couple seconds
    document.querySelector("#upload-icon").innerHTML = "<i class=\"fad fa-spinner-third fa-9x fa-spin\"></i>";
    document.querySelector("#choose-text").innerHTML = "Validating files...";
    document.querySelector("#error-message").innerHTML = "";
    document.querySelector("#dropzone").style.animationDuration = "0.1s";
    // API exposed by preload.js for communicating with the main process. cases where it isnt declared could be in a
    // browser if someone tries to run the source that way or if some error occured.
    if (window.electron) {
        // calls getvideodata() from index.js
        window.electron.ipcinvoke("check", file.path).then((reply) => {
            window.location = `app.html?file=${encodeURIComponent(file.path)}`;
        }).catch(err => {
            console.error(err)
            document.querySelector("#error-message").innerHTML = err.toString();
            errorshake();
        });
    } else {
        document.querySelector("#error-message").innerHTML = "Unable to access electron.";
        errorshake();
    }

}


function errorshake() {
    // reset changes made by handleFileUpload()
    document.querySelector("#upload-icon").innerHTML = "<i class=\"fas fa-upload fa-9x\"></i>";
    document.querySelector("#choose-text").innerHTML = "Choose a file.";
    document.querySelector("#dropzone").style.animationDuration = null;
    // play animation
    let cl = document.querySelector("#shake-holder");
    cl.classList.add("error-shake");
    // restart animation
    cl.style.animation = 'none';
    cl.offsetHeight; //trigger reflow
    cl.style.animation = null;
}


