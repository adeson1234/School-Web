import { CURRENT_VERSION } from "./version.js";

const savedVersion = localStorage.getItem('app_version');

if (!savedVersion || parseInt(savedVersion) !== CURRENT_VERSION) {
  sessionStorage.clear();
  localStorage.clear();
  localStorage.setItem('app_version', CURRENT_VERSION);
  window.location.reload();
}