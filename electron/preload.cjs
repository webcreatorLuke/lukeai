// electron/preload.cjs
//
// No privileged APIs are exposed to the renderer yet — this file exists so
// future native features (e.g. a save-file dialog for the file-download
// feature) have a safe place to add a contextBridge API later.
