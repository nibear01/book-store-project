// backend/events/order-events.js
import { EventEmitter } from 'events';

export const orderEvents = new EventEmitter();

// Example listeners (can be replaced with real integrations)
orderEvents.on('order.created', ({ orderId, userId }) => {
  if (process.env.ORDER_EVENT_DEBUG === 'true') {
    console.log(`[order.created] orderId=${orderId} userId=${userId}`);
  }
});

orderEvents.on('order.stage.changed', ({ orderId, from, to }) => {
  if (process.env.ORDER_EVENT_DEBUG === 'true') {
    console.log(`[order.stage.changed] orderId=${orderId} ${from} -> ${to}`);
  }
});

// You can attach additional outward integrations here e.g. email, websocket, queue.
