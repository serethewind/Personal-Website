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
];

const lagosDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Lagos',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const dayNumber = Math.floor(new Date(`${lagosDate}T00:00:00Z`).getTime() / 86_400_000);
const [verse, reference] = verses[dayNumber % verses.length];

document.getElementById('verse-text').textContent = `“${verse}”`;
document.getElementById('verse-reference').textContent = `— ${reference}`;

const listeningStatus = document.getElementById('listening-status');
const listeningMeta = document.getElementById('listening-meta');
const spotifyTrackLink = document.getElementById('spotify-track-link');

async function loadListeningStatus() {
  try {
    const response = await fetch('/api/listening');
    if (!response.ok) throw new Error('Listening status unavailable');

    const track = await response.json();
    listeningStatus.textContent = `${track.name} — ${track.artist}`;
    listeningMeta.textContent = track.status === 'now_playing' ? 'Now listening · Spotify' : 'Last listened · Spotify';
    spotifyTrackLink.href = track.url;
    spotifyTrackLink.hidden = false;
  } catch {
    listeningStatus.textContent = 'No genre manifesto. Just a different way to work through the noise.';
    listeningMeta.textContent = 'Listening room / soon';
  }
}

loadListeningStatus();
