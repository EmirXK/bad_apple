let wakeLock = null;

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock: Active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release().then(() => {
            wakeLock = null;
            console.log('Wake Lock: Released');
        });
    }
}

fetch('framesData.lz')
    .then(response => response.text())
    .then(data => {
        const decompressedData = LZString.decompressFromBase64(data); // Decompress the fetched data
        
        // Ensure it is parsed as an array
        const framesData = JSON.parse(decompressedData); // Parse the JSON to get the array
        initializeAnimation(framesData); // Call your initialization function
    })
    .catch(error => console.error('Error fetching framesData.lz:', error));

function initializeAnimation(framesData) {
    const frameCount = framesData.length;  // Total number of frames
    const fps = 30;  // Frames per second
    const frameDuration = 1000 / fps;  // Duration of each frame in milliseconds
    const asciiDisplay = document.getElementById('ascii-display');
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-button');
    let currentFrame = 0;

    // 4:3 aspect ratio dimensions
    const aspectRatio = 4 / 3;

    // Function to adjust the size of the ASCII display while maintaining aspect ratio
    function adjustDisplaySize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Set the width and height based on the aspect ratio
        let displayWidth = windowWidth;
        let displayHeight = windowWidth / aspectRatio;

        // If the height exceeds the window height, adjust accordingly
        if (displayHeight > windowHeight) {
            displayHeight = windowHeight;
            displayWidth = displayHeight * aspectRatio;
        }

        // Adjust font size based on the calculated display size
        const fontSize = displayWidth / 62;  // Adjust this value to fine-tune the size
        asciiDisplay.style.fontSize = `${fontSize}px`;
    }

    // Call the function initially and on window resize
    adjustDisplaySize();
    window.addEventListener('resize', adjustDisplaySize);

    // Play the animation when the button is clicked
    playButton.addEventListener('click', () => {
        // Disable the play button to prevent further clicks
        playButton.disabled = true;
        
        // Hide the play button visually
        playButton.style.display = 'none';  
        
        requestWakeLock(); // Request the wake lock when animation starts
    
        // Pre-load the audio without playing it (this satisfies iOS's interaction requirement)
        audioPlayer.load(); 
    
        // Set a timeout to start both audio and animation simultaneously
        setTimeout(() => {
            audioPlayer.play();  // Play the audio after the delay
            playAnimation();  // Start the animation after the same delay
        }, 250);  // Delay both for sync
    });
    
    // Function to play the animation
    function playAnimation() {
        const startTime = performance.now();

        function renderFrame() {
            const elapsedTime = performance.now() - startTime;
            const expectedFrame = Math.floor(elapsedTime / frameDuration);

            // Check if expectedFrame is within bounds of framesData
            if (expectedFrame < framesData.length) {
                const asciiFrame = framesData[expectedFrame];  // Get the frame from the array
                asciiDisplay.textContent = asciiFrame.replace(/\\n/g, '\n');  // Replace '\n' with actual newlines
                currentFrame = expectedFrame;
            } else {
                // Stop the animation after the last frame
                asciiDisplay.textContent = framesData[framesData.length - 1].replace(/\\n/g, '\n');  // Display the last frame
                releaseWakeLock(); // Release the wake lock after the last frame
                return; // Exit the function to stop rendering
            }

            requestAnimationFrame(renderFrame);  // Continue animation loop
        }

        renderFrame();  // Start rendering the frames
    }

    // Release the wake lock when the page is hidden or when exiting fullscreen
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            releaseWakeLock();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            releaseWakeLock();
        }
    });
}
