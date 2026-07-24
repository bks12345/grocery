import { Construction } from "lucide-react";

export default function ComingSoon({ title }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-basil-50 flex items-center justify-center">
        <Construction size={26} className="text-basil-600" aria-hidden="true" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-basil-700">{title}</h1>
      <p className="mt-2 text-ink-soft">
        This page is being built in an upcoming phase.
      </p>
    </div>
  );
}
