const DB_NAME = "DevForgeLibrary";
const DB_VERSION = 1;
const STORE_NAME = "files";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(
          STORE_NAME,
          {
            keyPath: "id",
            autoIncrement: true,
          }
        );

        store.createIndex(
          "name",
          "name",
          { unique: false }
        );

        store.createIndex(
          "type",
          "type",
          { unique: false }
        );

        store.createIndex(
          "createdAt",
          "createdAt",
          { unique: false }
        );
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/*
  Save a file to Library
*/

export async function saveFile(file) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const item = {
      name: file.name || "Untitled",
      type: file.type || "application/octet-stream",
      size: file.size || 0,
      blob: file,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const request =
      store.add(item);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/*
  Get every Library item
*/

export async function getFiles() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readonly"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.getAll();

    request.onsuccess = () => {
      const files = request.result || [];

      files.sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

      resolve(files);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/*
  Get one Library item
*/

export async function getFile(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readonly"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.get(id);

    request.onsuccess = () => {
      resolve(
        request.result || null
      );
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/*
  Delete one Library item
*/

export async function deleteFile(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/*
  Rename a Library item
*/

export async function renameFile(
  id,
  newName
) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.get(id);

    request.onsuccess = () => {
      const item =
        request.result;

      if (!item) {
        reject(
          new Error(
            "File not found"
          )
        );

        return;
      }

      item.name =
        newName.trim() ||
        item.name;

      item.updatedAt =
        new Date().toISOString();

      const updateRequest =
        store.put(item);

      updateRequest.onsuccess =
        () => {
          resolve(item);
        };

      updateRequest.onerror =
        () => {
          reject(
            updateRequest.error
          );
        };
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/*
  Clear entire Library
*/

export async function clearLibrary() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction =
      db.transaction(
        STORE_NAME,
        "readwrite"
      );

    const store =
      transaction.objectStore(STORE_NAME);

    const request =
      store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/*
  Search Library
*/

export async function searchFiles(
  searchTerm
) {
  const files =
    await getFiles();

  const term =
    searchTerm
      .trim()
      .toLowerCase();

  if (!term) {
    return files;
  }

  return files.filter(
    (file) =>
      file.name
        .toLowerCase()
        .includes(term) ||
      file.type
        .toLowerCase()
        .includes(term)
  );
}

/*
  Convert a stored file
  into a browser URL.
*/

export function createFileURL(file) {
  if (!file?.blob) {
    return null;
  }

  return URL.createObjectURL(
    file.blob
  );
}

/*
  Download a Library file
*/

export function downloadFile(file) {
  if (!file?.blob) {
    return;
  }

  const url =
    URL.createObjectURL(
      file.blob
    );

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    file.name || "download";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/*
  Format file size
*/

export function formatFileSize(
  bytes
) {
  if (!bytes || bytes <= 0) {
    return "0 KB";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.floor(
    Math.log(bytes) /
      Math.log(1024)
  );

  const safeIndex =
    Math.min(
      index,
      units.length - 1
    );

  const size =
    bytes /
    Math.pow(
      1024,
      safeIndex
    );

  return `${size.toFixed(
    safeIndex === 0 ? 0 : 1
  )} ${units[safeIndex]}`;
}

/*
  Get a readable file type
*/

export function getFileCategory(
  file
) {
  if (!file) {
    return "File";
  }

  const type =
    file.type || "";

  if (
    type.startsWith(
      "image/"
    )
  ) {
    return "Image";
  }

  if (
    type.startsWith(
      "text/"
    )
  ) {
    return "Document";
  }

  if (
    type.includes(
      "pdf"
    )
  ) {
    return "PDF";
  }

  if (
    type.includes(
      "javascript"
    ) ||
    type.includes("json") ||
    type.includes("css")
  ) {
    return "Code";
  }

  return "File";
}