

// var snd2  = new Audio();
// var src2  = document.createElement("source");
// src2.type = "audio/mpeg";
// src2.src  = "audio/(TESBIHAT).mp3";
// snd2.appendChild(src2);

// snd2.play(); // Now both will play at the same time

// playBeat("audio/piano_A3.ogg", 5000);
// playBeat("audio/piano_A3_sharp.ogg", 5200);
// playBeat("audio/piano_A4.ogg", 5400);
// playBeat("audio/piano_A4_sharp.ogg", 5600);
// playBeat("audio/piano_A3.ogg", 5800);


var count = 10;
// var i = 0;
var currtime = new Date().getTime();

for(var i = 0; i < count; i++) {  
   var now = new Date().getTime();
   //playBeat("audio/piano_A3.ogg", now - currtime);
   // playBeat("audio/piano_A4.ogg", count + 200);
   count += 400;
}

function playBeat(name, offset) {
	setTimeout(function() {
		console.log("going to play: " + name);
		var snd1  = new Audio();
		var src1  = document.createElement("source");
		src1.type = "audio/ogg";
		src1.src  = name;
		snd1.appendChild(src1);
		snd1.play();
	}, offset);
}