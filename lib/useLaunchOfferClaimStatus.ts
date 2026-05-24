"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

type LaunchOfferClaimStatus = {
  hasClaimed: boolean;
  isLoading: boolean;
};

type LaunchOfferClaimResponse = {
  hasClaimed?: boolean;
};

export function useLaunchOfferClaimStatus(
  user: { id?: string; email?: string | null } | null,
): LaunchOfferClaimStatus {
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!user?.id) {
      setHasClaimed(false);
      setIsLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    const fetchClaimStatus = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch("/api/launch-offer-claim", {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        });
        const result = (await response.json()) as LaunchOfferClaimResponse;

        if (isCurrent) {
          setHasClaimed(Boolean(result.hasClaimed));
        }
      } catch {
        if (isCurrent) {
          setHasClaimed(false);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void fetchClaimStatus();

    return () => {
      isCurrent = false;
    };
  }, [user?.id]);

  return { hasClaimed, isLoading };
}
