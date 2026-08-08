import { InventoryItem, IInventoryItem } from '../models/InventoryItem';
import { AppError } from './auth.service';

export class InventoryService {
  static async createItem(data: Partial<IInventoryItem>) {
    const existing = await InventoryItem.findOne({
      name: data.name,
      category: data.category,
    });
    if (existing) {
      throw new AppError('Inventory item with same name and category already exists', 409);
    }
    const item = await InventoryItem.create(data);
    return { item };
  }

  static async getAll(query: {
    category?: string;
    itemType?: string;
    search?: string;
    lowStock?: boolean;
    expired?: boolean;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.category) filter.category = query.category;
    if (query.itemType) filter.itemType = query.itemType;
    if (query.status) filter.status = query.status;
    if (query.lowStock) {
      filter.$expr = { $lte: ['$quantity', '$minQuantity'] };
    }
    if (query.expired) {
      filter.expiryDate = { $lte: new Date() };
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } },
        { supplier: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = await InventoryItem.countDocuments(filter);
    const items = await InventoryItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { items, total, page, limit };
  }

  static async getById(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid inventory item ID', 400);
    }
    const item = await InventoryItem.findById(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }
    return { item };
  }

  static async update(id: string, data: Partial<IInventoryItem>) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid inventory item ID', 400);
    }
    const item = await InventoryItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }
    return { item };
  }

  static async delete(id: string) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid inventory item ID', 400);
    }
    const item = await InventoryItem.findByIdAndDelete(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }
    return { message: 'Inventory item deleted successfully' };
  }

  static async updateStock(
    id: string,
    quantity: number,
    action: 'add' | 'remove' | 'adjust',
    reason?: string
  ) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid inventory item ID', 400);
    }
    const item = await InventoryItem.findById(id);
    if (!item) {
      throw new AppError('Inventory item not found', 404);
    }

    if (action === 'add') {
      item.quantity += quantity;
    } else if (action === 'remove') {
      if (item.quantity < quantity) {
        throw new AppError(
          `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`,
          400
        );
      }
      item.quantity -= quantity;
    } else {
      item.quantity = quantity;
    }

    await item.save();

    return {
      item,
      stockInfo: {
        itemId: item._id,
        itemName: item.name,
        currentQuantity: item.quantity,
        minQuantity: item.minQuantity,
        action,
        quantity,
        reason,
        isLowStock: item.quantity <= item.minQuantity,
        isExpired: item.expiryDate ? item.expiryDate <= new Date() : false,
      },
    };
  }

  static async getLowStock() {
    const items = await InventoryItem.find({
      status: 'active',
      $expr: { $lte: ['$quantity', '$minQuantity'] },
    }).sort({ quantity: 1 });

    return { items, count: items.length };
  }

  static async getExpiringSoon(days: number = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const items = await InventoryItem.find({
      status: 'active',
      expiryDate: { $ne: null, $lte: expiryDate, $gte: new Date() },
    }).sort({ expiryDate: 1 });

    return { items, count: items.length };
  }
}
