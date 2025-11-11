import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';

const ContactForm: React.FC = () => {
    const { saveContact, closeContactModal, editingContact } = useAppStore();

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (editingContact) {
            setFormData({
                name: editingContact.name,
                title: editingContact.title,
                company: editingContact.company,
                email: editingContact.email,
                phone: editingContact.phone,
            });
        } else {
            setFormData({ name: '', title: '', company: '', email: '', phone: '' });
        }
    }, [editingContact]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveContact({ ...formData, id: editingContact?.id });
    };
    
    const inputClass = "w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
            </div>
             <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
            </div>
             <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-400 mb-1">Company</label>
                <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required className={inputClass} />
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={closeContactModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 transition-colors text-white font-semibold">Save Contact</button>
            </div>
        </form>
    );
};

export default ContactForm;
