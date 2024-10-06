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

    // Hide mouse cursor after inactivity
    let mouseMoveTimeout;
    document.body.style.cursor = 'default';  // Show cursor by default

    function hideCursor() {
        document.body.style.cursor = 'none';  // Hide cursor
    }

    function resetCursorTimeout() {
        document.body.style.cursor = 'default';  // Show cursor on activity
        clearTimeout(mouseMoveTimeout);  // Clear previous timeout
        mouseMoveTimeout = setTimeout(hideCursor, 3000);  // Hide cursor after 3 seconds of inactivity
    }

    document.addEventListener('mousemove', resetCursorTimeout);
    resetCursorTimeout();  // Set initial cursor hiding behavior

    // Fullscreen function
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        }
    }

    // Play the animation when the button is clicked
    playButton.addEventListener('click', () => {
        playButton.style.display = 'none';  // Hide the play button
        toggleFullscreen();  // Go fullscreen
        setTimeout(playAnimation, 1000);  // Delay animation start by 1 second
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
                return; // Exit the function to stop rendering
            }

            requestAnimationFrame(renderFrame);  // Continue animation loop
        }

        audioPlayer.play();  // Start the audio
        renderFrame();  // Start rendering the frames
    }
}
