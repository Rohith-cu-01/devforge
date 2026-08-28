import { useState } from "react";
import { saveFile } from "../lib/libraryDB";

function Images() {
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;

      await saveFile(file);

      const preview = URL.createObjectURL(file);

      setImages((current) => [
        {
          id: Date.now() + Math.random(),
          name: file.name,
          url: preview,
        },
        ...current,
      ]);
    }

    event.target.value = "";
  };

  const filteredImages = images.filter((image) =>
    image.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="workspace-page">

      <header className="workspace-page-header">

        <h1>Images</h1>

        <div className="workspace-header-actions">

          <div className="workspace-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search images"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <label className="workspace-new-button">
            ＋ New

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleUpload}
            />
          </label>

        </div>

      </header>

      {filteredImages.length === 0 ? (

        <div className="workspace-empty">

          <div className="workspace-empty-icon">
            ▧
          </div>

          <h2>
            No images yet
          </h2>

          <p>
            Upload images to keep them in your Library.
          </p>

          <label className="workspace-create-button">
            ＋ Upload images

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleUpload}
            />
          </label>

        </div>

      ) : (

        <div className="workspace-image-grid">

          {filteredImages.map((image) => (

            <article
              className="workspace-image-card"
              key={image.id}
            >

              <img
                src={image.url}
                alt={image.name}
              />

              <div>
                <strong>
                  {image.name}
                </strong>
              </div>

            </article>

          ))}

        </div>

      )}

    </div>
  );
}

export default Images;