let playlists = [];
let currentModalPlaylistIndex = null;

function loadPlaylists() {
  if (typeof data === 'undefined' || !Array.isArray(data)) {
    console.error('Playlist data not found!');
    return;
  }
  playlists = data;
  renderPlaylists();
  if (document.getElementById('featuredPlaylist')) {
    renderFeaturedPlaylist();
  }
}

function renderPlaylists() {
  const container = document.querySelector('.playlist-cards');
  const playlistsHTML = playlists.map((_, i) => createPlaylistCard(i)).join('');
  container.innerHTML = playlistsHTML;
}

/**
 * Creates a playlist card HTML element
 * @param {number} index - The index of the playlist in the playlists array
 * @returns {string} The HTML string for the playlist card
 */
function createPlaylistCard(index) {
    const playlist = playlists[index];
    const liked = isPlaylistLiked(playlist.playlistID);
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
             onclick="openPlaylistModal(${index})">
            <img src="${playlist.playlist_art}" alt="${playlist.playlist_name} Cover" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">${playlist.playlist_name}</h3>
                <p class="text-gray-600 mb-3">Created by ${playlist.playlist_author}</p>
                <div class="flex items-center">
                    <button class="focus:outline-none transition-transform hover:scale-110 group" onclick="event.stopPropagation(); toggleLike(${index});">
                        <svg xmlns="http://www.w3.org/2000/svg"
                             class="h-5 w-5 mr-1 transition-colors ${liked ? 'text-red-500' : 'text-gray-400'} group-hover:text-red-400"
                             viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <span class="text-sm font-medium" id="likes-count-${playlist.playlistID}">${playlist.likes}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Formats the number of likes to a readable string
 * @param {number} likes - The number of likes
 * @returns {string} Formatted likes string (e.g., "1.2k")
 */
function formatLikes(likes) {
    if (likes >= 1000) {
        return (likes / 1000).toFixed(1) + 'k';
    }
    return likes.toString();
}

/**
 * Opens the playlist modal with the selected playlist data
 * @param {number} index - The index of the playlist in the playlists array
 */
function openPlaylistModal(index) {
    currentModalPlaylistIndex = index;
    const playlist = playlists[index];
    document.getElementById('modalPlaylistImage').src = playlist.playlist_art;
    document.getElementById('modalPlaylistTitle').textContent = playlist.playlist_name;
    document.getElementById('modalPlaylistCreator').textContent = `Created by ${playlist.playlist_author}`;

    // Render songs
    const songListContainer = document.getElementById('modalSongList');
    songListContainer.innerHTML = playlist.songs.map(createSongRow).join('');

    // Show the modal
    const modal = document.getElementById('playlistModal');
    const modalContent = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Animate in
    setTimeout(() => {
        modalContent.classList.remove('opacity-0', 'scale-95');
        modalContent.classList.add('opacity-100', 'scale-100');
    }, 10);
}

/**
 * Closes the playlist modal
 */
function closeModal() {
    const modal = document.getElementById('playlistModal');
    const modalContent = document.getElementById('modalContent');
    // Animate out
    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }, 300); // Match the duration-300
}

// Close modal when clicking outside
document.addEventListener('click', (event) => {
    const modal = document.getElementById('playlistModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal when pressing Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

function createSongRow(song) {
  return `
    <div class="flex items-center border rounded-lg bg-gray-50 px-4 py-2">
      <img src="${song.art}" alt="${song.title} cover" class="w-14 h-14 object-cover rounded mr-4 border" />
      <div class="flex-1">
        <div class="font-semibold text-gray-800">${song.title}</div>
        <div class="text-gray-500 text-sm">${song.artist}</div>
        <div class="text-gray-400 text-xs">${song.album}</div>
      </div>
      <div class="ml-4 text-gray-500 font-mono">${song.duration}</div>
    </div>
  `;
}

function isPlaylistLiked(playlistID) {
  return localStorage.getItem('liked_' + playlistID) === 'true';
}

function toggleLike(index) {
  const playlist = playlists[index];
  const likedKey = 'liked_' + playlist.playlistID;
  let liked = isPlaylistLiked(playlist.playlistID);

  if (liked) {
    playlist.likes--;
    localStorage.setItem(likedKey, 'false');
  } else {
    playlist.likes++;
    localStorage.setItem(likedKey, 'true');
  }

  // Update the UI
  renderPlaylists();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

document.addEventListener('click', function(e) {
  if (e.target.closest('#shuffleBtn')) {
    if (currentModalPlaylistIndex !== null) {
      const playlist = playlists[currentModalPlaylistIndex];
      shuffleArray(playlist.songs);
      // Re-render the shuffled songs
      const songListContainer = document.getElementById('modalSongList');
      songListContainer.innerHTML = playlist.songs.map(createSongRow).join('');
    }
  }
});

async function getRandomPlaylist() {
  if (typeof data === 'undefined' || !Array.isArray(data)) {
    console.error('Playlist data not found!');
    return null;
  }
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

async function renderFeaturedPlaylist() {
  const playlist = await getRandomPlaylist();
  if (!playlist) return;
  const featuredDiv = document.getElementById('featuredPlaylist');
  if (!featuredDiv) return;
  featuredDiv.innerHTML = `
    <div class='flex flex-col items-center md:w-1/3'>
      <img src="${playlist.playlist_art}" alt="Playlist Cover" class="w-64 h-64 object-cover rounded-2xl shadow-lg mb-4">
      <h2 class="text-2xl font-bold text-gray-800 mt-2 text-center">${playlist.playlist_name}</h2>
      <p class="text-gray-500 text-center">by ${playlist.playlist_author}</p>
    </div>
    <div class='flex-1'>
      <h3 class="text-xl font-semibold text-gray-700 mb-4">Songs</h3>
      <div class="space-y-4 max-h-[60vh] overflow-y-auto">
        ${playlist.songs.map(song => `
          <div class="flex items-center border rounded-lg bg-gray-50 px-4 py-2">
            <img src="${song.art}" alt="Song cover" class="w-14 h-14 object-cover rounded mr-4 border" />
            <div class="flex-1">
              <div class="font-semibold text-gray-800">${song.title}</div>
              <div class="text-gray-500 text-sm">${song.artist}</div>
              <div class="text-gray-400 text-xs">${song.album}</div>
            </div>
            <div class="ml-4 text-gray-500 font-mono">${song.duration}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
