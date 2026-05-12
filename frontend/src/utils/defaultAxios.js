import axios from "axios";

const defaultAxios = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

export default defaultAxios;
