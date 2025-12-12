import React, { useState } from "react";

interface BulkImportPanelProps {
  onImport: (parsedData: any[]) => void;
}

const BulkImportPanel: React.FC<BulkImportPanelProps> = ({ onImport }) => {
  const [bulkData, setBulkData] = useState("");
  const [parsedOrders, setParsedOrders] = useState<any[]>([]);

  const parseBulkData = () => {
    if (!bulkData.trim()) {
      alert("Please paste data from Google Sheets");
      return;
    }

    const lines = bulkData.trim().split("\n");
    if (lines.length === 0) {
      alert("No data found");
      return;
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const orders: any[] = [];

    dataLines.forEach((line, index) => {
      const columns = line.split("\t");
      if (columns.length < 10) return;

      const customerName = columns[2];
      const address = columns[3];
      const mobileNumber = columns[4];
      const model = columns[5];
      const description = columns[6];
      const problem = columns[7];
      const billNo = columns[1];

      // Skip empty rows
      if (!customerName.trim() || !model.trim()) return;

      // Extract phone number (take first phone if multiple)
      const phone = mobileNumber.split(",")[0].trim();

      orders.push({
        id: `bulk-${Date.now()}-${index}`,
        customerName: customerName.trim(),
        phone: phone,
        address: address.trim(),
        model: model.trim(),
        description: description.trim(),
        problem: problem.trim(),
        billNo: billNo.trim(),
      });
    });

    if (orders.length === 0) {
      alert("No valid orders found in the pasted data");
      return;
    }

    setParsedOrders(orders);
  };

  const handleImport = () => {
    if (parsedOrders.length === 0) {
      alert("No orders to import. Please parse the data first.");
      return;
    }

    const confirmImport = window.confirm(
      `Are you sure you want to import ${parsedOrders.length} orders to the manual entry form?`
    );
    if (!confirmImport) return;

    onImport(parsedOrders);

    // Reset form
    setBulkData("");
    setParsedOrders([]);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          How to use Bulk Import:
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Open your Google Sheets with order data</li>
          <li>Select all rows (including header) and copy (Ctrl+C or Cmd+C)</li>
          <li>Paste the data in the text area below</li>
          <li>Click "Parse Data" to preview the orders</li>
          <li>
            Review the parsed orders and click "Import to Form" to populate the
            manual entry table
          </li>
          <li>Review and edit the orders in the manual entry tab before saving</li>
        </ol>
        <p className="mt-3 text-xs text-blue-700">
          <strong>Required columns:</strong> Date, Vch/Bill No, Customer Name,
          Address, Mobile Number, Model, Description, Problem, Price, Amount
        </p>
      </div>

      {/* Paste Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Paste Google Sheets Data Here:
        </label>
        <textarea
          value={bulkData}
          onChange={(e) => setBulkData(e.target.value)}
          placeholder="Paste your data from Google Sheets here (including the header row)..."
          rows={12}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={parseBulkData}
            disabled={!bulkData.trim()}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Parse Data
          </button>
          <button
            onClick={() => {
              setBulkData("");
              setParsedOrders([]);
            }}
            disabled={!bulkData.trim() && parsedOrders.length === 0}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preview Table */}
      {parsedOrders.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                Parsed Orders Preview
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {parsedOrders.length} orders ready to import
              </p>
            </div>
            <button
              onClick={handleImport}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
            >
              Import to Form ({parsedOrders.length} orders)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Customer Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Address
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Problem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parsedOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.address}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.model}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.problem}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImportPanel;
