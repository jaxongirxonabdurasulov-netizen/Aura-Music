import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tracks, setTracks] = useState([]);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    fetchTracks("uzbek music");
  }, []);

  const fetchTracks = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const items = (data.items || []).map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        cover: item.snippet.thumbnails?.medium?.url,
        videoId: item.id.videoId,
      }));
      setTracks(items);
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
      setPlaying(!playing);
      return;
    }
    setCurrent(track);
    setPlaying(true);
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

  const visibleTracks = () => {
    if (tab === "liked") return tracks.filter((t) => liked.includes(t.id));
    return tracks;
  };

  const list = visibleTracks();

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🔮 Aura Music</h1>
          <span className="badge">YouTube</span>
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
              <img className="track-cover" src={track.cover} alt={track.title} />
              <div className="track-info">
                <div className="track-name">{track.title}</div>
                <div className="track-artist">{track.artist}</div>
              </div>
              <button
                className={`like-btn ${liked.includes(track.id) ? "liked" : ""}`}
                onClick={(e) => toggleLike(track.id, e)}
              >
                {liked.includes(track.id) ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>

        {/* YouTube Player */}
        {current && (
          <div className="player">
            <div className="youtube-wrap">
              <iframe
                key={current.videoId}
                width="100%"
                height="80"
                src={`https://www.youtube.com/embed/${current.videoId}?autoplay=${playing ? 1 : 0}&controls=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={current.title}
                style={{ border: "none", borderRadius: "10px" }}
              />
            </div>
            <div className="player-info">
              <img className="player-cover" src={current.cover} alt={current.title} />
              <div>
                <div className="player-name">{current.title}</div>
                <div className="player-artist">{current.artist}</div>
              </div>
            </div>
            <div className="controls">
              <button className="ctrl" onClick={prevTrack}>⏮</button>
              <button className="ctrl" onClick={nextTrack}>⏭</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;