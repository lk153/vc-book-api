import orderService from '../services/order.service.js';
import catchAsync from '../utils/catchAsync.js';

const orderController = {
  placeOrder: catchAsync(async (req, res) => {
    const orderData = {
      userId: req.body.userId,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      items: req.body.items,
      totalAmount: req.body.totalAmount
    };
    
    const order = await orderService.placeOrder(orderData);
    
    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã đặt thành công',
      data: order
    });
  }),
  
  getOrderById: catchAsync(async (req, res) => {
    const order = await orderService.getOrderById(req.params.orderId);
    
    res.json({
      success: true,
      data: order
    });
  }),
  
  getUserOrders: catchAsync(async (req, res) => {
    const orders = await orderService.getUserOrders(req.params.userId);
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  }),
  
  updateOrderStatus: catchAsync(async (req, res) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.orderId, status);
    
    res.json({
      success: true,
      message: 'Trạng thái đơn hàng đã được cập nhật',
      data: order
    });
  }),
  
  cancelOrder: catchAsync(async (req, res) => {
    await orderService.cancelOrder(req.params.orderId);
    
    res.json({
      success: true,
      message: 'Đơn hàng đã được hủy thành công'
    });
  })
};

export default orderController;