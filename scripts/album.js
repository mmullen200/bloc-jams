var albumPicasso = {
    name: 'The Colors',
    artist: 'Pablo Picasso',
    label: 'Cubism',
    year: '1881',
    albumArtURL: 'assets/images/album_covers/01.png',
    songs:[
        {name: 'Blue', length: '4:26'},
        {name: 'Green', length: '3:14'},
        {name: 'Red', length: '5:01'},
        {name: 'Pink', length: '3:21'},
        {name: 'Magenta', length: '2:15'}
        
    ]
    
};

var albumMarconi = {
    name: 'The Telephone',
    artist: 'Guglielmo Marconi',
    label: 'EM',
    year: '1909',
    albumArtURL: 'assets/images/album_covers/20.png',
    songs: [
        {name: 'Hello, Operator?', length: '1:01'},
        { name: 'Ring, ring, ring', length: '5:01' },
        { name: 'Fits in your pocket', length: '3:21'},
        { name: 'Can you hear me now?', length: '3:14' },
        { name: 'Wrong phone number', length: '2:15'}
        
    ]
    
};

var albumBobsBurgers = {
    name: 'Extra Cheese',
    artist: 'Bob & Family',
    label: 'Small-Time Records',
    year: '2015',
    albumArtURL: 'assets/images/album_covers/11.png',
    songs: [
        {name: 'Limburger Hop', length: '2:02'},
        {name: 'Captain Double Beefheart', length: '3:03'},
        {name: 'Feelin Swiss Cheesy', length: '4:04'},
        {name: 'Lettuce Dance', length: '5:05'},
        {name: 'Why You Grillin Me?', length: '6:06'}
    
    ]
    
    
};

var createSongRow = function (songNumber, songName, songLength) {
    var template=
        '<tr class="album-view-song-item">'
    +       '   <td class="song-item-number">' + songNumber + '</td>'
    +       '   <td class="song-item-title">' + songName + '</td>'
    +       '   <td class="song-item-duration">' + songLength + '</td>'
    +   '</tr>'
    ;
    
    return template;
    
};

    var albumTitle = document.getElementsByClassName('album-view-title')[0];
    var albumArtist = document.getElementsByClassName('album-view-artist')[0];
    var albumReleaseInfo = document.getElementsByClassName('album-view-release-info')[0];
    var albumImage = document.getElementsByClassName('album-cover-art')[0];
    var albumSongList = document.getElementsByClassName('album-view-song-list')[0];

var setCurrentAlbum = function(album) {
    
    
    albumTitle.firstChild.nodeValue = album.name;
    albumArtist.firstChild.nodeValue = album.artist;
    albumReleaseInfo.firstChild.nodeValue = album.year + ' ' + album.label;
    albumImage.setAttribute('src', album.albumArtURL);
    
    albumSongList.innerHTML = '';
    
    for (i = 0; i < album.songs.length; i++){
        albumSongList.innerHTML += createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
        
    }
    
};



window.onload = function () {
    
    setCurrentAlbum(albumPicasso);
    var albums = [albumPicasso, albumMarconi, albumBobsBurgers];
    var index = 1;
    albumImage.addEventListener("click", function(event){
        setCurrentAlbum(albums[index]);
        index++;
        if (index == albums.length){
            index = 0;
        }
    });
};