document.addEventListener('DOMContentLoaded', function () {

    // References to all the element we will need.
    let video = document.querySelector('#camera-stream'),
        image = document.querySelector('#snap'),
        start_camera = document.querySelector('#start-camera'),
        controls = document.querySelector('.controls'),
        take_photo_btn = document.querySelector('#take-photo'),
        delete_photo_btn = document.querySelector('#delete-photo'),
        download_photo_btn = document.querySelector('#download-photo'),
        error_message = document.querySelector('#error-message');


    const constraints = {
        video: {
            width: {
                min: 1280,
                ideal: 1920,
                max: 2560,
            },
            height: {
                min: 720,
                ideal: 1080,
                max: 1440
            },
            facingMode: 'environment'
        }
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            //video.src = window.URL.createObjectURL(stream);
            video.srcObject = stream;
            video.play();

            video.onplay = function () {
                showVideo();
            };
        });
    } else {
        displayErrorMessage("Your browser doesn't have support for the HTML5 Camera.");
    }


    function takeExifSpanShot() {
        let zerothIfd = {};
        let exifIfd = {};
        let gpsIfd = {};
        zerothIfd[piexif.ImageIFD.Make] = "Maker Name";
        zerothIfd[piexif.ImageIFD.XResolution] = [777, 1];
        zerothIfd[piexif.ImageIFD.YResolution] = [777, 1];
        zerothIfd[piexif.ImageIFD.Software] = "Piexifjs";
        exifIfd[piexif.ExifIFD.DateTimeOriginal] = "2010:10:10 10:10:10";
        exifIfd[piexif.ExifIFD.LensMake] = "Lens Maker";
        exifIfd[piexif.ExifIFD.Sharpness] = 777;
        exifIfd[piexif.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];
        gpsIfd[piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
        gpsIfd[piexif.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";

        let lat = 59.43553989213321;
        let lng = 24.73842144012451;
        gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
        gpsIfd[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
        gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
        gpsIfd[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lng);

        let exifObj = {"0th": zerothIfd, "Exif": exifIfd, "GPS": gpsIfd};

        // get exif binary as "string" type
        let exifBytes = piexif.dump(exifObj);


        let hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        let width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);
        }


        // get JPEG image from canvas
        let jpegData = hidden_canvas.toDataURL("image/jpeg", 1.0);

        // insert exif binary into JPEG binary(DataURL)
        return piexif.insert(exifBytes, jpegData);
    }


    // Mobile browsers cannot play video without user input,
    // so here we're using a button to start it manually.
    start_camera.addEventListener("click", function (e) {

        e.preventDefault();

        // Start video playback manually.
        video.play();
        showVideo();
    });


    take_photo_btn.addEventListener("click", function (e) {

        e.preventDefault();

        let snap = takeSnapshot();

        // Show image. 
        image.setAttribute('src', snap);
        image.classList.add("visible");

        // Enable delete and save buttons
        delete_photo_btn.classList.remove("disabled");
        download_photo_btn.classList.remove("disabled");

        // Set the href attribute of the download button to the snap url.
        download_photo_btn.href = snap;

        // Pause video playback of stream.
        video.pause();
    });


    delete_photo_btn.addEventListener("click", function (e) {

        e.preventDefault();

        // Hide image.
        image.setAttribute('src', "");
        image.classList.remove("visible");

        // Disable delete and save buttons
        delete_photo_btn.classList.add("disabled");
        download_photo_btn.classList.add("disabled");

        // Resume playback of stream.
        video.play();
    });


    function showVideo() {
        // Display the video stream and the controls.
        hideUI();
        video.classList.add("visible");
        controls.classList.add("visible");
    }


    function takeSnapshot() {
        // Here we're using a trick that involves a hidden canvas element.  


        return takeExifSpanShot();


        /*let hidden_canvas = document.querySelector('canvas'),
            context = hidden_canvas.getContext('2d');

        let width = video.videoWidth,
            height = video.videoHeight;

        if (width && height) {

            // Setup a canvas with the same dimensions as the video.
            hidden_canvas.width = width;
            hidden_canvas.height = height;

            // Make a copy of the current frame in the video on the canvas.
            context.drawImage(video, 0, 0, width, height);

            // Turn the canvas image into a dataURL that can be used as a src for our photo.
            return hidden_canvas.toDataURL('image/png');
        }*/
    }


    function displayErrorMessage(error_msg, error) {
        error = error || "";
        if (error) {
            console.error(error);
        }

        error_message.innerText = error_msg;

        hideUI();
        error_message.classList.add("visible");
    }


    function hideUI() {
        // Helper function for clearing the app UI.
        controls.classList.remove("visible");
        start_camera.classList.remove("visible");
        video.classList.remove("visible");
        snap.classList.remove("visible");
        error_message.classList.remove("visible");
    }
});
