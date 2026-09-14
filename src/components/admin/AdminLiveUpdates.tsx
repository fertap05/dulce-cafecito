"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type AdminLiveUpdatesProps = {
  latestOrderNumber: number | null;
};

export default function AdminLiveUpdates({
  latestOrderNumber,
}: AdminLiveUpdatesProps) {
  const router = useRouter();

  const previousOrderNumber = useRef<number | null>(
    latestOrderNumber
  );

  const [soundsEnabled, setSoundsEnabled] =
    useState(false);

  // Check whether sounds were previously enabled
  // in this browser.
  useEffect(() => {
  const savedPreference =
    localStorage.getItem(
      "dulce-cafecito-order-sounds"
    );

  const frame = requestAnimationFrame(() => {
    setSoundsEnabled(
      savedPreference === "true"
    );
  });

  return () => {
    cancelAnimationFrame(frame);
  };
}, []);

  // Refresh admin data automatically.
  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [router]);

  // Detect when a NEW order appears.
  useEffect(() => {
    if (latestOrderNumber === null) {
      return;
    }

    const previous =
      previousOrderNumber.current;

    if (
      previous !== null &&
      latestOrderNumber > previous
    ) {
      if (soundsEnabled) {
        playOrderSound();
      }
    }

    previousOrderNumber.current =
      latestOrderNumber;
  }, [latestOrderNumber, soundsEnabled]);

  function enableSounds() {
    localStorage.setItem(
      "dulce-cafecito-order-sounds",
      "true"
    );

    setSoundsEnabled(true);

    // Play once so the browser knows the user
    // intentionally allowed audio.
    playOrderSound();
  }

  function disableSounds() {
    localStorage.setItem(
      "dulce-cafecito-order-sounds",
      "false"
    );

    setSoundsEnabled(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!soundsEnabled ? (
        <button
          type="button"
          onClick={enableSounds}
          className="rounded-full border border-[#ecd6d6] bg-white px-4 py-2 text-xs font-medium text-[#8e4d56] shadow-sm transition hover:bg-[#fff8f7]"
        >
          🔔 Enable Order Sounds
        </button>
      ) : (
        <button
          type="button"
          onClick={disableSounds}
          className="rounded-full border border-[#ecd6d6] bg-white px-4 py-2 text-xs text-[#94716b] shadow-sm transition hover:bg-[#fff8f7]"
        >
          🔔 Order Sounds On
        </button>
      )}
    </div>
  );
}

function playOrderSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext =
      new AudioContextClass();

    const playTone = (
      frequency: number,
      start: number
    ) => {
      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gain.gain.setValueAtTime(
        0,
        audioContext.currentTime + start
      );

      gain.gain.linearRampToValueAtTime(
        0.18,
        audioContext.currentTime + start + 0.02
      );

      gain.gain.linearRampToValueAtTime(
        0,
        audioContext.currentTime + start + 0.25
      );

      oscillator.start(
        audioContext.currentTime + start
      );

      oscillator.stop(
        audioContext.currentTime + start + 0.3
      );
    };

    playTone(660, 0);
    playTone(880, 0.22);
  } catch (error) {
    console.error(
      "Could not play order sound:",
      error
    );
  }
}