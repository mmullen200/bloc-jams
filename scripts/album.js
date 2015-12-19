var setSong = function(songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    // assigns a new Buzz sound object. Passed the audio file via the audioUrl property on the currentSongFromAlbum object
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        //formats and preload are the properties. formats is an array of strings with acceptabe audio formats. The "true" setting means we want the mp3s to load as soon as the page loads.
        
        //This is a settings object with two properties, formats and preload. Setting the preload property to true tells Buzz we want the mp3s loaded as soon as the page loads.
        formats: [ 'mp3' ],
        preload: true
    });
    
    setVolume(currentVolume);
};


// With this function, if we click a place on the seek bar, then we will move to the corresponding place in the song. Click, the middle of the seek bar, and we will skip to the middle of the song. It uses the Buzz setTime() method
var seek = function(time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
    
};

var getSongNumberCell = function(number) {
    return $('.song-item-number[data-song-number="' + number + '"]');
}

var createSongRow = function (songNumber, songName, songLength) {
    var template=
        '<tr class="album-view-song-item">'
    +       '   <td class="song-item-number" data-song-number ="' + songNumber + '">' + songNumber + '</td>'
    +       '   <td class="song-item-title">' + songName + '</td>'
    +       '   <td class="song-item-duration">' + songLength + '</td>'
    +   '</tr>'
    ;
    
    var $row = $(template);
    
    var clickHandler = function() {
        // .attr() gets the value of an attribute for the first element in the set of matched elements.
        var songNumber = parseInt($(this).attr('data-song-number'));
        
        if (currentlyPlayingSongNumber !== null) {
            // revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            // switch from  Play -> Pause button to indicate new song is playing
            setSong(songNumber);
            currentSoundFile.play();
            updateSeekBarWhileSongPlays();
            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            
            var $volumeFill = $('.volume .fill');
            var $volumeThumb = $('.volume .thumb');
            $volumeFill.width(currentVolume + '%');
            $volumeThumb.css({left: currentVolume + '%'});
            
            $(this).html(pauseButtonTemplate);
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            // Buzz's isPaused() method checks if the song is paused or not
            if (currentSoundFile.isPaused()){
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
            }
        }
    };
    
    var onHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
        }
        
    };
    
    var offHover = function(event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));
        console.log("songNumber type is " + typeof songNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
        
        if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
        }
        
    };
    
    // find() method called here to find the element with the .song-item-number class that's contained in whichever row is clicked.
    $row.find('.song-item-number').click(clickHandler);
    // hover() event listener combines mouseover and mouseleave functions we were using before. First argument is a callback that executes when the user mouses over the $row element and the second is a callback executed when the mouse leaves $row
    $row.hover(onHover, offHover);
    
    return $row;
};

var setCurrentAlbum = function(album) {
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.name);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for (i = 0; i < album.songs.length; i++){
        var $newRow = createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
        $albumSongList.append($newRow);
        
    }
    
};

var setCurrentTimeInPlayerBar = function(currentTime) {
	var $currentTimeElement = $('.seek-control .current-time');
	$currentTimeElement.text(currentTime);
	
};

var setTotalTimeInPlayerBar = function(totalTime) {
	
	var $totalTimeElement = $('.seek-control .total-time');
	$totalTimeElement.text(totalTime);

};

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // timeupdate is a custom Buzz event that fires repeatedly during song playback. We bind this event to currentSoundFile
        currentSoundFile.bind('timeupdate', function() {
            // Buzz's getTime() method gets the current time of the song and the getDuration() gets the total length of the song
            var currentTime = this.getTime();
            var seekBarFillRatio = currentTime / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(filterTimeCode(currentTime));
        });
    }
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
    //multiply by 100 to get a percentage
    var offsetXPercent = seekBarFillRatio * 100;
    
    // Built-in Javascript functions ensure that the percentage is >= 0 and <= 100.
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    // Here we convert the percentage to a string and add the % symbol.
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

// The following function is designed to work for all seek bars
var setupSeekBars = function() {
    var $seekBars = $('.player-bar .seek-bar');
    
    $seekBars.click(function(event) {
        // pageX is a jQuery-specific event value which holds the X, horizontal, coordinate at which the event occurred. We subtract the offset, or the distance from the left edge of the page to the beginning of the seek bar
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // This gives us the percentage of the bar that has filled
        var seekBarFillRatio = offsetX / barWidth;
        
        // Checks the class of the seek bar's parent: Is it changing the volume or seeking the song position? If it's the playback seek bar, seek to the position of the song determined by seekBarFillRatio. Otherwise, set volume based on seekBarFillRatio
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }
        
        
        updateSeekPercentage($(this), seekBarFillRatio);
    });
    

$seekBars.find('.thumb').mousedown(function(event){
    // when an event handler fires, the context of the event (`this`) is equal to the node that fired the event. In this instance, that is the `.thumb` which is inside of the seekbar. `$(this)` wraps the `.thumb` node in jQuery. The `parent()` call returns the immediate parent node of the node. Which in this case is the seekbar.
    var $seekBar = $(this).parent();
    
    //mousemove is attached to document so we can drag the thumb anytime the mouse is pressed. Otherwise, we would have to carefully put the mouse on the seekbar to get it to move. This makes for a better use experience.
    $(document).bind('mousemove.thumb', function(event){
        var offsetX = event.pageX - $seekBar.offset().left;
        var barWidth = $seekBar.width();
        var seekBarFillRatio = offsetX / barWidth;
        
        updateSeekPercentage($seekBar, seekBarFillRatio);
    });
    // .thumb in this case is an example of namespacing, not to be confused with the .thumb class. If we ever attach another event listener for the mousemove event, the seek bar will only move if we also include this .thumb string
    $(document).bind('mouseup.thumb', function() {
        $(document).unbind('mousemove.thumb');
        $(document).unbind('mouseup.thumb');
        
        });
    });
    
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var nextSong = function() {
    
   
    var getLastSongNumber = function(index) {
        return index == 0 ? currentAlbum.songs.length : index;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    
    //This next conditional says that, if currentSongIndex has a value higher than the number of tracks on the album, then it will revert to index 0. So it wraps around to the first song.
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    
    //Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var filterTimeCode = function (timeInSeconds) {
    var seconds = Number.parseFloat(timeInSeconds);
    var wholeSeconds = Math.floor(seconds);
    var minutes = Math.floor(wholeSeconds / 60);
    var remainingSeconds = wholeSeconds % 60;
    
    var output = minutes + ':';
    
    if (remainingSeconds < 10) {
        output += '0';
    }
    
    output += remainingSeconds;
    
    return output;
    
    
    /*
    var secondsFloat = parseFloat(timeInSeconds);
    var minutes = Math.floor(secondsFloat / 60);
    var seconds = secondsFloat - (minutes * 60);

    
    var timeInMinutes = seconds / 60; // 2.5
    var timeParts = timeInMinutes.split(".");
    var minutes = timeParts[0];
    var seconds = Math.floor(timeParts[1] * 60);
    */
    
    
    
};

var previousSong = function() {
    
    var getLastSongNumber = function(index) {
        return index == (currentAlbum.songs.length - 1) ? 1 : index + 2;
    };
    
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    
    currentSongIndex--;
    
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    
    // Set a new current song
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    updatePlayerBarSong();
    
    
    // Update the Player Bar information
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.name);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    var lastSongNumber = getLastSongNumber(currentSongIndex);
    var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
    var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
    
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.name);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);
    // The below line updates the HTML of the play/pause button to the content of playerBarPauseButton
    $('.main-controls .play-pause').html(playerBarPauseButton);
    
    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.length));
};




// album button templates
var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

// The variables below are in the global scope, hold current song and album information

var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
    
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    
});