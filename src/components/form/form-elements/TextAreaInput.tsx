import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Textarea } from "../input/TextArea";
import Label from "../Label";

export default function TextAreaInput() {
  const [message, setMessage] = useState("");
  const [messageTwo, setMessageTwo] = useState("");
  return (
    <ComponentCard title="Textarea input field">
      <div className="space-y-6">
        {/* Default Textarea */}
        <div>
          <Label>Description</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
          />
        </div>

        {/* Disabled Textarea */}
        <div>
          <Label>Description</Label>
          <Textarea rows={6} disabled />
        </div>

        {/* Error Textarea */}
        <div>
          <Label>Description</Label>
          <Textarea
            rows={6}
            value={messageTwo}
            onChange={(e) => setMessageTwo(e.target.value)}
          />
          <p className="mt-2 text-sm text-error-500">
            Please enter a valid message.
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
