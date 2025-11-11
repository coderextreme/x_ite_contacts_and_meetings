import React from 'react';
import { BriefcaseIcon, MailIcon, PhoneIcon, PencilIcon, TrashIcon } from './IconComponents';
import { useAppStore } from '../store';

const ContactDetail: React.FC = () => {
  const { contacts, selectedContactId, openEditContactModal, deleteContact } = useAppStore();
  const contact = contacts.find(c => c.id === selectedContactId);

  if (!contact) return null;

  return (
    <div className="flex flex-col items-center text-center p-4 h-full animate-fade-in">
      <img src={contact.avatarUrl} alt={contact.name} className="h-40 w-40 rounded-full border-4 border-purple-400 shadow-lg shadow-purple-500/20 mb-6" />
      <h1 className="text-4xl font-bold text-white tracking-wider">{contact.name}</h1>
      <p className="text-xl text-purple-300 mt-1">{contact.title}</p>

      <div className="flex gap-4 mt-4">
          <button 
            onClick={() => openEditContactModal(contact)}
            className="p-3 rounded-full bg-gray-700 hover:bg-purple-500/40 text-purple-300 transition-colors"
            aria-label="Edit contact"
          >
            <PencilIcon className="h-6 w-6" />
          </button>
          <button 
            onClick={() => deleteContact(contact.id)}
            className="p-3 rounded-full bg-gray-700 hover:bg-red-500/40 text-red-300 transition-colors"
            aria-label="Delete contact"
          >
            <TrashIcon className="h-6 w-6" />
          </button>
      </div>
      
      <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700 w-full max-w-md">
        <div className="space-y-4 text-left">
          <div className="flex items-center">
            <BriefcaseIcon className="h-6 w-6 text-purple-400 mr-4" />
            <span className="text-gray-300">{contact.company}</span>
          </div>
          <div className="flex items-center">
            <MailIcon className="h-6 w-6 text-purple-400 mr-4" />
            <a href={`mailto:${contact.email}`} className="text-gray-300 hover:text-purple-300 transition-colors">{contact.email}</a>
          </div>
          <div className="flex items-center">
            <PhoneIcon className="h-6 w-6 text-purple-400 mr-4" />
            <a href={`tel:${contact.phone}`} className="text-gray-300 hover:text-purple-300 transition-colors">{contact.phone}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
