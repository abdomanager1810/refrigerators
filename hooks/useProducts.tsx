import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';
import * as productsDb from '../data/productsDb';

interface ProductsContextType {
    products: Product[];
    addProduct: (product: Omit<Product, 'id' | 'totalIncome'>) => Promise<Product>;
    updateProduct: (product: Product) => Promise<Product>;
    deleteProduct: (productId: number) => Promise<void>;
    getProductById: (id: number) => Product | undefined;
}

export const ProductsContext = createContext<ProductsContextType | null>(null);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        setProducts(productsDb.getAllProducts());
    }, []);

    const reloadProducts = () => {
        setProducts(productsDb.getAllProducts());
    };

    const addProduct = async (product: Omit<Product, 'id' | 'totalIncome'>): Promise<Product> => {
        const fullProduct = {
            ...product,
            totalIncome: product.dailyIncome * product.validity,
        };
        const newProduct = productsDb.addProduct(fullProduct);
        reloadProducts();
        return newProduct;
    };

    const updateProduct = async (product: Product): Promise<Product> => {
        const updatedProduct = productsDb.updateProduct(product);
        reloadProducts();
        return updatedProduct;
    };

    const deleteProduct = async (productId: number): Promise<void> => {
        productsDb.deleteProduct(productId);
        reloadProducts();
    };

    const getProductById = (id: number): Product | undefined => {
        // Ensure to get the latest from state
        return products.find(p => p.id === id);
    };

    return (
        <ProductsContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductById }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductsContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductsProvider');
    }
    return context;
};