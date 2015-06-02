

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

/*
TODO- need JQuery on ready scripts to go here
TODO- create the post routes from android to web app
TODO- create the song document and link the user document to it
TODO- http request scripts from here

THIS IS THE AUDIO PLAYER FILE TO PLAY THE NECESSARY BEATS... 
the stuff coming in from the android application will be in JSON from an HTTP Post
and it will be converted to this kind of format

each song document will be organized to such a format that we can pull via an HTTP request to the same server

{
   "user": String,
   "jam_title": String,
   "data": [ // the information for each song
   {
	 "sound": String,    // the note or beat name
	 "offset": Number // the offset amount of milliseconds from the time the note was played 
   },
   {
	...
   }
   ]	
}


*/

$(document).ready(function() {
	var username  = $('#hidden_username').text();
	// console.log("username: " + username);
	var allUserJams = [];
	getJams(username);

	function getJams(user) {
		$.get("listjam/" + username, function(data) {
			// console.log("GOT DATA: " + data);
			allUserJams = JSON.parse(data);
			playSong("MyJam TEST5");
		});
	}
	$(".jam_item").click(function() {
		// console.log( "asdf: " + );
		playSong($.trim($(this).text()));
	})

	function playSong(song_title) {
		var song_data = [];
		allUserJams.forEach(function(data) {
			// console.log("data songtitle: " + data.song_title + " song: " + song_title);
			if(data.song_title === song_title) {
				console.log("MATCH FOUND FOR : " + song_title);
				song_data = data.data;
			}
		});
		if(song_data.length === 0) { console.log("song empty or not foudn"); return; }

		console.log("data: " + JSON.stringify(song_data, null , '\t'));

		var current_offset = 0;
		var offset_arr = [];
		for(var i = 0; i < song_data.length; i++) {
			console.log("playing beat at: " + (song_data[i].offset - current_offset));
			offset_arr.push({
				sound: song_data[i].sound,
				offset: song_data[i].offset - current_offset
			})
			current_offset = song_data[i].offset;
		}
		var index = 0;
		playBeat(index, offset_arr[0].sound, offset_arr[0].offset, offset_arr);

	}

	function playBeat(index, name, offset, arr) {
		console.log("playing at offset: " + offset);
		setTimeout(function() {
			
			name = "audio/" + name;
			console.log("going to play: " + name + " index: " + index);
			var snd1  = new Audio();
			var src1  = document.createElement("source");
			src1.type = "audio/ogg";
			src1.src  = name;
			snd1.appendChild(src1);
			snd1.play();

			if(index+1 >= arr.length) return;
			playBeat(index+1, arr[index+1].sound, arr[index+1].offset, arr);
		}, offset);
	}

})

