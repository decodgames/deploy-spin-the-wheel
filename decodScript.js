loadGame();

function submitUserDetails() {
    const username = document.getElementById('username').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const usernameError = document.getElementById('username-error');
    const mobileError = document.getElementById('mobile-error');

    usernameError.textContent = "";
    mobileError.textContent = "";

    let isValid = true;

    if (!username) {
        usernameError.textContent = "Please enter your name.";
        isValid = false;
    }

    // Validate mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
        mobileError.textContent = "Please enter a valid 10-digit mobile number.";
        isValid = false;
    }

    // If the form is valid, proceed with submission
    if (isValid) {
        localStorage.setItem("username", username);
        localStorage.setItem("mobile", mobile);
        hideUserDetailsForm();
    }


};


function hideUserDetailsForm() {
    const userDetailContainer = document.getElementById('user-details-form');
    const canvasElement = document.getElementById('canvas');
    userDetailContainer.style.display = 'none';
    canvasElement.style.display = 'block';
}

function loadGame() {
    // Now load the game
    const GODOT_CONFIG = {
        "args": [],
        "canvasResizePolicy": 2,
        "ensureCrossOriginIsolationHeaders": true,
        "executable": "index",
        "experimentalVK": false,
        "fileSizes": { "index.pck": 309312, "index.wasm": 43016933 },
        "focusCanvas": true,
        "gdextensionLibs": []
    };
    const GODOT_THREADS_ENABLED = false;
    const engine = new Engine(GODOT_CONFIG);

    (function () {
        const statusOverlay = document.getElementById('status');
        const statusProgress = document.getElementById('status-progress');
        const statusNotice = document.getElementById('status-notice');

        let initializing = true;
        let statusMode = '';

        function setStatusMode(mode) {
            if (statusMode === mode || !initializing) {
                return;
            }
            if (mode === 'hidden') {
                statusOverlay.remove();
                initializing = false;
                return;
            }
            statusOverlay.style.visibility = 'visible';
            statusProgress.style.display = mode === 'progress' ? 'block' : 'none';
            statusNotice.style.display = mode === 'notice' ? 'block' : 'none';
            statusMode = mode;
        }

        function setStatusNotice(text) {
            while (statusNotice.lastChild) {
                statusNotice.removeChild(statusNotice.lastChild);
            }
            const lines = text.split('\n');
            lines.forEach((line) => {
                statusNotice.appendChild(document.createTextNode(line));
                statusNotice.appendChild(document.createElement('br'));
            });
        }

        function displayFailureNotice(err) {
            console.error(err);
            if (err instanceof Error) {
                setStatusNotice(err.message);
            } else if (typeof err === 'string') {
                setStatusNotice(err);
            } else {
                setStatusNotice('An unknown error occurred');
            }
            setStatusMode('notice');
            initializing = false;
        }

        const missing = Engine.getMissingFeatures({
            threads: GODOT_THREADS_ENABLED,
        });

        if (missing.length !== 0) {
            const missingMsg = 'Error\nThe following features required to run Godot projects on the Web are missing:\n';
            displayFailureNotice(missingMsg + missing.join('\n'));
        } else {
            setStatusMode('progress');
            engine.startGame({
                'onProgress': function (current, total) {
                    if (current > 0 && total > 0) {
                        statusProgress.value = current;
                        statusProgress.max = total;
                    } else {
                        statusProgress.removeAttribute('value');
                        statusProgress.removeAttribute('max');
                    }
                },
            }).then(() => {
                setStatusMode('hidden');
            }, displayFailureNotice);
        }
    }());
}