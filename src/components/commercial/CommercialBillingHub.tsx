import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ConsumerDirectory } from './ConsumerDirectory';
import { MeterReadingEntryModal } from './MeterReadingEntryModal';
import { PrintableWaterInvoice } from './PrintableWaterInvoice';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import {
  CommercialWaterBill,
  NonNavalConsumer,
  ConsumerPaymentReceipt
} from '../../types/commercialBilling';
import {
  DollarSign,
  FileText,
  Users,
  Receipt,
  Plus,
  Printer,
  Calendar,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ArrowUpRight
} from 'lucide-react';

export const CommercialBillingHub: React.FC = () => {
  const { nonNavalConsumers, commercialBills, paymentReceipts } = useData();

  const [activeTab, setActiveTab] = useState<'directory' | 'invoices' | 'receipts'>('directory');

  // Modals state
  const [isBillModalOpen, setIsBillModalOpen] = useState<boolean>(false);
  const [selectedConsumerForBill, setSelectedConsumerForBill] = useState<NonNavalConsumer | null>(null);

  const [viewingInvoice, setViewingInvoice] = useState<CommercialWaterBill | null>(null);
  const [payingBill, setPayingBill] = useState<CommercialWaterBill | null>(null);

  // Search filter for Invoices table
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('ALL');

  // Calculations
  const totalArrears = nonNavalConsumers.reduce(
    (sum, c) => sum + (c.currentArrearsLkr || 0),
    0
  );

  const totalBilledLkr = commercialBills.reduce(
    (sum, b) => sum + (b.totalPayableLkr || 0),
    0
  );

  const totalCollectedLkr = paymentReceipts.reduce(
    (sum, r) => sum + (r.amountReceivedLkr || 0),
    0
  );

  const unpaidBillsCount = commercialBills.filter(
    b => b.paymentStatus === 'UNPAID' || b.paymentStatus === 'OVERDUE'
  ).length;

  const handleGenerateBillForConsumer = (consumer: NonNavalConsumer) => {
    setSelectedConsumerForBill(consumer);
    setIsBillModalOpen(true);
  };

  const handleBillCreated = (bill: CommercialWaterBill) => {
    setViewingInvoice(bill);
  };

  const filteredBills = commercialBills.filter(b => {
    const matchesStatus =
      invoiceStatusFilter === 'ALL' || b.paymentStatus === invoiceStatusFilter;
    const q = invoiceSearch.toLowerCase().trim();
    const consumer = nonNavalConsumers.find(c => c.accountNumber === b.accountNumber);
    const matchesSearch =
      !q ||
      b.billNumber.toLowerCase().includes(q) ||
      b.accountNumber.toLowerCase().includes(q) ||
      (consumer && consumer.consumerName.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Revenue Statistics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                  Revenue & Non-Naval Supply Hub
                </span>
                <span className="text-xs text-slate-400">NWSDB August 2023 Gazette Tariff Engine</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mt-1">
                Commercial & Non-Naval Consumer Billing Hub
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedConsumerForBill(null);
                setIsBillModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Generate Monthly Bill</span>
            </button>
          </div>
        </div>

        {/* Revenue KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Consumers</span>
            <div className="text-xl font-black text-white mt-0.5">{nonNavalConsumers.length} Accounts</div>
            <span className="text-[11px] text-slate-400">Commercial, SLPA & ships</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cumulative Billed</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5 font-mono">
              LKR {(totalBilledLkr / 1000).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">k</span>
            </div>
            <span className="text-[11px] text-slate-400">{commercialBills.length} Invoices Issued</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Revenue Collected</span>
            <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
              LKR {(totalCollectedLkr / 1000).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">k</span>
            </div>
            <span className="text-[11px] text-slate-400">{paymentReceipts.length} Official Receipts</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Outstanding Arrears</span>
            <div className={`text-xl font-black mt-0.5 font-mono ${totalArrears > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              LKR {(totalArrears / 1000).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-400">k</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {unpaidBillsCount > 0 ? `${unpaidBillsCount} unpaid or overdue invoice(s)` : 'Zero arrears balance'}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-3 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'directory'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4 text-cyan-400" />
          <span>Consumer Accounts & Client Ledger</span>
          <span className="bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full text-[10px] border border-cyan-800/40">
            {nonNavalConsumers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'invoices'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>Monthly Invoices & Billing Register</span>
          {unpaidBillsCount > 0 && (
            <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full text-[10px] border border-rose-800/40 animate-pulse">
              {unpaidBillsCount} Unpaid
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs transition-all shrink-0 ${
            activeTab === 'receipts'
              ? 'border-cyan-400 text-white bg-slate-900/60 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="h-4 w-4 text-cyan-400" />
          <span>Payment Receipts & Revenue Ledger</span>
          <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] border border-emerald-800/40">
            {paymentReceipts.length} Receipts
          </span>
        </button>
      </div>

      {/* Render Sub-View */}
      {activeTab === 'directory' && (
        <ConsumerDirectory
          onGenerateBillForConsumer={handleGenerateBillForConsumer}
          onViewInvoice={bill => setViewingInvoice(bill)}
        />
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Invoices Search and Filter */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search bills by invoice number, account, or consumer name..."
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-400">Status:</span>
              <select
                value={invoiceStatusFilter}
                onChange={e => setInvoiceStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-cyan-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Account / Consumer</th>
                    <th className="py-3 px-4">Cycle</th>
                    <th className="py-3 px-4">Consumed (m³)</th>
                    <th className="py-3 px-4">Total Payable</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredBills.map(bill => {
                    const consumer = nonNavalConsumers.find(c => c.accountNumber === bill.accountNumber);
                    const isUnpaid = bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'OVERDUE';

                    return (
                      <tr key={bill.billNumber} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{bill.billNumber}</td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-slate-200">{consumer?.consumerName || bill.accountNumber}</div>
                          <span className="text-[10px] text-cyan-400 font-mono">{bill.accountNumber}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans">{bill.billingPeriod}</td>
                        <td className="py-3 px-4 text-slate-200">
                          {bill.totalUnitsConsumed.toLocaleString()} m³
                        </td>
                        <td className="py-3 px-4 font-black text-cyan-300">
                          LKR {bill.totalPayableLkr.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              bill.paymentStatus === 'PAID'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : bill.paymentStatus === 'OVERDUE'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isUnpaid && (
                              <button
                                onClick={() => setPayingBill(bill)}
                                className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[11px] shadow"
                              >
                                Record Pay
                              </button>
                            )}
                            <button
                              onClick={() => setViewingInvoice(bill)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] flex items-center gap-1"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Official Naval Payment Receipts Archive ({paymentReceipts.length} Receipts)
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice Reference</th>
                  <th className="py-3 px-4">Consumer</th>
                  <th className="py-3 px-4">Method & Cheque / Bank Ref</th>
                  <th className="py-3 px-4">Amount Received</th>
                  <th className="py-3 px-4">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {paymentReceipts.map(rec => {
                  const consumer = nonNavalConsumers.find(c => c.accountNumber === rec.accountNumber);

                  return (
                    <tr key={rec.receiptId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-300">{rec.receiptId}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans">{rec.paymentDate}</td>
                      <td className="py-3 px-4 text-slate-200">{rec.billNumber}</td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white">{consumer?.consumerName || rec.accountNumber}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{rec.accountNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="font-bold text-slate-200">{rec.paymentMethod}</span> ({rec.referenceNo})
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-400">
                        LKR {rec.amountReceivedLkr.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans">{rec.receivedByBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Bill Generation */}
      {isBillModalOpen && (
        <MeterReadingEntryModal
          onClose={() => setIsBillModalOpen(false)}
          preselectedConsumer={selectedConsumerForBill}
          onBillGenerated={handleBillCreated}
        />
      )}

      {/* Modal: Printable Invoice */}
      {viewingInvoice && (
        <PrintableWaterInvoice
          bill={viewingInvoice}
          consumer={nonNavalConsumers.find(c => c.accountNumber === viewingInvoice.accountNumber)}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {/* Modal: Payment Recording */}
      {payingBill && (
        <PaymentReceiptModal
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onPaymentSuccess={() => setPayingBill(null)}
        />
      )}
    </div>
  );
};
