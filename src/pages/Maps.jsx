import { useState } from "react";

function Maps() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);

  const findNearby = () => {
    if (!search.trim()) return;

    setLocation(search.trim());
  };

  return (
    <div className="workspace-page">

      <header className="workspace-page-header">

        <h1>Maps</h1>

        <button
          className="workspace-more-button"
          onClick={() =>
            alert("More map options")
          }
        >
          •••
        </button>

      </header>

      <div className="maps-search">

        <span>＋</span>

        <input
          type="text"
          placeholder="Ask DevForge what's nearby"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              findNearby();
            }
          }}
        />

        <button onClick={findNearby}>
          ↑
        </button>

      </div>

      {!location ? (

        <div className="maps-discovery">

          <div className="maps-icon">
            🗺️
          </div>

          <h2>
            Discover places
          </h2>

          <p>
            Search for places, restaurants,
            colleges, shops and other locations.
          </p>

          <div className="maps-examples">

            <button
              onClick={() =>
                setSearch("restaurants nearby")
              }
            >
              🍴 Restaurants
            </button>

            <button
              onClick={() =>
                setSearch("coffee shops nearby")
              }
            >
              ☕ Coffee
            </button>

            <button
              onClick={() =>
                setSearch("shopping malls nearby")
              }
            >
              🛍️ Shopping
            </button>

          </div>

        </div>

      ) : (

        <div className="maps-results">

          <div className="maps-result-header">
            <h2>
              Results for "{location}"
            </h2>

            <button
              onClick={() => {
                setLocation(null);
                setSearch("");
              }}
            >
              Clear
            </button>
          </div>

          <div className="maps-placeholder">

            <div>
              🗺️
            </div>

            <h3>
              Map search
            </h3>

            <p>
              Searching for:
              <br />
              <strong>{location}</strong>
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default Maps;