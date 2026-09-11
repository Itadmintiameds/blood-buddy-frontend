"use client";

import {
  CalendarDays,
  Droplets,
  MapPin,
  Phone,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Donor {
  id: number;
  donorName: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  bloodGroup: string;
  dateOfBirth: string;
  address: string;
  pincode: string;
  lastBloodDonationDate: string;
}

const donorData: Donor[] = [
  {
    id: 1,
    donorName: "Gowtham",
    mobileNumber: "8680561620",
    alternateMobileNumber: "9874123456",
    bloodGroup: "O+",
    dateOfBirth: "18/12/2000",
    address: "Coimbatore",
    pincode: "641603",
    lastBloodDonationDate: "21/07/2026",
  },
  {
    id: 2,
    donorName: "Praveen",
    mobileNumber: "9657432180",
    alternateMobileNumber: "8876543210",
    bloodGroup: "B+",
    dateOfBirth: "24/08/1998",
    address: "Erode",
    pincode: "638001",
    lastBloodDonationDate: "21/03/2026",
  },
  {
    id: 3,
    donorName: "Mani",
    mobileNumber: "8667087850",
    alternateMobileNumber: "9098765120",
    bloodGroup: "A+",
    dateOfBirth: "24/08/1999",
    address: "Tiruppur",
    pincode: "641602",
    lastBloodDonationDate: "05/08/2026",
  },
  {
    id: 4,
    donorName: "Dharan",
    mobileNumber: "9385476210",
    alternateMobileNumber: "8448092121",
    bloodGroup: "O+",
    dateOfBirth: "22/02/2000",
    address: "Ooty",
    pincode: "643001",
    lastBloodDonationDate: "28/07/2026",
  },
];

export function DonorManagement() {
  const [search, setSearch] = useState("");

  const filteredDonors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return donorData;
    }

    return donorData.filter((donor) => {
      return (
        donor?.donorName.toLowerCase().includes(query) ||
        donor?.mobileNumber.includes(query) ||
        donor?.bloodGroup.toLowerCase().includes(query) ||
        donor?.address.toLowerCase().includes(query) ||
        donor?.pincode.includes(query)
      );
    });
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <p className="text-[12px] font-medium text-[var(--color-text-placeholder-alt)]">
          Management
        </p>

        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.01em] text-[var(--color-text-primary)]">
          Donor Details
        </h2>

        <p className="mt-1 text-[13px] text-[var(--color-text-placeholder-alt)]">
          Manage registered blood donors and their donation information.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]">
        <div className="relative w-full max-w-[480px]">
          <Search
            size={18}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder-alt)]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search donor..."
            className="h-[46px] w-full rounded-xl border border-[var(--color-border-light)] bg-white pl-11 pr-4 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] lg:block">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[9%]" />
              <col className="w-[16%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)]">
                <TableHeader>S.No</TableHeader>
                <TableHeader>Donor Name</TableHeader>
                <TableHeader>Mobile Number</TableHeader>
                <TableHeader>Alternate Mobile No</TableHeader>
                <TableHeader>Blood Group</TableHeader>
                <TableHeader>Date of Birth</TableHeader>
                <TableHeader>Address</TableHeader>
                <TableHeader>Pincode</TableHeader>
                <TableHeader>Last Blood Donation Date</TableHeader>
              </tr>
            </thead>

            <tbody>
              {filteredDonors?.length > 0 ? (
                filteredDonors.map((donor, index) => (
                  <tr
                    key={donor.id}
                    className="border-b border-[var(--color-border-light)] transition-colors duration-200 last:border-b-0 hover:bg-[#fff9f9]"
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                          <UserRound
                            size={15}
                            className="text-[var(--color-primary)]"
                          />
                        </div>

                        <span className="truncate font-semibold text-[var(--color-text-body)]">
                          {donor?.donorName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>{donor?.mobileNumber}</TableCell>

                    <TableCell>{donor?.alternateMobileNumber}</TableCell>

                    <TableCell>
                      <BloodGroupBadge value={donor?.bloodGroup} />
                    </TableCell>

                    <TableCell>{donor?.dateOfBirth}</TableCell>

                    <TableCell>
                      <span className="block truncate">{donor?.address}</span>
                    </TableCell>

                    <TableCell>{donor?.pincode}</TableCell>

                    <TableCell>{donor?.lastBloodDonationDate}</TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyState message="No donor data found" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] sm:block lg:hidden">
        <div className="divide-y divide-[var(--color-border-lighter)]">
          {filteredDonors?.length > 0 ? (
            filteredDonors.map((donor, index) => (
              <div key={donor.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                      <UserRound
                        size={18}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[var(--color-text-body)]">
                        {index + 1}. {donor?.donorName}
                      </p>

                      <p className="mt-1 text-[12px] text-[var(--color-text-placeholder-alt)]">
                        {donor?.mobileNumber}
                      </p>
                    </div>
                  </div>

                  <BloodGroupBadge value={donor?.bloodGroup} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <InfoItem
                    label="Alternate Mobile"
                    value={donor?.alternateMobileNumber}
                  />

                  <InfoItem label="Date of Birth" value={donor?.dateOfBirth} />

                  <InfoItem label="Address" value={donor?.address} />

                  <InfoItem label="Pincode" value={donor?.pincode} />

                  <InfoItem
                    label="Last Donation"
                    value={donor?.lastBloodDonationDate}
                  />
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No donor data found" />
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 sm:hidden">
        {filteredDonors.length > 0 ? (
          filteredDonors.map((donor, index) => (
            <div
              key={donor.id}
              className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                    <UserRound
                      size={19}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[var(--color-text-placeholder)]">
                      S.No {index + 1}
                    </p>

                    <h3 className="truncate text-[15px] font-bold text-[var(--color-text-body)]">
                      {donor.donorName}
                    </h3>
                  </div>
                </div>

                <BloodGroupBadge value={donor.bloodGroup} />
              </div>

              <div className="mt-5 space-y-3">
                <MobileInfoRow
                  icon={Phone}
                  label="Mobile Number"
                  value={donor.mobileNumber}
                />

                <MobileInfoRow
                  icon={Phone}
                  label="Alternate Mobile"
                  value={donor.alternateMobileNumber}
                />

                <MobileInfoRow
                  icon={CalendarDays}
                  label="Date of Birth"
                  value={donor.dateOfBirth}
                />

                <MobileInfoRow
                  icon={MapPin}
                  label="Address"
                  value={donor.address}
                />

                <MobileInfoRow
                  icon={MapPin}
                  label="Pincode"
                  value={donor.pincode}
                />

                <MobileInfoRow
                  icon={Droplets}
                  label="Last Blood Donation"
                  value={donor.lastBloodDonationDate}
                />
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No donor data found" />
        )}
      </div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)]">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-4 text-left text-[11px] font-medium leading-5 text-[var(--color-text-quaternary)]">
      {children}
    </td>
  );
}

function BloodGroupBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[42px] items-center justify-center rounded-full border border-[#ffd5d5] bg-[#fff5f5] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
      {value}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]">
        {label}
      </p>

      <p className="mt-1 truncate text-[12px] font-medium text-[var(--color-text-secondary)]">
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
    <div className="flex items-start gap-3 rounded-xl bg-[var(--color-surface-alt)] px-3 py-2.5">
      <Icon
        size={15}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[var(--color-text-placeholder)]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-[12px] font-medium text-[var(--color-text-secondary)]">
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
          <Users size={20} className="text-[var(--color-primary)]" />
        </div>

        <p className="mt-3 text-[13px] font-semibold text-[var(--color-text-secondary)]">
          {message}
        </p>

        <p className="mt-1 text-[11px] text-[var(--color-text-placeholder)]">
          Donor records will appear here.
        </p>
      </div>
    </div>
  );
}
