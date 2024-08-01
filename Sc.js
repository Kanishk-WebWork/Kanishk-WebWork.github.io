let currtype;
let currfolder;
let currentSong = new Audio();
let songs = [];
const baseURL = 'https://xrhkmdk7rgnnskpv5qzngg.on.drv.tw/www.Soundflare.com/';

// Fetch JSON data from songs.json
async function fetchJSON(url) {
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
    }
    return await response.json();
}

function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}

function convertLink(link) {
    const fileId = link.match(/[-\w]{25,}/);
    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId[0]}`;
    }
    return link; // Return the original link if it doesn't match the expected format
}

function playMusic(track, pause = false) {
    track = `${track}/preview`;
    if (!track) {
        console.error('No track provided.');
        return;
    }
    currentSong.src = track;
    if (!pause) {
        currentSong.play();
        play.src = `Assets/pause.svg`;
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split('/').slice(-1)[0].slice(0, -4);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function getSongs(type, folder) {
    currfolder = folder;
    currtype = type;

    try {
        let data = await fetchJSON(`Songs.json`);
        let albumData = data.Artists[folder];
        songs = albumData.songs.map(song => song.url);

        // Update the UI
        updateSongListUI(albumData.songs);

        return songs;

    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

function updateSongListUI(songList) {
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songList) {
        let songURL = song.url;
        songUL.innerHTML += `<li>
            <img class="invert" src="${songURL}" alt="">
            <div class="info"><div>${song.name}</div></div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="${baseURL}Assets/playsong.svg" alt="">
            </div>
        </li>`;
    }

    document.querySelectorAll(".songlist li").forEach(e => {
        e.querySelector(".playnow img").addEventListener("click", () => {
            const songName = e.querySelector(".info div").textContent.trim();
            const song = songList.find(s => s.name === songName);
            if (song) playMusic(song.url);
        });
    });
}

async function displayAlbums(type) {
    try {
        let data = await fetchJSON(`Songs.json`);
        let cardContainer = document.querySelector(`.${type.toLowerCase()}`);
        cardContainer.innerHTML = "";

        for (let artist in data.Artists) {
            let albumInfo = data.Artists[artist];
            albumInfo.cover = albumInfo.cover;
            albumInfo.songs.forEach(song => {
                song.url = song.url;
            });
            cardContainer.innerHTML += `<div data-folder="${artist}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true"
                        viewBox="0 0 24 24" style="fill: black; width: 24px; height: 24px;">
                        <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                        </path>
                    </svg>
                </div>
                <img src="${albumInfo.cover}" alt="Playlist">
                <h3>${artist}</h3>
            </div>`;
        }

        cardContainer.querySelectorAll(".card").forEach(e => {
            e.addEventListener("click", cardClickHandler);
        });

        function cardClickHandler(e) {
            const folder = e.currentTarget.dataset.folder;
            getSongs(type, folder).then(songs => {
                // playMusic(songs[0]); // Play the first song in the list by default
            });
        }

    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

function setupEventListeners() {
    displayAlbums("Artists");
    getSongs("Artists", "Cumbia Deli");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = `Assets/pause.svg`;
        } else {
            currentSong.pause();
            play.src = `Assets/playsong.svg`;
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
        document.querySelector(".left").style.opacity = 1;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -110 + "%";
        document.querySelector(".left").style.opacity = 0;
    });

    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if (currentIndex === -1) {
            console.warn('Current song is not in the list of songs.');
            return;
        }
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        } else {
            playMusic(currentSong.src);
        }
    });
    
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src);
        if (currentIndex === -1) {
            console.warn('Current song is not in the list of songs.');
            return;
        }
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1]);
        } else {
            currentSong.pause();
            play.src = `Assets/playsong.svg`;
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 1;
            document.querySelector(".range input").value = 100;
        }
    });

    document.querySelectorAll(".menu a").forEach(e => {
        e.addEventListener("click", (event) => {
            let category = event.target.innerText.trim().toLowerCase();
            document.querySelector(".songs").classList.add("hidden");
            document.querySelector(".albums").classList.remove("hidden");

            document.querySelectorAll(".albums > div").forEach(div => div.classList.add("hidden"));
            document.querySelector(`.${category}`).classList.remove("hidden");
        });
    });

    document.querySelectorAll(".album-header .back img").forEach(e => {
        e.addEventListener("click", () => {
            document.querySelector(".songs").classList.remove("hidden");
            document.querySelector(".albums").classList.add("hidden");
        });
    });
}

// Run this function to initialize event listeners
setupEventListeners();
