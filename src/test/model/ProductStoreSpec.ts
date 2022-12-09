import { Product } from '../../main/model/product';
import productStore from '../../main/model/ProductStore';

describe('Test ProductStore', () => {

  it('addProduct should add a product', async () => {
    const addedProduct = await productStore.addProduct({
      name: 'Lord of the Rings - The Fellowship of the Ring',
      price: 15.99,
      category: 'Fantasy'
    });

    const products: Product[] = await productStore.getAllProducts();

    expect(products).toContain(addedProduct);
  });

  it('getProduct should return requested product', async () => {
    const product: Product = await productStore.addProduct({
      name: 'Lord of the Rings - The Two Towers',
      price: 16.33,
      category: 'Fantasy'
    });

    const requestedProduct: Product = await productStore.getProduct(product.id!);

    expect(requestedProduct.id).toBe(product.id);
  });

  it('getAllProducts should return a list of products', async () => {
    const initialAmountOfProductsInStore: number = (await productStore.getAllProducts()).length;

    await productStore.addProduct({
      name: 'Lord of the Rings - The Return of the King',
      price: 14.99,
      category: 'Fantasy'
    });

    const finalAmountOfProductsInStore: number = (await productStore.getAllProducts()).length;

    expect(finalAmountOfProductsInStore).toBe(initialAmountOfProductsInStore + 1);
  });
});