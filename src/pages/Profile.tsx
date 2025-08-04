import React from 'react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contact } from '../types';
import { 
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const Profile: React.FC = () => {
  const { user, contacts, setContacts } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'materials' | 'labor'>('materials');
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    company: '',
    phone: '',
    email: '',
    category: 'materials',
    subcategory: '',
    notes: '',
    rating: 0
  });

  const isClient = user?.role === 'client';

  const materialsContacts = contacts.filter(c => c.category === 'materials');
  const laborContacts = contacts.filter(c => c.category === 'labor');

  const getSubcategoryLabel = (subcategory: string, category: string) => {
    const labels = {
      materials: {
        'corralon': 'Corralón',
        'ferreteria': 'Ferretería',
        'ceramicos': 'Cerámicos',
        'sanitarios': 'Sanitarios',
        'electricidad': 'Electricidad',
        'pintureria': 'Pinturería'
      },
      labor: {
        'constructor': 'Constructor',
        'albanil': 'Albañil',
        'plomero': 'Plomero',
        'electricista': 'Electricista',
        'carpintero': 'Carpintero',
        'pintor': 'Pintor',
        'techista': 'Techista'
      }
    };
    return labels[category as keyof typeof labels]?.[subcategory as keyof any] || subcategory;
  };

  const openWhatsApp = (phone: string, name: string, company: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hola ${name}! Te contacto desde ConstructorApp. Me gustaría solicitar un presupuesto.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.company && newContact.phone && newContact.subcategory) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name!,
        company: newContact.company!,
        phone: newContact.phone!,
        email: newContact.email,
        category: newContact.category!,
        subcategory: newContact.subcategory!,
        notes: newContact.notes,
        rating: newContact.rating,
        createdAt: new Date()
      };
      
      setContacts([...contacts, contact]);
      setNewContact({
        name: '',
        company: '',
        phone: '',
        email: '',
        category: 'materials',
        subcategory: '',
        notes: '',
        rating: 0
      });
      setShowAddContact(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const openUserWhatsApp = () => {
    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const callPhone = () => {
    if (user?.phone) {
      window.open(`tel:${user.phone}`, '_self');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-sm text-gray-600 mt-1">
            Vista como: {user?.role === 'constructor' ? '👷‍♂️ Constructor' : '👤 Cliente'}
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PencilIcon className="h-5 w-5 mr-2" />
          Editar Perfil
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <img
              className="h-20 w-20 rounded-full border-4 border-white"
              src={user?.avatar}
              alt={user?.name}
            />
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-blue-100">{user?.company}</p>
              <p className="text-blue-100 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="text-gray-900">{user?.phone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={callPhone}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Llamar"
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={openUserWhatsApp}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="WhatsApp"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {user?.company && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Empresa</p>
                    <p className="text-gray-900">{user.company}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="text-gray-900 capitalize">
                    {user?.role === 'constructor' ? 'Constructor' : 
                     user?.role === 'client' ? 'Cliente' : 'Administrador'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={openUserWhatsApp}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Contactar por WhatsApp
                </button>

                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Enviar Email
                </button>

                <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar Información
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;