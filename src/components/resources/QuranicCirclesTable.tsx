import { MapPin, Phone, Clock } from "lucide-react";

export type CircleLocation = {
  id: string;
  name: string;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export function QuranicCirclesTable({ locations }: { locations: CircleLocation[] }) {
  if (!locations.length) {
    return (
      <p className="text-center text-foreground-muted py-12">
        Quranic circle schedules will be posted soon. Contact your local Tanzeem office.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-primary text-white">
          <tr>
            <th className="text-left p-3 font-semibold">Circle</th>
            <th className="text-left p-3 font-semibold">City</th>
            <th className="text-left p-3 font-semibold hidden md:table-cell">Address</th>
            <th className="text-left p-3 font-semibold hidden sm:table-cell">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {locations.map((loc) => (
            <tr key={loc.id} className="hover:bg-muted/20">
              <td className="p-3 font-medium">{loc.name}</td>
              <td className="p-3 text-foreground-muted">{loc.city || "—"}</td>
              <td className="p-3 text-foreground-muted hidden md:table-cell max-w-xs">
                {loc.address ? (
                  <span className="inline-flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {loc.address}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-3 hidden sm:table-cell">
                {loc.phone && (
                  <a href={`tel:${loc.phone}`} className="text-primary hover:underline flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {loc.phone}
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-foreground-muted p-4 flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        Times vary by location — contact the circle coordinator for the current schedule.
      </p>
    </div>
  );
}
