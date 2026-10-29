import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CommercialWaterBill, ConsumerPaymentReceipt } from '../../types/commercialBilling';
import {
  CreditCard,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  Receipt,
  X
} from 'lucide-react';

interface PaymentReceiptModalProps {
  bill: CommercialWaterBill;
  onClose: () => void;
  onPaymentSuccess?: (receipt: ConsumerPaymentReceipt) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  bill,
  onClose,
  onPaymentSuccess
}) => {
  const { nonNavalConsumers, recordBillPayment } = useData();

  const consumer = nonNavalConsumers.find(
    c => c.accountNumber === bill.accountNumber
  );

  const outstandingBalance = Math.max(0, bill.totalPayableLkr - bill.amountPaidLkr);

  const [amountReceived, setAmountReceived] = useState<number>(outstandingBalance);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('BANK_TRANSFER');
  const [referenceNo, setReferenceNo] = useState<string>('TXN-');
  const [receivedByBadge, setReceivedByBadge] = useState<string>(
    'CPO (S) K. Perera (Revenue)'
  );

  const newBalanceArrears = Math.max(0, outstandingBalance - amountReceived);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountReceived <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const receipt: ConsumerPaymentReceipt = {
      receiptId: `RCP-${Date.now().toString().slice(-6)}`,
      billNumber: bill.billNumber,
      accountNumber: bill.accountNumber,
      paymentDate,
      amountReceivedLkr: amountReceived,
      paymentMethod,
      referenceNo: referenceNo.trim(),
      receivedByBadge: receivedByBadge.trim(),
      balanceArrearsLkr: newBalanceArrears
    };

    recordBillPayment(receipt);
    if (onPaymentSuccess) {
      onPaymentSuccess(receipt);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Record Commercial Bill Payment</h3>
              <p className="text-xs text-slate-400">Issue official revenue receipt & update ledger</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bill & Client Info */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Invoice:</span>
              <span className="text-white font-bold">{bill.billNumber} ({bill.billingPeriod})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Client:</span>
              <span className="text-slate-200">{consumer?.consumerName || bill.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Billed:</span>
              <span>LKR {bill.totalPayableLkr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1">
              <span>Outstanding Due:</span>
              <span>LKR {outstandingBalance.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Amount Received (LKR)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max={outstandingBalance || bill.totalPayableLkr}
                value={amountReceived}
                onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              >
                <option value="BANK_TRANSFER">Bank Direct Remittance</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="CASH">Cash Collection</option>
                <option value="GOV_VOUCHER">Government Journal Voucher</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Bank Ref / Cheque No
              </label>
              <input
                type="text"
                placeholder="e.g. BOC Chq #48102"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Received By (Revenue Watchkeeper / Badge)
            </label>
            <input
              type="text"
              value={receivedByBadge}
              onChange={e => setReceivedByBadge(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              required
            />
          </div>

          {/* New Balance Preview */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between font-mono">
            <span className="text-slate-400">Remaining Balance on Bill:</span>
            <span className={newBalanceArrears === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              LKR {newBalanceArrears.toLocaleString()} {newBalanceArrears === 0 && '(Fully Settled)'}
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs text-white font-bold shadow"
            >
              Confirm & Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
