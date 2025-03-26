import axios from "axios";

const GOOGLE_PLACES_API_KEY = "AIzaSyCdWntSfzHkQAX-ZJTWRa_opHRsMhXSdps";

export const googleMapsAPI = axios.create({
  baseURL: "https://maps.googleapis.com/",
  params: {
    key: GOOGLE_PLACES_API_KEY,
  },
});
