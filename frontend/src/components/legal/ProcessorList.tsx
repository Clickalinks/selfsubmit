import { DATA_PROCESSORS } from "@/lib/data-processors";

export function ProcessorList() {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/80">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="bg-slate-50 text-brand-black">
          <tr>
            <th className="px-4 py-3 font-semibold">Processor</th>
            <th className="px-4 py-3 font-semibold">Purpose</th>
            <th className="px-4 py-3 font-semibold">Typical data</th>
            <th className="px-4 py-3 font-semibold">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {DATA_PROCESSORS.map((processor) => (
            <tr key={processor.name}>
              <td className="px-4 py-3 font-medium text-brand-black">
                <a
                  href={processor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-green underline-offset-2 hover:underline"
                >
                  {processor.name}
                </a>
              </td>
              <td className="px-4 py-3 text-brand-muted">{processor.purpose}</td>
              <td className="px-4 py-3 text-brand-muted">{processor.dataProcessed}</td>
              <td className="px-4 py-3 text-brand-muted">{processor.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
