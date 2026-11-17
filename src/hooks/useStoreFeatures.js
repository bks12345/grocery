import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_STORE_FEATURES,
  getStoreFeatures,
  updateStoreFeatures,
  toggleGoatBooking,
  toggleNepalOrder,
  toggleCustomizeGrocery,
} from "../services/storeFeaturesService";

export function useStoreFeatures() {
  const [features, setFeatures] = useState(DEFAULT_STORE_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getStoreFeatures().then((data) => {
      if (isMounted && data) {
        setFeatures(data);
        setLoading(false);
      }
    });

    const handleFeatureUpdate = (e) => {
      if (e.detail && isMounted) {
        setFeatures((prev) => ({ ...prev, ...e.detail }));
      }
    };

    window.addEventListener("daalbhat:features-updated", handleFeatureUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("daalbhat:features-updated", handleFeatureUpdate);
    };
  }, []);

  const toggleGoat = useCallback(async (activeState) => {
    const next = typeof activeState === "boolean" ? activeState : !features.goatBookingActive;
    setFeatures((prev) => ({ ...prev, goatBookingActive: next }));
    return toggleGoatBooking(next);
  }, [features.goatBookingActive]);

  const toggleNepal = useCallback(async (activeState) => {
    const next = typeof activeState === "boolean" ? activeState : !features.nepalOrderActive;
    setFeatures((prev) => ({ ...prev, nepalOrderActive: next }));
    return toggleNepalOrder(next);
  }, [features.nepalOrderActive]);

  const toggleCustomizeGroceryHandler = useCallback(async (activeState) => {
    const next = typeof activeState === "boolean" ? activeState : !features.customizeGroceryActive;
    setFeatures((prev) => ({ ...prev, customizeGroceryActive: next }));
    return toggleCustomizeGrocery(next);
  }, [features.customizeGroceryActive]);

  return {
    features,
    loading,
    goatBookingActive: features.goatBookingActive !== false,
    nepalOrderActive: features.nepalOrderActive !== false,
    customizeGroceryActive: features.customizeGroceryActive !== false,
    toggleGoat,
    toggleNepal,
    toggleCustomizeGrocery: toggleCustomizeGroceryHandler,
    updateFeatures: updateStoreFeatures,
  };
}
