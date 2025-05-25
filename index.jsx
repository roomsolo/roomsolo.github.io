import React, { useState, useRef } from "react";

const words = ["banana", "elephant", "giraffe", "umbrella", "zebra"];
const sentences = [
  "The quick brown fox jumps over the lazy dog",
  "She sells seashells by the seashore",
  "How much wood would a woodchuck chuck"
];

export default function SpellingBeeApp() {
  const [mode, setMode] = useState(null);
  const [current, setCurrent] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const recognitionRef = useRef(null);

  const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    return recognition;
  };

  const startMode = (selectedMode) => {
    setMode(selectedMode);
    setProgress(0);
    const list = selectedMode === "word" ? words : sentences;
    const item = list[Math.floor(Math.random() * list.length)];
    setCurrent(item);
    setStatus("Say the next part aloud.");
  };

  const handleSpeech = () => {
    const recognition = initRecognition();
    if (!recognition) return;

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript.trim().toLowerCase();
      if (mode === "word") {
        const expected = current[progress];
        if (spoken === expected) {
          const newProgress = progress + 1;
          if (newProgress === current.length) {
            setStatus("✅ Well done! Moving to next word.");
            setTimeout(() => startMode("word"), 1500);
          } else {
            setProgress(newProgress);
            setStatus(`Correct! Progress: ${newProgress}/${current.length}`);
          }
        } else {
          setProgress(Math.max(progress - 1, 0));
          setStatus("❌ Wrong letter. Try again.");
        }
      } else if (mode === "sentence") {
        const wordsInSentence = current.split(" ");
        const expected = wordsInSentence[progress].toLowerCase();
        if (spoken === expected) {
          const newProgress = progress + 1;
          if (newProgress === wordsInSentence.length) {
            setStatus("✅ Sentence complete! New one coming up...");
            setTimeout(() => startMode("sentence"), 1500);
          } else {
            setProgress(newProgress);
            setStatus(`Good! ${newProgress}/${wordsInSentence.length}`);
          }
        } else {
          setProgress(Math.max(progress - 1, 0));
          setStatus("❌ Wrong word. Try again.");
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-gray-800">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-4">🎤 Spelling Bee</h1>
        {!mode ? (
          <div className="space-y-2">
            <button
              onClick={() => startMode("word")}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Word Mode
            </button>
            <button
              onClick={() => startMode("sentence")}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Sentence Mode
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">
              {mode === "word" ? (
                <>
                  Spell this word: <strong>{current}</strong>
                  <br />Current letter: <strong>{current[progress]}</strong>
                </>
              ) : (
                <>
                  Say this sentence: <strong>{current}</strong>
                  <br />Current word: <strong>{current.split(" ")[progress]}</strong>
                </>
              )}
            </p>
            <button
              onClick={handleSpeech}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Speak
            </button>
            <p className="text-sm text-gray-600">{status}</p>
            <button
              onClick={() => setMode(null)}
              className="text-red-500 underline text-sm"
            >
              ← Back to mode selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
