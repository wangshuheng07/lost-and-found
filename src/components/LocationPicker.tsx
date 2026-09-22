"use client";

import { useState } from "react";
import { Icon } from "@/components/Icons";
import { getCurrentPosition } from "@/lib/geolocation";

// Stand-in for the map picker: one-tap "use my location", with manual
// coordinates tucked away. Swap the body for a Mapbox picker later; the props
// can stay the same.
export function LocationPicker({
  lng,
  lat,
  onChange,
  onError,
}: {
  lng: string;
  lat: string;
  onChange: (lng: string, lat: string) => void;
  onError: (message: string | null) => void;
}) {
  const [locating, setLocating] = useState(false);
  const isSet = lng !== "" && lat !== "";

  async function handleUseMyLocation() {
    setLocating(true);
    onError(null);
    try {
      const pos = await getCurrentPosition();
      onChange(pos.lng.toFixed(6), pos.lat.toFixed(6));
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Couldn't get your location. Enter the coordinates manually instead.",
      );
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleUseMyLocation} disabled={locating} className="btn btn-white btn-sm">
          <Icon name="pin" className="h-4 w-4" />
          {locating ? "Locating…" : isSet ? "Update my location" : "Use my current location"}
        </button>

        {isSet && (
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-mint-soft py-1 pl-3 pr-1.5 text-xs font-semibold">
            Location set · {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
            <button
              type="button"
              onClick={() => onChange("", "")}
              aria-label="Clear location"
              className="rounded-full p-0.5 hover:bg-ink/10"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      <details className="text-sm">
        <summary className="w-fit cursor-pointer font-medium text-muted underline decoration-dotted underline-offset-4">
          Enter coordinates manually
        </summary>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            className="input"
            placeholder="Longitude"
            aria-label="Longitude"
            inputMode="decimal"
            value={lng}
            onChange={(e) => onChange(e.target.value, lat)}
          />
          <input
            className="input"
            placeholder="Latitude"
            aria-label="Latitude"
            inputMode="decimal"
            value={lat}
            onChange={(e) => onChange(lng, e.target.value)}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">Pick-on-a-map is coming soon.</p>
      </details>
    </div>
  );
}
