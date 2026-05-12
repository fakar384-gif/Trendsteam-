// আপনার API Key এখানে যোগ করা হয়েছে
const API_KEY = 'AIzaSyCPtOQh4BScE_ST-QWE3r3LNKZK7N7xjPM'; 

let player; 
let currentPlaylist = [];
let currentVideoIndex = 0;

function onYouTubeIframeAPIReady() {
    console.log("YouTube API Ready!");
}

async function searchYouTube() {
    const query = document.getElementById('youtubeSearch').value;
    const searchResultsDiv = document.getElementById('searchResults');
    const searchTitle = document.getElementById('searchTitle');
    const mainPlayerContainer = document.getElementById('mainPlayerContainer');

    if (!query) {
        alert("Please enter a video name!");
        return;
    }

    // Searching মেসেজ দেখানো
    searchResultsDiv.innerHTML = '<p style="color: white; text-align: center; width: 100%;">Searching...</p>';
    if(mainPlayerContainer) mainPlayerContainer.style.display = 'none';

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("API Error Details:", data.error);
            alert("API Error: " + data.error.message); 
            return;
        }

        if (data.items && data.items.length > 0) {
            searchTitle.style.display = 'block';
            searchResultsDiv.innerHTML = ''; 
            currentPlaylist = []; 

            data.items.forEach((item, index) => {
                const videoId = item.id.videoId;
                const title = item.snippet.title;
                const channel = item.snippet.channelTitle;
                const thumbnail = item.snippet.thumbnails.medium.url;

                currentPlaylist.push({ id: videoId, title: title });

                const videoCard = `
                    <div class="video-card" id="card-${index}" onclick="playSelectedVideo(${index})">
                        <div class="video-thumbnail-wrapper">
                            <img src="${thumbnail}" alt="Thumbnail">
                            <div class="play-icon">▶ Play</div>
                        </div>
                        <div class="video-info">
                            <div class="video-details">
                                <h3>${title.substring(0, 50)}...</h3>
                                <p>${channel}</p>
                            </div>
                        </div>
                    </div>
                `;
                searchResultsDiv.innerHTML += videoCard;
            });
            
            playSelectedVideo(0);
            
            if(mainPlayerContainer) {
                mainPlayerContainer.scrollIntoView({ behavior: 'smooth' });
            }

        } else {
            searchResultsDiv.innerHTML = '';
            alert("No videos found for this search!");
        }
    } catch (error) {
        console.error("Network Error:", error);
        alert("Internet connection or Network problem.");
    }
}

function playSelectedVideo(index) {
    currentVideoIndex = index;
    const videoId = currentPlaylist[index].id;

    document.querySelectorAll('.video-card').forEach(card => card.classList.remove('active-video'));
    const selectedCard = document.getElementById(`card-${index}`);
    if (selectedCard) {
        selectedCard.classList.add('active-video');
    }

    const mainPlayerContainer = document.getElementById('mainPlayerContainer');
    if (mainPlayerContainer) {
        mainPlayerContainer.style.display = 'block';
    }

    if (!player) {
        player = new YT.Player('mainPlayer', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'playsinline': 1,
                'rel': 0,
                'mute': 1  
            },
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    } else {
        player.loadVideoById(videoId);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        currentVideoIndex++;
        
        if (currentVideoIndex < currentPlaylist.length) {
            playSelectedVideo(currentVideoIndex);
        } else {
            console.log("Playlist Finished!");
        }
    }
}