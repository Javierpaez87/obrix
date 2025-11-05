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

const NeonCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/60 to-emerald-500/60 ${className}`}>
    <div className="rounded-2xl bg-neutral-950/95 backdrop-blur-sm border border-white/10">
      {children}
    </div>
  </div>
);

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
              star <= rating ? 'text-yellow-400 fill-current' : 'text-white/20'
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
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          <p className="text-sm text-white/60 mt-1">
            Vista como: {user?.role === 'constructor' ? '👷‍♂️ Constructor' : '👤 Cliente'}
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl hover:opacity-90 transition">
          <PencilIcon className="h-5 w-5 mr-2" />
          Editar Perfil
        </button>
      </div>

      <NeonCard>
        <div className="bg-gradient-to-r from-cyan-600/20 via-emerald-600/20 to-cyan-600/20 px-6 py-8 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                className="h-20 w-20 rounded-full border-4 border-white/20"
                src={user?.avatar}
                alt={user?.name}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-neutral-950"></div>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-white/70">{user?.company}</p>
              <p className="text-white/70 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>

              <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <EnvelopeIcon className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-sm text-white/60">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm text-white/60">Teléfono</p>
                    <p className="text-white">{user?.phone}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={callPhone}
                    className="p-2 text-cyan-300 hover:bg-white/10 rounded-lg transition-colors"
                    title="Llamar"
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={openUserWhatsApp}
                    className="p-2 text-emerald-300 hover:bg-white/10 rounded-lg transition-colors"
                    title="WhatsApp"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {user?.company && (
                <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                  <BuildingOfficeIcon className="h-5 w-5 text-cyan-300" />
                  <div>
                    <p className="text-sm text-white/60">Empresa</p>
                    <p className="text-white">{user.company}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <UserIcon className="h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-sm text-white/60">Rol</p>
                  <p className="text-white capitalize">
                    {user?.role === 'constructor' ? 'Constructor' :
                     user?.role === 'client' ? 'Cliente' : 'Administrador'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>

              <div className="space-y-3">
                <button
                  onClick={openUserWhatsApp}
                  className="w-full flex items-center justify-center px-4 py-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/30 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Contactar por WhatsApp
                </button>

                <button className="w-full flex items-center justify-center px-4 py-3 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Enviar Email
                </button>

                <button className="w-full flex items-center justify-center px-4 py-3 bg-white/5 text-white/70 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar Información
                </button>
              </div>
            </div>
          </div>
        </div>
      </NeonCard>
    </div>
  );
};

export default Profile;
