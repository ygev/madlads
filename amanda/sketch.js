// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using MobileNet and p5.js
This example uses a callback pattern to create the classifier
=== */

let classifier;
let video;
// Create a new p5.speech object
// You can also control the Language, Rate, Pitch and Volumn of the voice
// Read more at http://ability.nyu.edu/p5.js-speech/
const myVoice = new p5.Speech();
let input = [];
let prev;
let finalString = "";
let see;
function preload() {
  //my table is comma separated value "csv"
  //and has a header specifying the columns labels
  table = loadTable("madlibs.csv", "csv");
}

function setup() {
  noCanvas();
  // Create a camera input
  video = createCapture({
    video: {
      facingMode: "environment"
    }
  });
  video.size(windowWidth, windowHeight);

  // Initialize the Image Classifier method with MobileNet and the video as the second argument
  classifier = ml5.imageClassifier("MobileNet", video, modelReady);
}

function draw() {
  see = document.getElementById("result").innerText.split(",");

  let numOfInput = table.getColumnCount() - 1;

  confirmButton = document.getElementById("confirm");

  let probability = document.getElementById("probability").innerText;

  //when the model sees new things

  if (
    see[0] != "..." &&
    see[0] != prev &&
    input.length < numOfInput &&
    probability > 0.55
  ) {
    myVoice.setVolume(1.0);
    myVoice.speak("I see" + see[0]);

    prev = see[0];

    //when confirm is pressed, add a new input
    confirmButton.onclick = function() {
      if (see[0] != "...") {
        myVoice.setVolume(0);

        input.push(see[0]);

        confirmPage = createDiv(" ");
        confirmPage.id("newpage");

        itemNum = createDiv(input.length + "/" + numOfInput);
        itemNum.id("itemNum");

        objectName = createDiv(see[0]);
        objectName.id("objectName");

        nextButton = createButton("Next");
        nextButton.id("nextButton");

        vidEle = select("video");
        vidEle.hide();

        retake = createDiv("Retake");
        retake.id("retake");

        document.getElementById("retake").onclick = function() {
          input.splice(-1, 1);
          vidEle = select("video");
          vidEle.show();
          confirmPage.remove();
          itemNum.remove();
          objectName.remove();
          nextButton.remove();
          retake.remove();
        };

        document.getElementById("nextButton").onclick = function() {
          vidEle = select("video");
          vidEle.show();
          confirmPage.remove();
          itemNum.remove();
          objectName.remove();
          nextButton.remove();
          retake.remove();

          if (input.length == numOfInput) {
            madlibsPage = createDiv(" ");
            madlibsPage.id("madlibsPage");

            vidEle = select("video");
            vidEle.hide();

            yourMad = createDiv("Your Mad Libs");
            yourMad.id("your-mad");

            again = createDiv("Play Again");
            again.id("again");

            finalString += table.getString(0, 0);

            var first = createSpan(finalString);
            first.parent(document.getElementById("final-madlib"));
            let i = 0;
            for (var c = 1; c < table.getColumnCount(); c++) {
              finalString += input[i] + table.getString(0, c);

              var bold = createElement("span", input[i]);
              bold.parent(document.getElementById("final-madlib"));

              bold.addClass("bold");
              var regs = createElement("span", table.getString(0, c));
              regs.parent(document.getElementById("final-madlib"));

              i++;
            }
            noLoop();
          }
        };
      }
    };
  }
}

function modelReady() {
  // Change the status of the model once its ready
  //select("#status").html("Model Loaded");
  // Call the classifyVideo function to start classifying the video
  classifyVideo();
}

// Get a prediction for the current video frame
function classifyVideo() {
  classifier.classify(gotResult);
}

// When we get a result
function gotResult(err, results) {
  // The results are in an array ordered by confidence.
  if (nf(results[0].confidence, 0, 2) > 0.55) {
    let see = results[0].label.split(",");
    select("#result").html(see[0]);
    select("#probability").html(nf(results[0].confidence, 0, 2));
  } else {
    select("#result").html("...");
    select("#probability").html(" ");
  }
  classifyVideo();
}
