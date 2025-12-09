import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import type { User as UserType, CreateSubTaskData } from "../../types";
import subTaskService from "../../services/subTaskService";
import orderService from "../../services/orderService";
import type { ServiceOrder } from "../../types";
import SubTaskForm from "../SubTaskForm";
import api from "../../lib/api";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
  prefilledOrderId?: string;
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

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onSuccess,
  prefilledOrderId,
}) => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(prefilledOrderId || "");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEngineers();
      if (!prefilledOrderId) {
        fetchOrders();
      } else {
        // Fetch the single order to display its info
        fetchSingleOrder(prefilledOrderId);
      }
    }
  }, [isOpen, prefilledOrderId]);

  useEffect(() => {
    if (prefilledOrderId) {
      setSelectedOrderId(prefilledOrderId);
    }
  }, [prefilledOrderId]);

  const fetchEngineers = async () => {
    try {
      // Use staff route which automatically filters by company through auth middleware
      const response = await api.get('/staff/engineers');
      // Filter out current user
      const filteredEngineers = response.data.data.filter(
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
      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchSingleOrder = async (orderId: string) => {
    try {
      const response = await orderService.getById(orderId);
      if (response.data) {
        setOrders([response.data]);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  const handleSubmit = async (formData: CreateSubTaskData) => {
    if (!selectedOrderId) {
      alert("Please select an order");
      return;
    }

    if (formData.assignedTo === currentUserId) {
      alert("You cannot assign a task to yourself!");
      return;
    }

    setCreating(true);
    try {
      await subTaskService.create(selectedOrderId, formData);
      alert("Task created and assigned successfully!");
      handleClose();
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating task");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedOrderId(prefilledOrderId || "");
    onClose();
  };

  if (!isOpen) return null;

  const selectedOrder = orders.find((ord) => ord._id === selectedOrderId);

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
              <h3 className="text-lg font-bold text-gray-900">
                {prefilledOrderId ? 'Create Subtask' : 'Create New Task'}
              </h3>
              <p className="text-sm text-gray-500">
                {prefilledOrderId ? 'Delegate part of this order to another engineer' : 'Assign task to another engineer'}
              </p>
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
        <div className="p-6 space-y-4">
          {/* Order Selection (only if not prefilled) */}
          {!prefilledOrderId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Order <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
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
          )}

          {/* Order Info (when prefilled) */}
          {prefilledOrderId && selectedOrder && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium mb-1">Selected Order</p>
              <p className="text-sm font-semibold text-gray-900">{selectedOrder.orderNumber}</p>
              {selectedOrder.device && (
                <p className="text-xs text-gray-600 mt-1">
                  {selectedOrder.device.deviceTypeName} - {selectedOrder.device.brand}{" "}
                  {selectedOrder.device.model}
                </p>
              )}
            </div>
          )}

          {/* SubTask Form */}
          <SubTaskForm
            users={engineers as UserType[]}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={creating}
            showDescription={true}
            title={prefilledOrderId ? "Subtask Details" : "Task Details"}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
