export type OrderDTO = {
  user_id: number
  order_id: number,
  status: string,
  products: { product_id: number, quantity: number }[]
}