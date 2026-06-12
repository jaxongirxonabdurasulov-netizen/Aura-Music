import { useState, useRef, useEffect } from "react";
import "./App.css";

const DEEZER_API = "https://api.deezer.com";
const CORS = "https://corsproxy.io/?";

function App() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState([]);
  const [tab, setTab] = useState("all");
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchTracks("uzbek");
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const fetchTracks = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`${CORS}${DEEZER_API}/search?q=${encodeURIComponent(q)}&limit=25`);
      const data = await res.json();
      setTracks(data.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      fetchTracks(search);
      setTab("all");
    }
  };

  const selectTrack = (track) => {
    if (current?.id === track.id) {
      togglePlay();
      return;
    }
    setCurrent(track);
    setProgress(0);
    setPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = track.preview;
        audioRef.current.play();
      }
    }, 100);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const nextTrack = () => {
    const list = visibleTracks();
    const idx = list.findIndex((t) => t.id === current?.id);
    const next = list[(idx + 1) % list.length];
    if (next) selectTrack(next);
  };

  const prevTrack = () => {
    const list = visibleTracks();
    const idx = list.findIndex((t) => t.id === current?.id);
    const prev = list[(idx - 1 + list.length) % list.length];
    if (prev) selectTrack(prev);
  };

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(pct || 0);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const bar = e.currentTarget;
    const pct = e.nativeEvent.offsetX / bar.offsetWidth;
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const handleEnded = () => {
    nextTrack();
  };

  const fmt = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const visibleTracks = () => {
    if (tab === "liked") return tracks.filter((t) => liked.includes(t.id));
    return tracks;
  };

  const list = visibleTracks();

  return (
    <div className="app">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🎵 Musiqam</h1>
          <span className="badge">Deezer</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            className="search"
            type="text"
            placeholder="🔍 Qo'shiq, artist qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="search-btn">Qidirish</button>
        </form>

        {/* Tabs */}
        <div className="tabs">
          <button className={tab === "all" ? "tab active" : "tab"} onClick={() => setTab("all")}>
            Hammasi ({tracks.length})
          </button>
          <button className={tab === "liked" ? "tab active" : "tab"} onClick={() => setTab("liked")}>
            ❤️ Sevimlilar ({liked.length})
          </button>
        </div>

        {/* Loading */}
        {loading && <div className="loading">⏳ Yuklanmoqda...</div>}

        {/* Track List */}
        <div className="tracklist">
          {!loading && list.length === 0 && (
            <div className="empty">Qo'shiq topilmadi 🎵</div>
          )}
          {list.map((track, i) => (
            <div
              key={track.id}
              className={`track ${current?.id === track.id ? "active" : ""}`}
              onClick={() => selectTrack(track)}
            >
              <span className="track-num">
                {current?.id === track.id && playing ? "▶" : i + 1}
              </span>
              <img
                className="track-cover"
                src={track.album?.cover_small}
                alt={track.title}
              />
              <div className="track-info">
                <div className="track-name">{track.title}</div>
                <div className="track-artist">{track.artist?.name}</div>
              </div>
              <span className="track-dur">{fmt(track.duration)}</span>
              <button
                className={`like-btn ${liked.includes(track.id) ? "liked" : ""}`}
                onClick={(e) => toggleLike(track.id, e)}
              >
                {liked.includes(track.id) ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>

        {/* Player */}
        {current && (
          <div className="player">
            <img className="player-cover" src={current.album?.cover_small} alt={current.title} />
            <div className="player-middle">
              <div className="player-meta">
                <div className="player-name">{current.title}</div>
                <div className="player-artist">{current.artist?.name}</div>
              </div>
              <div className="progress-bar" onClick={handleSeek}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="controls">
                <button className="ctrl" onClick={prevTrack}>⏮</button>
                <button className="play-btn" onClick={togglePlay}>
                  {playing ? "⏸" : "▶️"}
                </button>
                <button className="ctrl" onClick={nextTrack}>⏭</button>
              </div>
            </div>
            <div className="volume-wrap">
              🔊
              <input
                type="range" min="0" max="1" step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
