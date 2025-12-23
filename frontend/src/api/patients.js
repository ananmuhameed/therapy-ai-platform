import api from "./axiosInstance";

export async function fetchMyPatients() {

    const res = await api.get("/patients/");
    return res.data; // could be array or {results: []}
}