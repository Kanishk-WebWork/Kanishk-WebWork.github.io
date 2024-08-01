let currtype;
let currfolder;
let currentSong = new Audio();
let songs = [];

async function fetchText(url) {
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
    }
    return await response.text();
}

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

function playMusic(track, pause = false) {
    if (!track) {
        console.error('No track provided.');
        return;
    }
    currentSong.src = track;

    if (!pause) {
        currentSong.play();
        play.src = '/Kanishk-WebWork.github.io/Assets/pause.svg';
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split('/').slice(-1)[0].slice(0, -4);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}


async function getSongs(type, folder) {
    currfolder = folder;
    currtype = type;

    try {
        let response = await fetchText(`/Kanishk-WebWork.github.io/Songs/${currtype}/${folder}/`);
        let div = document.createElement("div");
        div.innerHTML = response;
        let as = div.getElementsByTagName("a");
        songs = []; // Clear the old playlist
        for (let element of as) {
            if (element.href.endsWith(".mp3")) {
                const splitResult = element.href.split(`/${currfolder}/`);
                songs.push(splitResult.length == 1 ? splitResult[0] : `/Kanishk-WebWork.github.io/Songs/${currtype}/${currfolder}/${splitResult[1]}`);
            }
        }

        // Update the UI
        updateSongListUI();

        return songs;

    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

function updateSongListUI() {
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        const fileNameWithExtension = song.replaceAll('%20', ' ').split('/').pop();
        const fileName = fileNameWithExtension.slice(0, fileNameWithExtension.length - 4);

        songUL.innerHTML += `<li>
            <img class="invert" src="Assets/music.svg" alt="">
            <div class="info"><div>${fileName}</div></div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="Assets/playsong.svg" alt="">
            </div>
        </li>`;
    }

    document.querySelectorAll(".songlist li").forEach(e => {
        e.querySelector(".playnow img").addEventListener("click", () => {
            const songName = e.querySelector(".info div").textContent.trim();
            const url = `/Kanishk-WebWork.github.io/Songs/${currtype}/${currfolder}/${encodeURIComponent(songName)}.mp3`;
            playMusic(url);
        });
    });
}



async function displayAlbums(type) {
    try {
        let response = await fetchText(`/Kanishk-WebWork.github.io/Songs/${type}/`);
        let div = document.createElement("div");
        div.innerHTML = response;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(`.${type.toLowerCase()}`);
        cardContainer.innerHTML = ""; // Clear the card container

        for (let anchor of anchors) {
            // Debugging: Log the anchor hrefs
            console.log('Anchor href:', anchor.href);

            if (anchor.href.includes(`/Kanishk-WebWork.github.io/Songs/${type}/`)) {
                let folder = anchor.href.split("/").slice(-2)[0].replace("%20", " ");
                
                // Debugging: Log the folder name
                console.log('Folder name:', folder);
                
                let albumInfo = await fetchJSON(`/Kanishk-WebWork.github.io/Songs/${type}/${folder}/info.json`);
                
                // Debugging: Log the album info
                console.log('Album info:', albumInfo);
                
                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true"
                            viewBox="0 0 24 24" style="fill: black; width: 24px; height: 24px;">
                            <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                            </path>
                        </svg>
                    </div>
                    <img src="/Kanishk-WebWork.github.io/Songs/${type}/${folder}/cover.jpg" alt="Playlist">
                    <h3>${albumInfo.title}</h3>
                    <p>${albumInfo.description}</p>
                </div>`;
            }
        }

        // Make sure to remove previous event listeners before adding new ones
        cardContainer.querySelectorAll(".card").forEach(e => {
            e.removeEventListener("click", cardClickHandler); // Remove old handlers
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
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = '/Kanishk-WebWork.github.io/Assets/pause.svg';
        } else {
            currentSong.pause();
            play.src = '/Kanishk-WebWork.github.io/Assets/playsong.svg';
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
            // If currentSong.src is not found in songs array, handle it gracefully
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
            // If currentSong.src is not found in songs array, handle it gracefully
            console.warn('Current song is not in the list of songs.');
            return;
        }
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1]);
        } else {
            currentSong.pause();
            play.src = '/Kanishk-WebWork.github.io/Assets/playsong.svg';
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
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });

    const rightArrow = document.getElementById('rightarrow');
    const leftArrow = document.getElementById('leftarrow');
    const cards = document.querySelectorAll('.cardContainer>*');
    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.toggle('inactive', index !== currentIndex);
        });
    }

    rightArrow.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCarousel();
    });

    leftArrow.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCarousel();
    });

    updateCarousel();
}

async function main() {
    await getSongs("Artists", "National Sweetheart");
    playMusic(songs[0], true);
    displayAlbums("Artists");
    displayAlbums("Mood");
    displayAlbums("Genre");

    setupEventListeners();
}

main();
