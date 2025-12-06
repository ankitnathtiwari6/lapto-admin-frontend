import React, { useState, useEffect } from "react";
import engineerService, { type CreateTaskData } from "../../services/engineerService";
import orderService from "../../services/orderService";
import { X, Plus, AlertCircle, CheckCircle, User } from "lucide-react";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
}

interface Engineer {
  _id: string;
  fullName: string;
  email?: string;
  engineerDetails?: {
    currentWorkload: number;
    specialization?: string[];
  };
}

interface Order {
  _id: string;
  orderNumber: string;
  device?: {
    deviceTypeName: string;
    brand: string;
    model: string;
  };
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onSuccess,
}) => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState<CreateTaskData>({
    orderId: "",
    engineerId: "",
    title: "",
    description: "",
  });

  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchEngineers();
      fetchOrders();
    }
  }, [isOpen]);

  const fetchEngineers = async () => {
    try {
      const response = await engineerService.getEngineers();
      // Filter out current user
      const filteredEngineers = response.data.filter(
        (eng: Engineer) => eng._id !== currentUserId
      );
      setEngineers(filteredEngineers);
    } catch (error) {
      console.error("Error fetching engineers:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await orderService.getAll({ limit: 100 });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "engineerId") {
      const engineer = engineers.find((eng) => eng._id === value);
      setSelectedEngineer(engineer || null);
    }

    if (name === "orderId") {
      const order = orders.find((ord) => ord._id === value);
      setSelectedOrder(order || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.engineerId === currentUserId) {
      alert("You cannot assign a task to yourself!");
      return;
    }

    if (!formData.orderId || !formData.engineerId || !formData.title) {
      alert("Please fill in all required fields");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    try {
      setLoading(true);
      await engineerService.createTask(formData);
      alert("Task created and assigned successfully!");
      setShowConfirmation(false);
      onSuccess();
      handleClose();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating task");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      orderId: "",
      engineerId: "",
      title: "",
      description: "",
    });
    setSelectedEngineer(null);
    setSelectedOrder(null);
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Create New Task</h3>
              <p className="text-sm text-gray-500">Assign task to another engineer</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!showConfirmation ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Order Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Order <span className="text-red-500">*</span>
                </label>
                <select
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Choose an order...</option>
                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.orderNumber} - {order.device?.deviceTypeName || "N/A"} (
                      {order.device?.brand} {order.device?.model})
                    </option>
                  ))}
                </select>
                {selectedOrder && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedOrder.device?.deviceTypeName} - {selectedOrder.device?.brand}{" "}
                    {selectedOrder.device?.model}
                  </p>
                )}
              </div>

              {/* Engineer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To Engineer <span className="text-red-500">*</span>
                </label>
                <select
                  name="engineerId"
                  value={formData.engineerId}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="">Choose an engineer...</option>
                  {engineers.map((engineer) => (
                    <option key={engineer._id} value={engineer._id}>
                      {engineer.fullName}
                      {engineer.engineerDetails &&
                        ` (Workload: ${engineer.engineerDetails.currentWorkload})`}
                    </option>
                  ))}
                </select>
                {selectedEngineer && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">
                        {selectedEngineer.fullName}
                      </p>
                    </div>
                    {selectedEngineer.engineerDetails && (
                      <div className="text-xs text-blue-700 space-y-0.5">
                        <p>Workload: {selectedEngineer.engineerDetails.currentWorkload} tasks</p>
                        {selectedEngineer.engineerDetails.specialization &&
                          selectedEngineer.engineerDetails.specialization.length > 0 && (
                            <p>
                              Specialization:{" "}
                              {selectedEngineer.engineerDetails.specialization.join(", ")}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Replace screen, Fix battery issue..."
                  className="input-field"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add any additional details or instructions..."
                  className="input-field resize-none"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Note:</p>
                  <p className="mt-1">You cannot assign tasks to yourself. The task will be immediately assigned to the selected engineer.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Confirmation Message */}
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Confirm Task Assignment
                </h4>
                <p className="text-sm text-gray-600">
                  Please review the details before creating the task
                </p>
              </div>

              {/* Task Details Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Order</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedOrder?.orderNumber}
                  </p>
                  {selectedOrder?.device && (
                    <p className="text-xs text-gray-600">
                      {selectedOrder.device.deviceTypeName} - {selectedOrder.device.brand}{" "}
                      {selectedOrder.device.model}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Assigning To</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedEngineer?.fullName}
                  </p>
                  {selectedEngineer?.email && (
                    <p className="text-xs text-gray-600">{selectedEngineer.email}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Task Title</p>
                  <p className="text-sm font-semibold text-gray-900">{formData.title}</p>
                </div>

                {formData.description && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">Description</p>
                    <p className="text-sm text-gray-700">{formData.description}</p>
                  </div>
                )}
              </div>

              {/* Confirmation Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmCreate}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm & Create
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
