const API_KEY = 'AIzaSyBXPrryUOyqoiAQFXAScDjjyF94BOlWtOU';
const VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const videoListItems = document.querySelector('.video__list-items');

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

const displayVideo = (video) => {
  videoListItems.textContent = '';
  const listVideos = video.items.map((video) => {
    console.log(video);
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
      <p class="video__card-duration">${video.contentDetails.duration}</p>
    </a>
    <button class="video__card-favorite video__card-favorite-active" type="button"
      aria-label="Добавить в Избранное,${video.snippet.title}">
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


fetchTredingVideos().then(displayVideo)
