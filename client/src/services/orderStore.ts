export interface LocalOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  divisionSlug: string;
  divisionName: string;
  widthMm: number;
  heightMm: number;
  material: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  totalPrice: number;
  status: "QUOTE" | "ORDER" | "ARTWORK" | "PROOF" | "PRODUCTION" | "COMPLETED";
  isApproved: boolean;
  isUnlocked?: boolean;
  hasCsvData: boolean;
  fileName: string;
  createdAt: string;
}

const STORAGE_KEY = "dh_all_orders";

const DEFAULT_ORDERS: LocalOrder[] = [
  {
    id: "ord-sample-1",
    orderNumber: "DH-2026-1001",
    customerId: "sample-cust-1",
    customerName: "Elena Rostova",
    customerEmail: "elena@enduro-mtb.com",
    divisionSlug: "mtb-boards",
    divisionName: "MTB Boards",
    widthMm: 190,
    heightMm: 160,
    material: "800 Micron Rigid Polypropylene",
    quantity: 50,
    unitPrice: 1.76,
    subtotal: 88.0,
    totalPrice: 105.6,
    status: "PRODUCTION",
    isApproved: true,
    isUnlocked: true,
    hasCsvData: true,
    fileName: "DH-2026-1001_MTB_BOARDS_Output.pdf",
    createdAt: "2026-11-25T10:00:00.000Z",
  },
  {
    id: "ord-sample-2",
    orderNumber: "DH-2026-1002",
    customerId: "sample-cust-2",
    customerName: "David Cole",
    customerEmail: "david@colebrand.co.uk",
    divisionSlug: "labels-stickers",
    divisionName: "Labels & Stickers",
    widthMm: 75,
    heightMm: 75,
    material: "Gloss Vinyl",
    quantity: 500,
    unitPrice: 0.18,
    subtotal: 90.0,
    totalPrice: 108.0,
    status: "PROOF",
    isApproved: false,
    isUnlocked: false,
    hasCsvData: false,
    fileName: "DH-2026-1002_LABELS_STICKERS_Output.pdf",
    createdAt: "2026-11-25T11:30:00.000Z",
  },
];

export const orderStore = {
  getAllOrders(): LocalOrder[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
      return DEFAULT_ORDERS;
    }
    return JSON.parse(raw);
  },

  getOrdersForCustomer(customerEmail: string, customerId?: string): LocalOrder[] {
    const all = this.getAllOrders();
    const filtered = all.filter(
      (o) =>
        (o.customerEmail && o.customerEmail.toLowerCase() === customerEmail.toLowerCase()) ||
        (customerId && o.customerId === customerId)
    );
    return filtered;
  },

  saveOrder(newOrder: Omit<LocalOrder, "id" | "orderNumber" | "createdAt">): LocalOrder {
    const all = this.getAllOrders();
    const orderNumber = `DH-2026-${Math.floor(2000 + Math.random() * 8000)}`;
    const fullOrder: LocalOrder = {
      ...newOrder,
      id: `ord-${Date.now()}`,
      orderNumber,
      isUnlocked: newOrder.isApproved || newOrder.status === "PRODUCTION" || newOrder.status === "COMPLETED",
      createdAt: new Date().toISOString(),
      fileName: `${orderNumber}_${newOrder.divisionSlug.toUpperCase()}_Output.pdf`,
    };

    all.unshift(fullOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return fullOrder;
  },

  updateOrderStatus(orderId: string, status: LocalOrder["status"], isApproved?: boolean): LocalOrder | null {
    const all = this.getAllOrders();
    const idx = all.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) return null;

    all[idx].status = status;
    if (isApproved !== undefined) {
      all[idx].isApproved = isApproved;
    }
    all[idx].isUnlocked = all[idx].isApproved || status === "PRODUCTION" || status === "COMPLETED";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return all[idx];
  },

  getOrderByIdOrNumber(idOrNumber: string): LocalOrder | null {
    const all = this.getAllOrders();
    return all.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber) || null;
  },
};
