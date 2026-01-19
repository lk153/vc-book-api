/**
 * Order DTO - Shapes order data for API responses
 */

export const toOrderItemDTO = (item) => {
  if (!item) return null;

  return {
    bookId: item.book?._id || item.book,
    title: item.title,
    author: item.author,
    image: item.book?.image || item.image || null,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.subtotal
  };
};

export const toShippingAddressDTO = (address) => {
  if (!address) return null;

  return {
    fullName: address.fullName,
    address: address.address,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone
  };
};

export const toOrderSummaryDTO = (summary) => {
  if (!summary) return null;

  return {
    subtotal: summary.subtotal,
    shippingFee: summary.shippingFee,
    tax: summary.tax,
    total: summary.total
  };
};

export const toOrderDTO = (order) => {
  if (!order) return null;

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: order.items?.map(toOrderItemDTO) || [],
    shippingAddress: toShippingAddressDTO(order.shippingAddress),
    paymentMethod: order.paymentMethod,
    summary: toOrderSummaryDTO(order.summary),
    status: order.status,
    statusHistory: order.statusHistory?.map(h => ({
      status: h.status,
      timestamp: h.timestamp,
      note: h.note
    })) || [],
    trackingNumber: order.trackingNumber,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };
};

export const toOrderListDTO = (orders) => {
  if (!orders || !Array.isArray(orders)) return [];
  return orders.map(toOrderDTO);
};

export default {
  toOrderDTO,
  toOrderListDTO,
  toOrderItemDTO,
  toShippingAddressDTO,
  toOrderSummaryDTO
};
