import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { qk } from "./queryKeys";

const normalizeList = (data) => (Array.isArray(data) ? data : data?.results || []);

export function usePatients() {
  return useQuery({
    queryKey: qk.patients,
    queryFn: async () => {
      const { data } = await api.get("/patients/");
      return normalizeList(data);
    },
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/patients/", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.patients });
    },
  });
}


