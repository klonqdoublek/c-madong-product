"use client";

import { useMutation } from "@tanstack/react-query";

interface KnowledgeAnswer {
  answer: string;
  sources: { content: string; similarity: number }[];
}

export function useKnowledgeQuery() {
  return useMutation({
    mutationFn: async (question: string): Promise<KnowledgeAnswer> => {
      const res = await fetch("/api/admin/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("Query failed");
      return res.json();
    },
  });
}
