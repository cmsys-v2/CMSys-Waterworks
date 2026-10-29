import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { NonNavalConsumer, ConsumerCategory, CommercialWaterBill } from '../../types/commercialBilling';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Layers,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  X,
  CreditCard
} from 'lucide-react';

interface ConsumerDirectoryProps {
  onGenerateBillForConsumer: (consumer: NonNavalConsumer) => void;
  onViewInvoice: (bill: CommercialWaterBill) => void;
}

export const ConsumerDirectory: React.FC<ConsumerDirectoryProps> = ({
  onGenerateBillForConsumer,
  onViewInvoice
}) => {
  const { nonNavalConsumers, commercialBills, paymentReceipts, addNonNavalConsumer } = useData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedConsumer, setSelectedConsumer] = useState<NonNavalConsumer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New Consumer Form State
  const [consumerName, setConsumerName] = useState<string>('');
  const [companyOrOrg, setCompanyOrOrg] = useState<string>('');
  const [category, setCategory] = useState<ConsumerCategory>('COMMERCIAL_PRIVATE');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [connectionLocation, setConnectionLocation] = useState<string>('');
  const [meterSerial, setMeterSerial] = useState<string>('MTR-');
  const [initialReadingUnits, setInitialReadingUnits] = useState<number>(0);
  const [advanceDepositLkr, setAdvanceDepositLkr] = useState<number>(50000);

  const filteredConsumers = nonNavalConsumers.filter(c => {
    const matchesCategory =
      selectedCategory === 'ALL' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.accountNumber.toLowerCase().includes(q) ||
      c.consumerName.toLowerCase().includes(q) ||
      c.companyOrOrg.toLowerCase().includes(q) ||
      c.meterSerial.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleAddConsumerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumerName.trim() || !contactPhone.trim()) {
      alert('Please fill in the required consumer information.');
      return;
    }

    const nextId = String(nonNavalConsumers.length + 1).padStart(3, '0');
    const newConsumer: NonNavalConsumer = {
      accountNumber: `NNC-2024-${nextId}`,
      consumerName: consumerName.trim(),
      companyOrOrg: companyOrOrg.trim() || consumerName.trim(),
      category,
      contactPerson: contactPerson.trim() || consumerName.trim(),
      contactPhone: contactPhone.trim(),
      email: email.trim() || undefined,
      connectionLocation: connectionLocation.trim() || 'Naval Dockyard Commercial Precinct',
      meterSerial: meterSerial.trim(),
      initialReadingUnits,
      activeStatus: 'ACTIVE',
      currentArrearsLkr: 0,
      advanceDepositLkr
    };

    addNonNavalConsumer(newConsumer);
    setIsAddModalOpen(false);
    setConsumerName('');
    setCompanyOrOrg('');
  };

  // Consumer Ledger history (bills & receipts for selected client)
  const clientBills = selectedConsumer
    ? commercialBills.filter(b => b.accountNumber === selectedConsumer.accountNumber)
    : [];
  const clientReceipts = selectedConsumer
    ? paymentReceipts.filter(r => r.accountNumber === selectedConsumer.accountNumber)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                Non-Naval Commercial Accounts
              </span>
              <span className="text-xs text-slate-400">Client Registry & Ledger</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              External Consumer Registry & Ledger Cards
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Register Commercial Client</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'ALL', label: 'All Accounts' },
            { id: 'COMMERCIAL_PRIVATE', label: 'Commercial / Private' },
            { id: 'PORT_AUTHORITY_SLPA', label: 'Port Authority SLPA' },
            { id: 'CONTRACTOR_AGENCY', label: 'Contractors' },
            { id: 'SHIPPING_VESSEL_CIVILIAN', label: 'Shipping Vessels' },
            { id: 'INSTITUTIONAL', label: 'Institutional' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label} ({cat.id === 'ALL' ? nonNavalConsumers.length : nonNavalConsumers.filter(c => c.category === cat.id).length})
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search accounts by Account No (NNC-2024-...), name, company, or meter serial..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Main Grid: Consumer Cards & Active Ledger Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Accounts List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredConsumers.map(consumer => {
              const isSelected = selectedConsumer?.accountNumber === consumer.accountNumber;
              const hasArrears = consumer.currentArrearsLkr > 0;

              return (
                <div
                  key={consumer.accountNumber}
                  onClick={() => setSelectedConsumer(consumer)}
                  className={`bg-slate-900/80 border rounded-2xl p-4.5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                          {consumer.accountNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {consumer.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{consumer.consumerName}</h4>
                      <p className="text-xs text-slate-400">{consumer.companyOrOrg}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-mono">Arrears Balance</span>
                      <div className={`text-base font-black font-mono ${hasArrears ? 'text-rose-400' : 'text-emerald-400'}`}>
                        LKR {consumer.currentArrearsLkr.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Meter & Location Badges */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 font-mono mt-3">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Meter Serial:</span>
                      <span className="font-bold text-white">{consumer.meterSerial}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Current Meter Index:</span>
                      <span>{consumer.initialReadingUnits.toLocaleString()} m³</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      {consumer.connectionLocation}
                    </span>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onGenerateBillForConsumer(consumer);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
                    >
                      Issue Bill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredConsumers.length === 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
              No commercial consumers found matching your search.
            </div>
          )}
        </div>

        {/* Right: Consumer Ledger Card (5 cols) */}
        <div className="lg:col-span-5">
          {selectedConsumer ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
                    Account Ledger & History
                  </span>
                  <h4 className="text-base font-black text-white">{selectedConsumer.consumerName}</h4>
                </div>
                <button
                  onClick={() => setSelectedConsumer(null)}
                  className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Client Quick Stats */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="text-white font-bold">{selectedConsumer.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="text-slate-200">{selectedConsumer.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Advance Deposit:</span>
                  <span className="text-emerald-400 font-bold">LKR {selectedConsumer.advanceDepositLkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Current Arrears:</span>
                  <span className={selectedConsumer.currentArrearsLkr > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    LKR {selectedConsumer.currentArrearsLkr.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Client's Invoices List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    Issued Invoices ({clientBills.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {clientBills.map(bill => (
                    <div
                      key={bill.billNumber}
                      onClick={() => onViewInvoice(bill)}
                      className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-xs text-white font-mono">{bill.billNumber}</div>
                        <div className="text-[10px] text-slate-400">
                          {bill.billingPeriod} • {bill.totalUnitsConsumed} m³ consumed
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black font-mono text-cyan-300">
                          LKR {bill.totalPayableLkr.toLocaleString()}
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            bill.paymentStatus === 'PAID'
                              ? 'bg-emerald-950 text-emerald-300'
                              : bill.paymentStatus === 'OVERDUE'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}

                  {clientBills.length === 0 && (
                    <div className="text-center py-4 text-slate-500 text-xs">
                      No invoices issued for this client yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onGenerateBillForConsumer(selectedConsumer)}
                  className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Issue New Monthly Bill for Client</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
              Select any commercial consumer on the left to inspect their ledger, issued invoices, and payment receipts.
            </div>
          )}
        </div>
      </div>

      {/* Register Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-black text-white">Register Commercial / Non-Naval Consumer</h4>
                <p className="text-xs text-slate-400">Create new water meter account for external agency</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddConsumerSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Consumer Name / Entity
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colombo Dockyard Marine Repair Unit"
                  value={consumerName}
                  onChange={e => setConsumerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Company / Org</label>
                  <input
                    type="text"
                    value={companyOrOrg}
                    onChange={e => setCompanyOrOrg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tariff Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ConsumerCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  >
                    <option value="COMMERCIAL_PRIVATE">Commercial / Industrial</option>
                    <option value="PORT_AUTHORITY_SLPA">Port Authority SLPA</option>
                    <option value="CONTRACTOR_AGENCY">Contractor Agency</option>
                    <option value="SHIPPING_VESSEL_CIVILIAN">Shipping Vessel Civilian</option>
                    <option value="INSTITUTIONAL">Institutional / Quasi-Gov</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+94 77..."
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Officer Name"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Meter Serial</label>
                  <input
                    type="text"
                    value={meterSerial}
                    onChange={e => setMeterSerial(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Initial Reading (m³)</label>
                  <input
                    type="number"
                    value={initialReadingUnits}
                    onChange={e => setInitialReadingUnits(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Connection Point Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ashroff Jetty East Point"
                  value={connectionLocation}
                  onChange={e => setConnectionLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs text-white font-bold shadow"
                >
                  Register Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
