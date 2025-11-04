import React, { useState } from 'react';
import SubPageLayout from '../components/SubPageLayout';
import { useProducts } from '../hooks/useProducts';
import { useSiteData } from '../hooks/useSiteData';
import { Product, Banner } from '../types';
import { productCategories } from '../data/products';
import { showToast } from '../utils/toast';
import Spinner from '../components/Spinner';

const AdminPage: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { banners, updateBanner } = useSiteData();
    const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [isEditingBanner, setIsEditingBanner] = useState<Banner | null>(null);

    const openProductModal = (product: Product | null) => {
        if (product) {
            setIsEditingProduct(product);
        } else {
            setIsCreatingProduct(true);
        }
    };

    const closeProductModal = () => {
        setIsEditingProduct(null);
        setIsCreatingProduct(false);
    };
    
    return (
        <SubPageLayout title="لوحة التحكم للمسؤول">
             {(isEditingProduct || isCreatingProduct) && (
                <ProductEditModal
                    product={isEditingProduct}
                    onClose={closeProductModal}
                    onSave={async (p) => {
                        if (isEditingProduct) {
                            await updateProduct(p as Product);
                            showToast('تم تحديث المنتج بنجاح');
                        } else {
                            await addProduct(p);
                            showToast('تمت إضافة المنتج بنجاح');
                        }
                        closeProductModal();
                    }}
                />
            )}
             {isEditingBanner && (
                <BannerEditModal
                    banner={isEditingBanner}
                    onClose={() => setIsEditingBanner(null)}
                    onSave={(b) => {
                        updateBanner(b);
                        showToast('تم تحديث اللافتة بنجاح');
                        setIsEditingBanner(null);
                    }}
                />
            )}
            <div className="p-4 space-y-6 text-right">
                <section className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-3">إدارة اللافتات</h2>
                    <div className="space-y-3">
                        {banners.map(banner => (
                            <div key={banner.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={banner.imageUrl} alt={`Banner ${banner.id}`} className="w-16 h-10 object-cover rounded"/>
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-500">ID: {banner.id}</p>
                                        <p className="text-gray-700 truncate">الرابط: {banner.link}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditingBanner(banner)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-semibold">تعديل</button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold">إدارة المنتجات</h2>
                        <button onClick={() => openProductModal(null)} className="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-bold">إضافة منتج</button>
                    </div>
                     <div className="space-y-2">
                        {products.sort((a,b) => a.id - b.id).map(product => (
                            <div key={product.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-3">
                                    <img src={product.iconUrl} alt={product.title} className="w-12 h-12 object-contain rounded bg-gray-100 p-1"/>
                                    <div className="text-sm">
                                        <p className="font-bold text-gray-800">{product.title}</p>
                                        <p className="text-gray-500">السعر: {product.price} | الكمية: {product.soldCount}/{product.totalQuantity}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => openProductModal(product)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-sm font-semibold">تعديل</button>
                                     <button onClick={async () => {
                                         if(window.confirm(`هل أنت متأكد أنك تريد حذف ${product.title}؟`)) {
                                            await deleteProduct(product.id);
                                            showToast("تم حذف المنتج");
                                         }
                                     }} className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-semibold">حذف</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </SubPageLayout>
    );
};

const ProductEditModal: React.FC<{
    product: Product | null;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id'> | Product) => Promise<void>;
}> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'totalIncome'>>(
        product || {
            title: '', description: '', price: 0, dailyIncome: 0, validity: 60,
            totalQuantity: 100, soldCount: 0, updateTime: '10:00', purchaseLimit: 1,
            iconUrl: '', categoryId: 1
        }
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (e.target.type === 'number' ? Number(value) : value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (product) {
                await onSave({ ...product, ...formData });
            } else {
                await onSave(formData);
            }
        } catch (error) {
            showToast("حدث خطأ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg w-full max-w-lg shadow-lg animate-scale-in text-right max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-center">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(formData).map(key => {
                                if (key === 'description') return null; // Handle separately
                                if (key === 'categoryId') return (
                                    <div key={key}>
                                        <label className="block font-bold text-sm mb-1">الفئة</label>
                                        <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 rounded-lg border-gray-300 border">
                                            {productCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                );
                                return (
                                    <div key={key}>
                                        <label className="block font-bold text-sm mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                        <input
                                            type={typeof formData[key as keyof typeof formData] === 'number' ? 'number' : 'text'}
                                            name={key}
                                            value={formData[key as keyof typeof formData]}
                                            onChange={handleChange}
                                            className="w-full p-2 rounded-lg border-gray-300 border"
                                            required
                                        />
                                    </div>
                                )
                            })}
                            <div className="md:col-span-2">
                                <label className="block font-bold text-sm mb-1">الوصف</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 rounded-lg border-gray-300 border" required />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 p-4 bg-gray-50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-700 font-bold p-3 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isLoading} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg flex justify-center items-center disabled:bg-indigo-300">
                            {isLoading ? <Spinner /> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BannerEditModal: React.FC<{
    banner: Banner;
    onClose: () => void;
    onSave: (banner: Banner) => void;
}> = ({ banner, onClose, onSave }) => {
    const [formData, setFormData] = useState(banner);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

     return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg w-full max-w-md shadow-lg animate-scale-in text-right" onClick={e => e.stopPropagation()}>
                 <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="font-bold text-lg mb-4 text-center">تعديل اللافتة (ID: {banner.id})</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold text-sm mb-1">Image URL</label>
                                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 rounded-lg border-gray-300 border" required />
                            </div>
                             <div>
                                <label className="block font-bold text-sm mb-1">Link</label>
                                <input type="text" name="link" value={formData.link} onChange={handleChange} className="w-full p-2 rounded-lg border-gray-300 border" required />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 p-4 bg-gray-50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="w-full bg-gray-200 text-gray-700 font-bold p-3 rounded-lg">إلغاء</button>
                        <button type="submit" disabled={isLoading} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-lg flex justify-center items-center">
                            حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminPage;