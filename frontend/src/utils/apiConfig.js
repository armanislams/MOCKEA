// live server
// export const API_BASE_URL = import.meta.env.VITE_live_url;
//local server
export const API_BASE_URL = import.meta.env.VITE_local_url;
if (!API_BASE_URL) {
    console.error("API_BASE_URL is not defined");
}
