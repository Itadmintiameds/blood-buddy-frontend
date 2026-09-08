"use client";

import {
  CalendarDays,
  Droplets,
  Hospital,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Recipient {
  id: number;
  patientName: string;
  phoneNumber: string;
  bloodType: string;
  bloodGroup: string;
  units: number;
  dateOfBirth: string;
  hospitalName: string;
  dateOfRequest: string;
}

const recipientData: Recipient[] = [
  {
    id: 1,
    patientName: "Raju",
    phoneNumber: "8680879180",
    bloodType: "PRBC",
    bloodGroup: "O+",
    units: 5,
    dateOfBirth: "18/02/1999",
    hospitalName: "KMC H",
    dateOfRequest: "12/09/2026",
  },
  {
    id: 2,
    patientName: "Manja",
    phoneNumber: "8954920180",
    bloodType: "Platelets",
    bloodGroup: "B+",
    units: 10,
    dateOfBirth: "02/08/1998",
    hospitalName: "KPR H",
    dateOfRequest: "08/08/2026",
  },
  {
    id: 3,
    patientName: "Priya",
    phoneNumber: "6783561918",
    bloodType: "FFP",
    bloodGroup: "O-",
    units: 3,
    dateOfBirth: "10/05/2001",
    hospitalName: "Royal Care",
    dateOfRequest: "10/08/2026",
  },
  {
    id: 4,
    patientName: "Karthik",
    phoneNumber: "7580692920",
    bloodType: "RDP",
    bloodGroup: "AB-",
    units: 6,
    dateOfBirth: "07/07/1996",
    hospitalName: "ABC H",
    dateOfRequest: "12/09/2026",
  },
];

export function RecipientManagement() {
  const [search, setSearch] = useState("");

  const filteredRecipients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return recipientData;
    }

    return recipientData.filter((recipient) => {
      return (
        recipient?.patientName.toLowerCase().includes(query) ||
        recipient?.phoneNumber.includes(query) ||
        recipient?.bloodType.toLowerCase().includes(query) ||
        recipient?.bloodGroup.toLowerCase().includes(query) ||
        recipient?.hospitalName.toLowerCase().includes(query)
      );
    });
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <p className="text-[12px] font-medium text-[#999]">Management</p>

        <h2 className="mt-1 text-[22px] font-bold text-[#222]">
          Recipient Details
        </h2>

        <p className="mt-1 text-[13px] text-[#999]">
          Manage patient blood requests and recipient information.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[#eeeeee] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]">
        <div className="relative w-full max-w-[480px]">
          <Search
            size={18}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipient..."
            className="h-[46px] w-full rounded-xl border border-[#e5e5e5] bg-white pl-11 pr-4 text-[13px] text-[#333] outline-none transition placeholder:text-[#aaa] focus:border-[#ff3b3f] focus:ring-2 focus:ring-[#ff3b3f]/10"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#eeeeee] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] lg:block">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[13%]" />
            <col className="w-[12%]" />
            <col className="w-[11%]" />
            <col className="w-[8%]" />
            <col className="w-[7%]" />
            <col className="w-[11%]" />
            <col className="w-[18%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-[#eeeeee] bg-[#fafafa]">
              <TableHeader>S.No</TableHeader>
              <TableHeader>Patient Name</TableHeader>
              <TableHeader>Phone Number</TableHeader>
              <TableHeader>Blood Type</TableHeader>
              <TableHeader>Blood Group</TableHeader>
              <TableHeader>Units</TableHeader>
              <TableHeader>Date of Birth</TableHeader>
              <TableHeader>Hospital Name</TableHeader>
              <TableHeader>Date of Request</TableHeader>
            </tr>
          </thead>

          <tbody>
            {filteredRecipients.length > 0 ? (
              filteredRecipients.map((recipient, index) => (
                <tr
                  key={recipient.id}
                  className="border-b border-[#f0f0f0] transition-colors duration-200 last:border-b-0 hover:bg-[#fff9f9]"
                >
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0f0]">
                        <UserRound size={15} className="text-[#ff3b3f]" />
                      </div>

                      <span className="truncate font-semibold text-[#333]">
                        {recipient.patientName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{recipient.phoneNumber}</TableCell>

                  <TableCell>
                    <span className="truncate">{recipient.bloodType}</span>
                  </TableCell>

                  <TableCell>
                    <BloodGroupBadge value={recipient.bloodGroup} />
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-[#333]">
                      {recipient.units}
                    </span>
                  </TableCell>

                  <TableCell>{recipient.dateOfBirth}</TableCell>

                  <TableCell>
                    <span className="block truncate">
                      {recipient.hospitalName}
                    </span>
                  </TableCell>

                  <TableCell>{recipient.dateOfRequest}</TableCell>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <EmptyState message="No recipient data found" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tablet */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#eeeeee] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] sm:block lg:hidden">
        <div className="divide-y divide-[#eeeeee]">
          {filteredRecipients.length > 0 ? (
            filteredRecipients.map((recipient, index) => (
              <div key={recipient.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0]">
                      <UserRound size={18} className="text-[#ff3b3f]" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] text-[#aaa]">
                        S.No {index + 1}
                      </p>

                      <p className="truncate text-[14px] font-bold text-[#333]">
                        {recipient.patientName}
                      </p>
                    </div>
                  </div>

                  <BloodGroupBadge value={recipient.bloodGroup} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Phone Number"
                    value={recipient.phoneNumber}
                  />

                  <InfoItem label="Blood Type" value={recipient.bloodType} />

                  <InfoItem label="Units" value={String(recipient.units)} />

                  <InfoItem
                    label="Date of Birth"
                    value={recipient.dateOfBirth}
                  />

                  <InfoItem
                    label="Hospital Name"
                    value={recipient.hospitalName}
                  />

                  <InfoItem
                    label="Date of Request"
                    value={recipient.dateOfRequest}
                  />
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No recipient data found" />
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-4 sm:hidden">
        {filteredRecipients.length > 0 ? (
          filteredRecipients.map((recipient, index) => (
            <div
              key={recipient.id}
              className="rounded-2xl border border-[#eeeeee] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0]">
                    <UserRound size={19} className="text-[#ff3b3f]" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[#aaa]">S.No {index + 1}</p>

                    <h3 className="truncate text-[15px] font-bold text-[#333]">
                      {recipient.patientName}
                    </h3>
                  </div>
                </div>

                <BloodGroupBadge value={recipient.bloodGroup} />
              </div>

              <div className="mt-5 space-y-3">
                <MobileInfoRow
                  icon={Phone}
                  label="Phone Number"
                  value={recipient.phoneNumber}
                />

                <MobileInfoRow
                  icon={Droplets}
                  label="Blood Type"
                  value={recipient.bloodType}
                />

                <MobileInfoRow
                  icon={Droplets}
                  label="Blood Group"
                  value={recipient.bloodGroup}
                />

                <MobileInfoRow
                  icon={Droplets}
                  label="Units"
                  value={String(recipient.units)}
                />

                <MobileInfoRow
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={recipient.dateOfBirth}
                />

                <MobileInfoRow
                  icon={Hospital}
                  label="Hospital Name"
                  value={recipient.hospitalName}
                />

                <MobileInfoRow
                  icon={CalendarDays}
                  label="Date of Request"
                  value={recipient.dateOfRequest}
                />
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No recipient data found" />
        )}
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-[#444]">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-4 text-left text-[11px] font-medium leading-5 text-[#666]">
      {children}
    </td>
  );
}

function BloodGroupBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[42px] items-center justify-center rounded-full border border-[#ffd5d5] bg-[#fff5f5] px-2.5 py-1 text-[11px] font-bold text-[#ff3b3f]">
      {value}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#aaa]">
        {label}
      </p>

      <p className="mt-1 truncate text-[12px] font-medium text-[#555]">
        {value}
      </p>
    </div>
  );
}

function MobileInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#fafafa] px-3 py-2.5">
      <Icon
        size={15}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-[#ff3b3f]"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#aaa]">{label}</p>

        <p className="mt-0.5 break-words text-[12px] font-medium text-[#555]">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-5 py-10 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff3f3]">
          <Droplets size={20} className="text-[#ff3b3f]" />
        </div>

        <p className="mt-3 text-[13px] font-semibold text-[#555]">{message}</p>

        <p className="mt-1 text-[11px] text-[#aaa]">
          Recipient records will appear here.
        </p>
      </div>
    </div>
  );
}
