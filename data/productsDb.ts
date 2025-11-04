import { Product } from '../types';
import { productsData as seedData } from './products';

const PRODUCTS_DB_KEY = 'refrigerators_products_v2_db';

const getProducts = (): Product[] => {
    try {
        const db = localStorage.getItem(PRODUCTS_DB_KEY);
        if (db) return JSON.parse(db);
        
        // Seed data if not present
        localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(seedData));
        return seedData;
    } catch (error) {
        console.error("Failed to read products DB from localStorage", error);
        return seedData;
    }
};

const saveProducts = (products: Product[]) => {
    localStorage.setItem(PRODUCTS_DB_KEY, JSON.stringify(products));
};

export const getAllProducts = (): Product[] => {
    return getProducts();
};

export const getProductById = (id: number): Product | undefined => {
    const products = getProducts();
    return products.find(p => p.id === id);
}

export const addProduct = (product: Omit<Product, 'id'>): Product => {
    const products = getProducts();
    const newId = (products.reduce((maxId, p) => Math.max(p.id, maxId), 0) || 700) + 1;
    const newProduct: Product = { ...product, id: newId };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    return newProduct;
};

export const updateProduct = (updatedProduct: Product): Product => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index === -1) throw new Error("Product not found");

    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
};

export const deleteProduct = (productId: number): void => {
    let products = getProducts();
    products = products.filter(p => p.id !== productId);
    saveProducts(products);
};