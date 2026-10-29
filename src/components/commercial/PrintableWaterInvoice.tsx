import React from 'react';
import { CommercialWaterBill, NonNavalConsumer } from '../../types/commercialBilling';
import { computeCommercialBill } from '../../services/tariffEngine';
import { Printer, X, Droplet, ShieldCheck, QrCode } from 'lucide-react';

interface PrintableWaterInvoiceProps {
  bill: CommercialWaterBill;
  consumer?: NonNavalConsumer;
  onClose: () => void;
}

export const PrintableWaterInvoice: React.FC<PrintableWaterInvoiceProps> = ({
  bill,
  consumer,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const computation = computeCommercialBill(
    bill.totalUnitsConsumed,
    consumer?.category || 'COMMERCIAL_PRIVATE',
    bill.broughtForwardArrearsLkr
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-3xl w-full my-6 text-slate-900">
        {/* Top Control Bar (Hidden during printing) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-cyan-400 font-mono">
              INVOICE PREVIEW: {bill.billNumber}
            </span>
            <span className="text-[10px] text-slate-400">
              ({bill.paymentStatus})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-900/40 transition-all"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Sheet (White Paper Design) */}
        <div className="bg-white text-slate-900 rounded-2xl p-8 shadow-inner border border-slate-300 font-sans print:border-none print:shadow-none print:p-0">
          {/* Official Naval Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-14 w-14 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center font-black text-xl shrink-0">
                <Droplet className="h-8 w-8 text-cyan-400 fill-cyan-400" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-wider uppercase text-slate-900">
                  Sri Lanka Navy — Eastern Naval Command
                </h1>
                <h2 className="text-xs font-extrabold text-slate-700 tracking-tight uppercase">
                  Command Civil Engineering Department (CCED - E)
                </h2>
                <p className="text-[10px] text-slate-500">
                  Naval Dockyard, Trincomalee | Water Utilities & Revenue Division
                </p>
                <p className="text-[9px] text-slate-400 font-mono">
                  Tel: +94 26 222 2222 Ext. 4412 | Gazette Ref: NWSDB/2023/REV-AUG
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-black uppercase text-slate-900 bg-slate-100 px-3 py-1 rounded border border-slate-300 inline-block font-mono">
                WATER UTILITY INVOICE
              </div>
              <div className="text-sm font-black text-slate-900 font-mono mt-2">
                {bill.billNumber}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Cycle: <strong>{bill.billingPeriod}</strong>
              </div>
            </div>
          </div>

          {/* Customer & Bill Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Billed Consumer Details
              </span>
              <div className="font-bold text-sm text-slate-900">
                {consumer?.consumerName || bill.accountNumber}
              </div>
              <div className="text-slate-700 font-medium">
                {consumer?.companyOrOrg}
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                Account No: <strong>{bill.accountNumber}</strong>
              </div>
              <div className="text-slate-600 text-[11px]">
                Connection: {consumer?.connectionLocation || 'Dockyard Commercial Berth'}
              </div>
              <div className="text-slate-600 text-[11px]">
                Category: <strong>{(consumer?.category || 'COMMERCIAL_PRIVATE').replace('_', ' ')}</strong>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-500 block font-sans">
                Invoice & Meter Schedule
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Date:</span>
                <span className="font-bold text-slate-900">{bill.billDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-bold text-rose-600">{bill.dueDate}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">Meter Serial:</span>
                <span className="font-bold text-slate-900">{consumer?.meterSerial || 'MTR-STD-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Previous Reading:</span>
                <span>{bill.previousMeterReading.toLocaleString()} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Reading:</span>
                <span className="font-bold text-slate-900">{bill.currentMeterReading.toLocaleString()} m³</span>
              </div>
              <div className="flex justify-between text-cyan-800 font-bold border-t border-slate-200 pt-1">
                <span>Consumed Units:</span>
                <span>{bill.totalUnitsConsumed.toLocaleString()} Units ({(bill.totalUnitsConsumed * 1000).toLocaleString()} L)</span>
              </div>
            </div>
          </div>

          {/* Itemized Tariff Charges Table */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-slate-800 mb-2 tracking-wider">
              Itemized Volumetric & Service Tariff Breakdown (NWSDB 2023 Gazette)
            </h3>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3">Description / Consumption Slab</th>
                  <th className="py-2 px-3 text-center">Units (m³)</th>
                  <th className="py-2 px-3 text-right">Tariff Rate (LKR)</th>
                  <th className="py-2 px-3 text-right">Subtotal (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-slate-800">
                {computation.slabBreakdown.map((slab, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans text-slate-700">{slab.slabDescription}</td>
                    <td className="py-2 px-3 text-center">{slab.unitsInSlab}</td>
                    <td className="py-2 px-3 text-right">{slab.ratePerUnit.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold">{slab.amountLkr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="py-2 px-3 font-sans text-slate-700 font-semibold">
                    Fixed Monthly Service Charge (Category Standard)
                  </td>
                  <td className="py-2 px-3 text-right font-bold">
                    {computation.fixedCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>

                {bill.broughtForwardArrearsLkr > 0 && (
                  <tr className="bg-rose-50 text-rose-800">
                    <td colSpan={3} className="py-2 px-3 font-sans font-bold">
                      Brought-Forward Unpaid Arrears
                    </td>
                    <td className="py-2 px-3 text-right font-bold font-mono">
                      {bill.broughtForwardArrearsLkr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-mono">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-xs font-black uppercase font-sans text-slate-900">
                    Total Amount Due (LKR):
                  </td>
                  <td className="py-2.5 px-3 text-right text-sm font-black text-slate-900">
                    LKR {bill.totalPayableLkr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Instructions & Bank Details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-600 mb-6 space-y-1">
            <span className="font-bold text-slate-800 uppercase block">Payment Instructions:</span>
            <p>
              Please make cheques payable to <strong>"COMMAND NAVAL FINANCE OFFICER (EAST) - WATER REVENUE"</strong> or remit via direct bank transfer to Bank of Ceylon Trincomalee Navy Branch (A/C: 0002341209). Ensure Invoice Number <strong>{bill.billNumber}</strong> is cited on remittances.
            </p>
          </div>

          {/* Detachable Remittance Slip */}
          <div className="border-t-2 border-dashed border-slate-400 pt-4 mt-6">
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono mb-2">
              <span>✂ DETACH AND RETURN WITH PAYMENT</span>
              <span>CCED (E) BANK REMITTANCE SLIP</span>
            </div>

            <div className="bg-slate-100 p-3 rounded-xl border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                <div className="font-bold text-slate-900">
                  {consumer?.consumerName || bill.accountNumber}
                </div>
                <div className="text-[11px] text-slate-600">
                  Acc: <strong>{bill.accountNumber}</strong> | Inv: <strong>{bill.billNumber}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  Due: <strong>{bill.dueDate}</strong>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-sans block">Amount Payable:</span>
                <div className="text-base font-black text-slate-900">
                  LKR {bill.totalPayableLkr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
