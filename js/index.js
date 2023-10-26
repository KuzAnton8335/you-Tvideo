const API_KEY = 'AIzaSyBXPrryUOyqoiAQFXAScDjjyF94BOlWtOU';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const videoListItems = document.querySelector('.video__list-items');

const favoriteIds = JSON.parse(localStorage.getItem('favoriteYT') || "[]");

const converISOToReableDuration = (isoDuration) => {
  const hoursMatch = isoDuration.match(/(\d+)H/);
  const minutesMatch = isoDuration.match(/(\d+)M/);
  const secondMatch = isoDuration.match(/(\d+)S/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const second = secondMatch ? parseInt(secondMatch[1]) : 0;

  let result = '';
  if (hours > 0) {
    result += `${hours} ч `;
  }

  if (minutes > 0) {
    result += `${minutes} мин `;
  }

  if (second > 0) {
    result += `${second} сек`;
  }

  return result.trim();
}

const formatDate = (isoString) => {
  const data = new Date(isoString);
  const formatter = new Intl.DateTimeFormat("ru-Ru", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return formatter.format(data);
}

const fetchTredingVideos = async () => {
  try {
    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails,id,snippet')
    url.searchParams.append('chart', 'mostPopular')
    url.searchParams.append('regionCode', 'RU')
    url.searchParams.append('maxResults', '12')
    url.searchParams.append('key', API_KEY)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(error);
  }
};


const fetchFavoriteVideos = async () => {
  try {
    if (favoriteIds.lenght === 0) {
      return { items: [] }
    }
    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'contentDetails,id,snippet')
    url.searchParams.append('maxResults', '12')
    url.searchParams.append('id', favoriteIds.join(','));
    url.searchParams.append('key', API_KEY)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(error);
  }
};

const fetchVideoData = async (id) => {
  try {

    const url = new URL(VIDEOS_URL);
    url.searchParams.append('part', 'snippet,statistics');
    url.searchParams.append('id', id);
    url.searchParams.append('key', API_KEY)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(error);
  }
};

const displayListVideo = (video) => {
  videoListItems.textContent = '';
  const listVideos = video.items.map((video) => {
    const li = document.createElement('li');
    li.classList.add('video__list-item');
    li.innerHTML = `
    <article class="video__list-card">
    <a href="/video.html?id=${video.id}" class="video__card-link">
      <img src="${video.snippet.thumbnails.standard?.url ||
      video.snippet.thumbnails.hight?.url}" alt="Превью видео ${video.snippet.title}"
        class="video-card__thubnail">
      <h3 class="video__card-title">${video.snippet.title}</h3>
      <p class="video__card-channel">${video.snippet.channelTitle}</p>
      <p class="video__card-duration">${converISOToReableDuration(video.contentDetails.duration,)}</p>
    </a>
    <button class="video__card-favorite  favorite ${favoriteIds.includes(video.id) ? 'active' : ''}" type="button"
      aria-label="Добавить в Избранное,${video.snippet.title}"
      data-video-id="${video.id}">
      <svg class="video__card-icon">
        <use class="star-o" xlink:href="/img/sprite.svg#star-ob"></use>
        <use class="star" xlink:href="/img/sprite.svg#star"></use>
      </svg>
    </button>
  </article>
    `;
    return li
  });

  videoListItems.append(...listVideos);
}

const displayVideo = ({ items: [video] }) => {
  console.log(video);
  const videoElemt = document.querySelector('.video');
  videoElemt.innerHTML = `
  <div class="container">
  <div class="video__player">
    <iframe class="video__iframe" width="728" height="410" src="https://www.youtube.com/embed/${video.id}"
      title="Hack your brain with Obsidian.md" frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen></iframe>
  </div>
  <div class="video__container">
    <div class="video__content">
      <h2 class="video__title">${video.snippet.title}</h2>
      <p class="video__channel">${video.snippet.channelTitle}</p>
      <p class="video__info">
        <span class="video__views">${parseInt(video.statistics.viewCount,).toLocaleString()} просмотров</span>
        <span class="video__date">Дата премьеры: ${formatDate(video.snippet.publishedAt,)}</span>
      </p>
      <p class="video__description">${video.snippet.description}</p>
    </div>
    <button  class="video__link favorite ${favoriteIds.includes(video.id) ? 'active' : ''}">
      <span class="video__no-favorite">Избранное</span>
      <span class="video__favorite">В избранном</span>
      <use class="video__icon" xlink:href="/img/sprite.svg#star-ob"></use>
    </button>
  </div>
</div>
  `;
}

const init = () => {
  const currentPage = location.pathname.split('/').pop();
  const urlSerachParams = new URLSearchParams(location.search);
  const videoId = urlSerachParams.get('id');
  const searchQuery = urlSerachParams.get('q');

  if (currentPage === 'index.html' || currentPage === '') {
    fetchTredingVideos().then(displayListVideo);
  } else if (currentPage === 'video.html' && videoId) {
    fetchVideoData(videoId).then(displayVideo);
  } else if (currentPage === 'favorite.html') {
    fetchFavoriteVideos().then(displayListVideo);
  } else if (currentPage === 'search.html' && searchQuery) {
    console.log(currentPage);
  }


  fetchTredingVideos().then(displayVideo)
  document.body.addEventListener('click', ({ target }) => {
    const itemFavorite = target.closest('.favorite');

    if (itemFavorite) {
      const videoId = itemFavorite.dataset.videoId;

      if (favoriteIds.includes(videoId)) {
        favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
        localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
        itemFavorite.classList.remove('active')
      } else {
        favoriteIds.push(videoId);
        localStorage.setItem('favoriteYT', JSON.stringify(favoriteIds));
        itemFavorite.classList.add('active')
      }
    }
  })
}

init();

