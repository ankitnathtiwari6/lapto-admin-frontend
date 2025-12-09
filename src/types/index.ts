export interface CompanyUser {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  companyId: string | Company;
  role: 'super_admin' | 'admin' | 'engineer' | 'accountant' | 'reception' | 'customer';
  userTypes?: Array<'super_admin' | 'admin' | 'engineer' | 'customer'>;
  status: 'active' | 'inactive' | 'suspended';
  engineerDetails?: {
    employeeId?: string;
    specialization?: string[];
    currentWorkload: number;
    rating: number;
    totalRepairsCompleted: number;
    joinDate?: string;
  };
  technicianDetails?: {
    employeeId?: string;
    specialization?: string[];
    currentWorkload: number;
    rating: number;
    totalRepairsCompleted: number;
    joinDate?: string;
  };
  adminDetails?: {
    employeeId?: string;
    permissions?: string[];
    joinDate?: string;
  };
  customerDetails?: {
    address?: string;
    gstin?: string;
    notes?: string;
    alternatePhone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility
export interface User extends CompanyUser {}

export interface DeviceType {
  _id: string;
  name: string;
  slug: string;
  fieldDefinitions: FieldDefinition[];
  requiresSerialNumber: boolean;
  requiresIMEI: boolean;
  requiresPassword: boolean;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FieldDefinition {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'dropdown' | 'checkbox';
  isRequired: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ServiceType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  applicableDeviceTypes: string[];
  estimatedDuration?: number;
  category?: string;
  warrantyPeriod?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  color: string;
  isFinal: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address?: string;
  gst?: string;
  logo?: string;
  settings?: {
    invoicePrefix?: string;
    orderPrefix?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  _id?: string;
  companyName: string;
  name: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  defaultGstRate: number;
  logo?: string;
  termsAndConditions?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  voucherNo?: string;
  orderType: 'service' | 'product';
  companyId: string;
  customer: {
    customerId: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };

  // Service Order specific fields
  device?: {
    deviceTypeId: string;
    deviceTypeName: string;
    brand: string;
    model: string;
    attributes: Record<string, any>;
    serialNumber?: string;
    purchaseDate?: string;
    warrantyStatus?: string;
    warrantyExpiryDate?: string;
    accessories?: string[];
    physicalCondition?: string;
    password?: string;
  };
  problemDescription?: string;
  customerComplaints?: string[];
  diagnosedIssues?: string[];
  services?: Array<{
    serviceTypeId: string;
    serviceTypeName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    estimatedCost: number;
    actualCost?: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'returned' | 'reopened';
    startedAt?: string;
    completedAt?: string;
    notes?: string;
  }>;
  assignedTo?: {
    userId: string;
    userName: string;
    assignedAt: string;
    assignedBy: string;
  };
  stageId?: string;
  stageName?: string;
  stageHistory?: Array<{
    stageId: string;
    stageName: string;
    timestamp: string;
    updatedBy: string;
    updatedByName: string;
    assignedTo?: string;
    notes?: string;
  }>;
  receivedDate?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  deliveryDate?: string;
  partsUsed?: Array<{
    partName: string;
    quantity: number;
    cost: number;
    addedAt: string;
  }>;
  warrantyPeriod?: number;
  warrantyExpiryDate?: string;
  customerFeedback?: {
    rating: number;
    comment?: string;
    submittedAt: string;
  };
  images?: Array<{
    url: string;
    type: 'before' | 'during' | 'after';
    uploadedAt: string;
    uploadedBy: string;
  }>;

  // Product Order specific fields
  products?: Array<{
    productId: string;
    productName: string;
    sku?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  shippingAddress?: string;
  shippingMethod?: string;
  shippingCost?: number;
  shippingDate?: string;
  trackingNumber?: string;

  // Common fields
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'returned' | 'reopened';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subtotal: number;
  discount: number;
  taxRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  roundOff: number;
  estimatedCost: number;
  finalCost?: number;
  paidAmount: number;
  advancePayment: number;
  balancePayment: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  internalNotes: Array<{
    note: string;
    addedBy: string;
    addedByName: string;
    timestamp: string;
  }>;
  customerNotes: Array<{
    note: string;
    addedBy: string;
    addedByName: string;
    timestamp: string;
  }>;

  // Sub-task tracking
  hasSubTasks?: boolean;
  totalSubTasks?: number;
  completedSubTasks?: number;
  subTaskProgress?: number;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isDeleted: boolean;
}

// Backward compatibility alias
export interface ServiceOrder extends Order {}

export interface DashboardAnalytics {
  totalOrders: number;
  activeTechnicians: number;
  totalCustomers: number;
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  ordersByDeviceType: Array<{
    _id: {
      deviceTypeId: string;
      deviceTypeName: string;
    };
    count: number;
    totalRevenue: number;
  }>;
  revenue: {
    totalRevenue: number;
    totalEstimated: number;
    totalAdvance: number;
    totalBalance: number;
  };
  engineerPerformance: Array<{
    _id: string;
    userName: string;
    ordersCompleted: number;
    avgRepairTime: number;
    avgRating: number;
  }>;
  technicianPerformance: Array<{
    _id: string;
    userName: string;
    technicianName: string;
    ordersCompleted: number;
    totalOrders: number;
    avgRepairTime: number;
    avgCompletionTime: number;
    avgRating: number;
    totalRevenue: number;
  }>;
  popularServices: Array<{
    _id: {
      serviceTypeId: string;
      serviceTypeName: string;
    };
    count: number;
    totalRevenue: number;
  }>;
}

export interface OrderActivityLog {
  _id: string;
  orderId: string;
  orderNumber: string;
  companyId: string;
  activityType:
    | 'order_created'
    | 'order_updated'
    | 'order_assigned'
    | 'order_reassigned'
    | 'stage_changed'
    | 'subtask_created'
    | 'subtask_updated'
    | 'subtask_status_changed'
    | 'subtask_assigned'
    | 'subtask_reassigned'
    | 'subtask_deleted'
    | 'payment_added'
    | 'note_added'
    | 'device_updated'
    | 'customer_updated';
  title: string;
  description?: string;
  stageId?: string;
  stageName?: string;
  subTaskId?: string;
  subTaskTitle?: string;
  assignedTo?: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// SubTask types (imported from subTaskService)
export interface SubTask {
  _id: string;
  orderId: string;
  orderNumber: string;
  parentTaskId?: string;
  taskLevel: number;
  title: string;
  description?: string;
  taskType?: string;
  taskTypeName?: string;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  assignedAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'blocked' | 'on_hold';
  progress: number;
  outcome?: 'completed' | 'returned' | 'parts_ordered' | 'replaced' | 'repaired' | 'cancelled' | 'other';
  outcomeNotes?: string;
  startDate?: Date;
  dueDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  amount?: number;
  isPaid: boolean;
  partsUsed?: Array<{
    partName: string;
    quantity: number;
    cost: number;
    addedAt: Date;
  }>;
  updates: Array<{
    note: string;
    addedBy: string;
    addedByName: string;
    timestamp: Date;
    type: 'comment' | 'status_change' | 'assignment' | 'completion' | 'progress_update';
    oldValue?: string;
    newValue?: string;
  }>;
  dependencies?: string[];
  blockedBy?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface CreateSubTaskData {
  title: string;
  description?: string;
  taskType?: string;
  assignedTo: string;
  parentTaskId?: string;
  startDate?: string;
  dueDate?: string;
  amount?: number;
  isPaid?: boolean;
  dependencies?: string[];
}

// Customer type
export interface Customer {
  _id: string;
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Invoice types
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  orderNumber: string;
  orderId: string;
  companyId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    gstin?: string;
  };
  items: Array<{
    serviceTypeName?: string;
    productName?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  discount: number;
  taxBreakdown: {
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  };
  totalTax: number;
  roundOff: number;
  finalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth response type
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Generic API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
