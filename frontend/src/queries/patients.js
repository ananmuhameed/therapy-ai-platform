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

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/patients/${id}/`); 
      return id;
    },

    onSuccess: (deletedId) => {
      // 1) remove from cache instantly
      queryClient.setQueryData(qk.patients, (old) => {
        if (!old) return old;

        // if API returns array
        if (Array.isArray(old)) return old.filter((p) => String(p.id) !== String(deletedId));

        // if API returns paginated { results: [] }
        return {
          ...old,
          results: (old.results || []).filter((p) => p.id !== deletedId),
        };
      });

      // 2) optional: refetch to be 100% in sync with server
      queryClient.invalidateQueries({ queryKey: qk.patients });
    },
  });
}
