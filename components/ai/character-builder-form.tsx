"use client";

import { useState } from "react";

type Result = { prompt: string };

const cameraAngles = [
  "eye level",
  "low angle",
  "high angle",
  "top down",
  "bottom up",
  "side profile",
  "three-quarter view",
  "over-the-shoulder",
  "front view",
  "back view"
];

const shotSizes = [
  "extreme close-up",
  "close-up",
  "medium close-up",
  "medium shot",
  "medium wide",
  "wide shot",
  "full body",
  "long shot"
];

const cameraTypes = [
  "DSLR",
  "mirrorless",
  "cinema camera",
  "smartphone",
  "webcam",
  "action camera"
];

const focalLengths = [
  "18mm",
  "24mm",
  "35mm",
  "50mm",
  "85mm",
  "105mm",
  "135mm"
];

const aspectRatios = ["1:1", "4:5", "3:2", "16:9", "9:16", "21:9"];

export function CharacterBuilderForm() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [hairStyle, setHairStyle] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [outfit, setOutfit] = useState("");
  const [pose, setPose] = useState("");
  const [cameraAngle, setCameraAngle] = useState("");
  const [shotSize, setShotSize] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [location, setLocation] = useState("");
  const [cameraType, setCameraType] = useState("");
  const [lens, setLens] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/character-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gender,
          age,
          skinTone,
          hairColor,
          hairStyle,
          bodyType,
          outfit,
          pose,
          cameraAngle,
          shotSize,
          timeOfDay,
          location,
          cameraType,
          lens,
          aspectRatio,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setResult({ prompt: data.prompt as string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-black/60 p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Input label="ชื่อ" value={name} onChange={setName} placeholder="เช่น: Aria" />
        <Input label="เพศ" value={gender} onChange={setGender} placeholder="เช่น: หญิง" />
        <Input label="อายุ" value={age} onChange={setAge} placeholder="เช่น: 28" />
        <Input label="สีผิว" value={skinTone} onChange={setSkinTone} placeholder="เช่น: ผิวแทน" />
        <Input label="สีผม" value={hairColor} onChange={setHairColor} placeholder="เช่น: น้ำตาลเข้ม" />
        <Input label="ทรงผม" value={hairStyle} onChange={setHairStyle} placeholder="เช่น: ผมยาวลอน" />
        <Input label="รูปร่าง" value={bodyType} onChange={setBodyType} placeholder="เช่น: สมส่วน" />
        <Input label="ชุดที่ใส่" value={outfit} onChange={setOutfit} placeholder="เช่น: สูทสีดำ" />
        <Input label="ท่าทาง" value={pose} onChange={setPose} placeholder="เช่น: ยืนชูสองนิ้ว" />

        <Select label="มุมมองภาพ" value={cameraAngle} onChange={setCameraAngle} options={cameraAngles} />
        <Select label="ระยะภาพ" value={shotSize} onChange={setShotSize} options={shotSizes} />
        <Select label="ประเภทกล้อง" value={cameraType} onChange={setCameraType} options={cameraTypes} />
        <Select label="ระยะเลนส์" value={lens} onChange={setLens} options={focalLengths} />
        <Select label="สัดส่วนภาพ" value={aspectRatio} onChange={setAspectRatio} options={aspectRatios} />

        <Input label="เวลาในภาพ" value={timeOfDay} onChange={setTimeOfDay} placeholder="เช่น: golden hour" />
        <Input label="สถานที่" value={location} onChange={setLocation} placeholder="เช่น: โตเกียวตอนกลางคืน" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-300">หมายเหตุเพิ่มเติม</label>
        <textarea
          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm"
          rows={3}
          placeholder="เช่น: ต้อง hyper realistic เน้นผิวและรูขุมขน"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Prompt"}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result?.prompt ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prompt (English)</p>
          <pre className="whitespace-pre-wrap text-sm text-white">{result.prompt}</pre>
        </div>
      ) : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-300">{label}</label>
      <input
        className="w-full rounded-xl border border-white/15 bg-black/40 p-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-zinc-300">{label}</label>
      <select
        className="w-full rounded-xl border border-white/15 bg-black/40 p-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">ไม่ระบุ</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
