import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    const sequelize = OrderModel.sequelize;
    await sequelize.transaction(async (t) => {
      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction: t,
      });
      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      }));
      await OrderItemModel.bulkCreate(items, { transaction: t });
      await OrderModel.update(
        { total: entity.total() },
        { where: { id: entity.id }, transaction: t }
      );
    });    
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({ where: { id }, include: [OrderItemModel] });
    const items: OrderItem[] = orderModel.items.map((item) => {
      return new OrderItem(
        item.id,
        item.name,
        item.price / item.quantity,
        item.product_id,
        item.quantity
      );
    });
    return new Order(orderModel.id, orderModel.customer_id, items);
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({ include: [OrderItemModel] });
    const orders: Order[] = [];
    orderModels.map((orderModel) =>  {      
      const items: OrderItem[] = orderModel.items.map((item) => {
        return new OrderItem(
          item.id,
          item.name,
          item.price / item.quantity,
          item.product_id,
          item.quantity
        );
      });
      orders.push(new Order(orderModel.id, orderModel.customer_id, items));
    });
    return orders;
  }
}
