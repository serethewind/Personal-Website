const year = document.getElementById('year');
const clock = document.getElementById('local-time');

year.textContent = new Date().getFullYear();

function updateLagosTime() {
  const now = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date());
  clock.textContent = `${now} WAT`;
}

updateLagosTime();
setInterval(updateLagosTime, 1_000);

const verses = [
  ['Be strong in the Lord, and in the power of his might.', 'Ephesians 6:10'],
  ['And we know that all things work together for good to them that love God.', 'Romans 8:28'],
  ['I can do all things through Christ which strengtheneth me.', 'Philippians 4:13'],
  ['Rejoice in hope, be patient in tribulation, be constant in prayer.', 'Romans 12:12'],
  ['Let all that you do be done in love.', '1 Corinthians 16:14'],
  ['The Lord is faithful, who shall stablish you, and keep you from evil.', '2 Thessalonians 3:3'],
  ['Be not overcome of evil, but overcome evil with good.', 'Romans 12:21'],
  ['For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', '2 Timothy 1:7'],
  ['Now the Lord of peace himself give you peace always by all means.', '2 Thessalonians 3:16'],
  ['For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.', 'Ephesians 2:8'],
  ['The Lord is my shepherd; I shall not want.', 'Psalm 23:1'],
  ['Trust in the Lord with all thine heart; and lean not unto thine own understanding.', 'Proverbs 3:5'],
  ['Be still, and know that I am God.', 'Psalm 46:10'],
  ['This is the day which the Lord hath made; we will rejoice and be glad in it.', 'Psalm 118:24'],
  ['Thy word is a lamp unto my feet, and a light unto my path.', 'Psalm 119:105'],
  ['Commit thy works unto the Lord, and thy thoughts shall be established.', 'Proverbs 16:3'],
  ['Cast thy burden upon the Lord, and he shall sustain thee.', 'Psalm 55:22'],
  ['Fear thou not; for I am with thee.', 'Isaiah 41:10'],
  ['Come unto me, all ye that labour and are heavy laden, and I will give you rest.', 'Matthew 11:28'],
  ['And whatsoever ye do, do it heartily, as to the Lord, and not unto men.', 'Colossians 3:23'],
];

const lagosDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const dayNumber = Math.floor(new Date(`${lagosDate}T00:00:00Z`).getTime() / 86_400_000);
const verseCard = document.querySelector('.daily-verse');
const verseText = document.getElementById('verse-text');
const verseReference = document.getElementById('verse-reference');
let verseIndex = dayNumber % verses.length;

function showVerse(index) {
  const [verse, reference] = verses[index];
  verseText.textContent = `“${verse}”`;
  verseText.classList.toggle('is-long', verse.length > 55);
  verseReference.textContent = `— ${reference}`;
}

showVerse(verseIndex);

// A new verse per click; nothing is stored, so a reload returns to the day's verse.
verseCard.addEventListener('click', (event) => {
  if (event.target.closest('a')) return;
  verseIndex = (verseIndex + 1 + Math.floor(Math.random() * (verses.length - 1))) % verses.length;
  verseCard.classList.add('is-changing');
  setTimeout(() => {
    showVerse(verseIndex);
    verseCard.classList.remove('is-changing');
  }, 180);
});

const listeningStatus = document.getElementById('listening-status');
const listeningMeta = document.getElementById('listening-meta');
const spotifyTrackLink = document.getElementById('spotify-track-link');
const musicTrack = document.getElementById('music-track');
const musicSpotifyLink = document.getElementById('music-spotify-link');

async function loadListeningStatus() {
  try {
    const response = await fetch('/api/listening');
    if (!response.ok) throw new Error('Listening status unavailable');

    const track = await response.json();
    listeningStatus.textContent = `${track.name} — ${track.artist}`;
    listeningMeta.textContent = track.status === 'now_playing' ? 'Now listening' : 'Last listened';
    spotifyTrackLink.href = track.url;
    spotifyTrackLink.hidden = false;
    musicTrack.textContent = `${listeningMeta.textContent}: ${track.name} — ${track.artist}`;
    musicSpotifyLink.href = track.url;
    musicSpotifyLink.hidden = false;
  } catch {
    spotifyTrackLink.hidden = true;
    musicSpotifyLink.hidden = true;
  }
}

loadListeningStatus();
