import Order from '../models/Order.model.js';

const orderRepository = {
  async create(orderData) {
    const order = new Order(orderData);
    await order.save();
    return await order.populate('items.book', 'title author');
  },
  
  async findById(orderId) {
    return await Order.findById(orderId).populate('items.book', 'title author isbn');
  },
  
  async findByOrderNumber(orderNumber) {
    return await Order.findOne({ orderNumber }).populate('items.book', 'title author isbn');
  },
  
  async findByUserId(userId, options = {}) {
    const query = Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.book', 'title author');
    
    if (options.status) {
      query.where('status').equals(options.status);
    }
    
    if (options.limit) {
      query.limit(options.limit);
    }
    
    return await query;
  },
  
  async updateStatus(orderId, status, note = null) {
    const order = await Order.findById(orderId);
    if (!order) return null;
    
    order.status = status;
    if (note) {
      order.statusHistory[order.statusHistory.length - 1].note = note;
    }
    
    await order.save();
    return order;
  },
  
  async cancel(orderId, reason) {
    const order = await Order.findById(orderId);
    if (!order) return null;
    
    await order.cancel(reason);
    return order;
  },
  
  async getStatistics(userId) {
    return await Order.getStatistics(userId);
  },
  
  async getTotalRevenue(startDate, endDate) {
    return await Order.aggregate([
      {
        $match: {
          status: { $in: ['Delivered', 'Shipped'] },
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$summary.total' },
          count: { $sum: 1 }
        }
      }
    ]);
  }
};

export default orderRepository;
