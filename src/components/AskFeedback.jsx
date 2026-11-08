import { useState } from "react";
import { REASONS, sendFeedback } from "../ai.js";

/* "Did this help?" under an answer. What it saves says nothing about the
   family: the rating, a reason picked from a list, and the SNIFF needs,
   resources and events the answer named. */
export default function AskFeedback({ needs, picks, events }) {
  const [step, setStep] = useState("ask"); // ask, why, saving, thanks, failed
  const send = async (rating, reason) => {
    setStep("saving");
    try {
      await sendFeedback({ rating, reason, needs, picks, events });
      setStep("thanks");
    } catch (e) {
      setStep("failed");
    }
  };
  return (
    <div className="ask-feedback" aria-live="polite">
      {step === "ask" && (
        <>
          <span>Did this help?</span>
          <button className="btn" onClick={() => send("up")}>👍 Yes</button>
          <button className="btn" onClick={() => setStep("why")}>👎 Not quite</button>
        </>
      )}
      {step === "why" && (
        <>
          <span>What was off?</span>
          {Object.entries(REASONS).map(([k, label]) => (
            <button key={k} className="btn" onClick={() => send("down", k)}>{label}</button>
          ))}
        </>
      )}
      {step === "saving" && <span>Saving...</span>}
      {step === "thanks" && <span>Thank you. This helps make Ask AI better for families.</span>}
      {step === "failed" && <span>That did not save, but thank you for telling us.</span>}
    </div>
  );
}
