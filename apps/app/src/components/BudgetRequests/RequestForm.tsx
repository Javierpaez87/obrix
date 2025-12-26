import React, { useState } from 'react';
import type ReactCSS from 'react';
import { useApp } from '../../context/AppContext';
import { BudgetRequest } from '../../types';
import { supabase } from '../../lib/supabase';
import { cleanPhone, padRight, truncate, composeInviteTail } from './whatsappUtils';
import RequestFormModalShell from './RequestFormParts/RequestFormModalShell';
import TicketMainFieldsSection from './RequestFormParts/TicketMainFieldsSection';
import MaterialsListSection from './RequestFormParts/MaterialsListSection';
import ProjectSelectSection from './RequestFormParts/ProjectSelectSection';
import DatesSection from './RequestFormParts/DatesSection';
import PrioritySection from './RequestFormParts/PrioritySection';
import WhatsAppSection from './RequestFormParts/WhatsAppSection';
import ContactsPickerModal from './RequestFormParts/ContactsPickerModal';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  requestType?: 'constructor' | 'supplier';
  editingRequest?: BudgetRequest;
  theme?: 'light';
}

/** Identidad Obrix */
const NEON = '#00FFA3';

/** Paleta LIGHT (amable a la vista) */
const LIGHT_BG = '#FFFBEA';        // overlay crema suave
const LIGHT_SURFACE = '#FFFFFF';   // modal / cards
const LIGHT_BORDER  = 'rgba(0,0,0,0.08)';
const LIGHT_TEXT    = '#1E1E1E';
const LIGHT_MUTED   = '#444444';

const fieldBase =
  'w-full px-4 py-2 rounded-lg bg-white border text-[--tx] placeholder-[--tx-muted] outline-none ' +
  'focus:ring-2 focus:ring-[--neon] focus:border-transparent transition-colors duration-300';

const labelBase = 'block text-sm font-medium text-[--tx-muted] mb-2';
const sectionCard =
  'rounded-xl p-2 sm:p-4 border bg-[--surface] transition-colors duration-300';
const divider = 'border-t';

const RequestForm: React.FC<RequestFormProps> = ({
  isOpen,
  onClose,
  projectId,
  requestType = 'constructor',
  editingRequest,
}) => {
  const { budgetRequests, setBudgetRequests, refreshBudgetRequests, projects, user, contacts = [], users = [] } = useApp() as any;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    priority: 'medium' as const,
    dueDate: '',
    type: (requestType === 'constructor' ? 'combined' : 'materials') as 'labor' | 'materials' | 'combined',
    useStartDate: false,
    startDate: '',
    useEndDate: false,
    endDate: '',
  });

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editingRequest) {
      setFormData({
        title: editingRequest.title,
        description: editingRequest.description,
        projectId: editingRequest.projectId || '',
        priority: editingRequest.priority,
        dueDate: editingRequest.dueDate ? new Date(editingRequest.dueDate).toISOString().split('T')[0] : '',
        type: editingRequest.type || 'combined',
        useStartDate: !!(editingRequest as any).startDate,
        startDate: (editingRequest as any).startDate ? new Date((editingRequest as any).startDate).toISOString().split('T')[0] : '',
        useEndDate: !!(editingRequest as any).endDate,
        endDate: (editingRequest as any).endDate ? new Date((editingRequest as any).endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: projectId || '',
        priority: 'medium',
        dueDate: '',
        type: (requestType === 'constructor' ? 'combined' : 'materials') as 'labor' | 'materials' | 'combined',
        useStartDate: false,
        startDate: '',
        useEndDate: false,
        endDate: '',
      });
    }
  }, [editingRequest, projectId, requestType]);

  React.useEffect(() => {
    const loadMaterialsList = async () => {
      if (editingRequest && editingRequest.type === 'materials') {
        try {
          const { data: list } = await supabase
            .from('material_lists')
            .select('id, name, description')
            .eq('ticket_id', editingRequest.id)
            .maybeSingle();

          if (list) {
            setMaterialsListName(list.name || defaultListName);
            setMaterialsListDescription(list.description || '');

            const { data: items } = await supabase
              .from('material_items')
              .select('*')
              .eq('list_id', list.id)
              .order('position');

            if (items && items.length > 0) {
              setMaterials(items.map(item => ({
                material: item.material || '',
                quantity: item.quantity != null ? String(item.quantity) : '',
                unit: item.unit || 'unidad',
                spec: item.spec || '',
                comment: item.comment || '',
              })));
            }
          }
        } catch (err) {
          console.error('[RequestForm] Error loading materials list:', err);
        }
      } else {
        setMaterialsListName(defaultListName);
        setMaterialsListDescription('');
        setMaterials([{ material: '', quantity: '', unit: 'unidad', spec: '', comment: '' }]);
      }
    };

    loadMaterialsList();
  }, [editingRequest]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  const defaultListName = 'Lista de materiales #1';

  type MaterialRow = {
    material: string;
    quantity: string;
    unit: string;
    spec: string;
    comment: string;
  };

  const [materialsListName, setMaterialsListName] = useState(defaultListName);
  const [materialsListDescription, setMaterialsListDescription] = useState('');
  const [materials, setMaterials] = useState<MaterialRow[]>([
    { material: '', quantity: '', unit: 'unidad', spec: '', comment: '' },
  ]);

  const addMaterialRow = () =>
    setMaterials((prev) => [...prev, { material: '', quantity: '', unit: 'unidad', spec: '', comment: '' }]);

  const removeMaterialRow = (idx: number) =>
    setMaterials((prev) => prev.filter((_, i) => i !== idx));

  const updateMaterialRow = (idx: number, patch: Partial<MaterialRow>) =>
    setMaterials((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const set = <K extends keyof typeof formData>(k: K, v: (typeof formData)[K]) =>
    setFormData((s) => ({ ...s, [k]: v }));

  // Heurística: está en contactos/usuarios? por teléfono o email
  const isUserInObrix = (phoneOrEmail: string) => {
    const key = phoneOrEmail.toLowerCase();
    const normPhone = cleanPhone(key);

    const inContacts = Array.isArray(contacts) && contacts.some((c: any) =>
      (c.phone && cleanPhone(String(c.phone)) === normPhone) ||
      (c.email && String(c.email).toLowerCase() === key)
    );

    const inUsers = Array.isArray(users) && users.some((u: any) =>
      (u.phone && cleanPhone(String(u.phone)) === normPhone) ||
      (u.email && String(u.email).toLowerCase() === key)
    );

    return inContacts || inUsers;
  };

  const persistMaterialsForTicket = async (ticketId: string) => {
    if (formData.type !== 'materials') return;

    const name = (materialsListName || defaultListName).trim() || defaultListName;
    const description = materialsListDescription.trim();

    const cleanRows = materials
      .map((r, idx) => ({ ...r, position: idx + 1 }))
      .filter((r) => String(r.material || '').trim().length > 0);

    if (cleanRows.length === 0) {
      throw new Error('Debe haber al menos un material en la lista para guardar.');
    }

    const { data: existingList } = await supabase
      .from('material_lists')
      .select('id')
      .eq('ticket_id', ticketId)
      .maybeSingle();

    let listId: string;

    if (existingList) {
      const { error: updateErr } = await supabase
        .from('material_lists')
        .update({
          name,
          description: description || null,
        })
        .eq('id', existingList.id);

      if (updateErr) {
        console.error('[RequestForm] Error updating material list:', updateErr);
        throw new Error(`No se pudo actualizar la lista de materiales: ${updateErr.message || 'Error de base de datos'}`);
      }

      listId = existingList.id;
    } else {
      const { data: newList, error: insertErr } = await supabase
        .from('material_lists')
        .insert({
          ticket_id: ticketId,
          name,
          description: description || null,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('[RequestForm] Error inserting material list:', insertErr);
        throw new Error(`No se pudo guardar la lista de materiales: ${insertErr.message || 'Error de base de datos'}`);
      }

      if (!newList) {
        throw new Error('No se pudo crear la lista de materiales (no se recibió ID).');
      }

      listId = newList.id;
    }

    const { error: deleteErr } = await supabase
      .from('material_items')
      .delete()
      .eq('list_id', listId);

    if (deleteErr) {
      console.error('[RequestForm] Error deleting old material items:', deleteErr);
    }

    const payload = cleanRows.map((r) => ({
      list_id: listId,
      position: r.position,
      material: r.material,
      quantity: r.quantity ? Number(String(r.quantity).replace(',', '.')) : null,
      unit: r.unit || null,
      spec: r.spec || null,
      comment: r.comment || null,
    }));

    const { error: itemsErr } = await supabase
      .from('material_items')
      .insert(payload);

    if (itemsErr) {
      console.error('[RequestForm] Error inserting material items:', itemsErr);
      throw new Error(`No se pudieron guardar los materiales: ${itemsErr.message || 'Error de base de datos'}`);
    }

    console.log('[RequestForm] Materials persisted successfully:', {
      listId,
      itemCount: payload.length,
    });
  };

  const composeMaterialsText = () => {
  const rows = materials.filter(r => String(r.material || '').trim());
  const name = (materialsListName || defaultListName).trim() || defaultListName;
  const desc = materialsListDescription.trim();

  if (!rows.length) return `Lista: ${name}\n(la lista está vacía)`;

  const colItem = 20;
  const colQty = 6;
  const colUnit = 8;
  const colSpec = 18;
  const colComment = 18;

  const headerLine =
    padRight('ITEM', colItem) +
    padRight('CANT', colQty) +
    padRight('UNID', colUnit) +
    padRight('SPECS', colSpec) +
    padRight('COMENT', colComment);

  const separatorLine = '-'.repeat(colItem + colQty + colUnit + colSpec + colComment);

  const tableRows = rows.map((r) => {
    const item = padRight(truncate(r.material, colItem), colItem);
    const qty = padRight(r.quantity || '-', colQty);
    const unit = padRight(r.unit || '-', colUnit);
    const spec = padRight(truncate(r.spec || '-', colSpec), colSpec);
    const comment = padRight(truncate(r.comment || '-', colComment), colComment);
    return item + qty + unit + spec + comment;
  });

  const table = '```\n' + headerLine + '\n' + separatorLine + '\n' + tableRows.join('\n') + '\n```';

  const tip = `\n\nPara visualizar en WhatsApp la tabla completa, *poné el celular en horizontal.*`;

  return `Lista: ${name}${desc ? `\nDescripción: ${desc}` : ''}\n\n${table}${tip}`;
};




  // Mensajería
  const composeBaseMessage = () => {
    const projName = formData.projectId ?
      (projects.find((p: any) => p.id === formData.projectId)?.name || '') : '';
    const tipo =
      requestType === 'constructor'
        ? (formData.type === 'labor'
            ? 'Presupuesto de mano de obra'
            : formData.type === 'combined'
              ? 'Presupuesto de mano de obra + materiales'
              : 'Presupuesto')
        : 'Presupuesto de materiales';

    const fechas: string[] = [];
    if (formData.useStartDate && formData.startDate)
      fechas.push(`Inicio: ${new Date(formData.startDate).toLocaleDateString('es-AR')}`);
    if (formData.useEndDate && formData.endDate)
      fechas.push(`Fin: ${new Date(formData.endDate).toLocaleDateString('es-AR')}`);
    if (formData.dueDate)
      fechas.push(`Fecha límite: ${new Date(formData.dueDate).toLocaleDateString('es-AR')}`);

    const projectLine = projName ? `\nObra: ${projName}` : '';

    if (formData.type === 'materials') {
      const materialsText = composeMaterialsText();
      const notasGenerales = formData.description ? `\n\nNotas generales: ${formData.description}` : '';
      return (
`Has recibido una solicitud de: ${tipo}${projectLine}
Título: ${formData.title}

${materialsText}${notasGenerales}
${fechas.length ? '\n' + fechas.join(' · ') : ''}`.trim()
      );
    }

    return (
`Has recibido una solicitud de: ${tipo}${projectLine}
Título: ${formData.title}
Detalle: ${formData.description}
${fechas.length ? fechas.join(' · ') : ''}`.trim()
    );
  };

  const composeActionTail = (_: string) => {
    if (formData.type === 'materials') {
      return `\n\n*Abrí Obrix para ofertar o rechazar por esta lista de materiales.*`;
    }
    return `\n\nAbrí Obrix para **Aceptar** o **Rechazar** esta solicitud.`;
  };

  const handleWhatsAppBlast = async () => {
    if (!user?.id) {
      alert('Tenés que iniciar sesión para enviar solicitudes.');
      return;
    }

    if (!formData.title || !formData.description) {
      alert('Completá el título y la descripción antes de enviar.');
      return;
    }

    if (formData.type === 'materials') {
      const listName = (materialsListName || '').trim();
      if (!listName) {
        alert('El nombre de la lista es obligatorio.');
        return;
      }

      const hasValidItems = materials.some(r => String(r.material || '').trim().length > 0);
      if (!hasValidItems) {
        alert('Debés agregar al menos un material a la lista.');
        return;
      }
    }

    setShowContactsModal(true);
  };

  const sendWhatsAppToContacts = async (selectedContacts: string[], manualPhones: string[] = []) => {
  const allRecipients = [...selectedContacts, ...manualPhones];

  if (!allRecipients.length) {
    alert('Seleccioná al menos un contacto o agregá un número para enviar.');
    return;
  }

  if (!user?.id) {
    alert('Tenés que iniciar sesión para enviar solicitudes.');
    return;
  }

  setIsSubmitting(true);

  try {
    let ticketId: string;

    // 1) Crear / actualizar ticket
    if (editingRequest) {
      ticketId = editingRequest.id;

      const { error } = await supabase
        .from('tickets')
        .update({
          project_id: formData.projectId || null,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          start_date: formData.useStartDate ? formData.startDate || null : null,
          end_date: formData.useEndDate ? formData.endDate || null : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingRequest.id);

      if (error) {
        console.error('[RequestForm] Error updating ticket:', error);
        alert('Hubo un error al actualizar la solicitud.');
        setIsSubmitting(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          created_by: user.id,
          project_id: formData.projectId || null,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          start_date: formData.useStartDate ? formData.startDate || null : null,
          end_date: formData.useEndDate ? formData.endDate || null : null,
          creator_role: user.role ?? 'client',
        })
        .select();

      if (error || !data || data.length === 0) {
        console.error('[RequestForm] Error creating ticket:', error);
        alert('Hubo un error al guardar la solicitud: ' + (error?.message || 'No data returned'));
        setIsSubmitting(false);
        return;
      }

      ticketId = data[0].id;
    }

    await persistMaterialsForTicket(ticketId);

    // 2) Preparar mensaje y primer contacto
    const base = composeBaseMessage();
    const origin = window.location.origin;

    const firstContact = allRecipients[0];
    const phone = cleanPhone(firstContact);
    const isPhone = phone.length > 0;

    console.log('[RequestForm] Processing first contact:', { firstContact, phone, isPhone });

    // 3) Match opcional contra usuarios existentes (si tenés `users` poblado)
    const matchedUser =
      Array.isArray(users)
        ? users.find((u: any) =>
            (isPhone && u.phone && cleanPhone(String(u.phone)) === phone) ||
            (!isPhone && u.email?.toLowerCase() === firstContact.toLowerCase())
          )
        : null;

    // 4) Verificar si ya existe un recipient para evitar duplicados
    const { data: existingRecipient } = await supabase
      .from('ticket_recipients')
      .select('id')
      .eq('ticket_id', ticketId)
      .eq('recipient_profile_id', matchedUser ? matchedUser.id : null)
      .maybeSingle();

    let recipientData;

    if (existingRecipient) {
      recipientData = existingRecipient;
      console.log('[RequestForm] Recipient already exists, reusing:', recipientData);
    } else {
      const { data: newRecipient, error: recipientError } = await supabase
        .from('ticket_recipients')
        .insert({
          ticket_id: ticketId,
          ticket_creator_id: user.id,
          recipient_profile_id: matchedUser ? matchedUser.id : null,
          recipient_phone: matchedUser ? null : (isPhone ? phone : null),
          recipient_email: matchedUser ? null : (!isPhone ? firstContact : null),
          status: 'sent',
        })
        .select('id')
        .single();

      if (recipientError || !newRecipient) {
        console.error('[RequestForm] Error creating recipient:', recipientError);
        alert(`Error al crear destinatario: ${recipientError?.message || 'Error desconocido'}`);
        setIsSubmitting(false);
        return;
      }

      recipientData = newRecipient;
    }

    // 5) Link y WA URL (sin ?r= param, link compartido)
    const ticketLink = `${origin}/ticket/${ticketId}`;
    const isObrix = isUserInObrix(firstContact);
    const linkLine = `\n\n👉 Ver y responder acá: ${ticketLink}`;
    const msg = `${base}${isObrix ? composeActionTail(firstContact) : composeInviteTail(firstContact)}${linkLine}`;

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    console.log('[RequestForm] Redirecting to WhatsApp:', waUrl);

    // 6) Refrescar UI y cerrar modales
    await refreshBudgetRequests();
    setShowContactsModal(false);
    onClose();

    // 7) Crear recipients restantes en background (no abre WA para cada uno)
    if (allRecipients.length > 1) {
      const remainingPromises = allRecipients.slice(1).map(async (phoneOrEmail) => {
        const p = cleanPhone(phoneOrEmail);
        const pIsPhone = p.length > 0;

        const uMatched =
          Array.isArray(users)
            ? users.find((u: any) =>
                (pIsPhone && u.phone && cleanPhone(String(u.phone)) === p) ||
                (!pIsPhone && u.email?.toLowerCase() === phoneOrEmail.toLowerCase())
              )
            : null;

        const { data: existingRec } = await supabase
          .from('ticket_recipients')
          .select('id')
          .eq('ticket_id', ticketId)
          .eq('recipient_profile_id', uMatched ? uMatched.id : null)
          .maybeSingle();

        if (existingRec) {
          console.log('[RequestForm] Recipient already exists (remaining), skipping:', existingRec);
          return { phoneOrEmail, recipientId: existingRec.id };
        }

        const { data: rd, error: re } = await supabase
          .from('ticket_recipients')
          .insert({
            ticket_id: ticketId,
            ticket_creator_id: user.id,
            recipient_profile_id: uMatched ? uMatched.id : null,
            recipient_phone: uMatched ? null : (pIsPhone ? p : null),
            recipient_email: uMatched ? null : (!pIsPhone ? phoneOrEmail : null),
            status: 'sent',
          })
          .select('id')
          .single();

        if (re || !rd) {
          console.error('[RequestForm] Error creating recipient (remaining):', re);
          return null;
        }

        return { phoneOrEmail, recipientId: rd.id };
      });

      Promise.all(remainingPromises).then((results) => {
        console.log('[RequestForm] Remaining contacts processed:', results);
      });
    }

    // 8) Redirigir a WhatsApp (sin modal)
    window.location.href = waUrl;
  } catch (err) {
    console.error('[RequestForm] Error sending WhatsApp:', err);
    alert('Ocurrió un error al enviar: ' + (err as Error).message);
    setIsSubmitting(false);
  }
};


  // Submit → guarda o actualiza en Supabase (tabla tickets)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user?.id) {
      alert('Tenés que iniciar sesión para crear una solicitud.');
      return;
    }

    if (formData.type === 'materials') {
      const listName = (materialsListName || '').trim();
      if (!listName) {
        alert('El nombre de la lista es obligatorio.');
        return;
      }

      const hasValidItems = materials.some(r => String(r.material || '').trim().length > 0);
      if (!hasValidItems) {
        alert('Debés agregar al menos un material a la lista.');
        return;
      }
    }

    console.log('[RequestForm] Submitting form, user:', user.id, 'editing:', !!editingRequest);
    setIsSubmitting(true);

    try {
      if (editingRequest) {
        // UPDATE existing ticket
        console.log('[RequestForm] Updating ticket:', editingRequest.id);
        const { error } = await supabase
          .from('tickets')
          .update({
            project_id: formData.projectId || null,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
            due_date: formData.dueDate || null,
            start_date: formData.useStartDate ? formData.startDate || null : null,
            end_date: formData.useEndDate ? formData.endDate || null : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRequest.id);

        if (error) {
          console.error('[RequestForm] Error updating ticket:', error);
          alert('Hubo un error al actualizar la solicitud.');
          setIsSubmitting(false);
          return;
        }

        console.log('[RequestForm] Ticket updated successfully, refreshing list');
        await persistMaterialsForTicket(editingRequest.id);
        await refreshBudgetRequests();
        alert('Solicitud actualizada correctamente.');
      } else {
        // INSERT new ticket
        console.log('[RequestForm] Creating new ticket with data:', {
          created_by: user.id,
          title: formData.title,
          type: formData.type,
          priority: formData.priority,
        });

        const { data, error } = await supabase.from('tickets').insert({
          created_by: user.id,
          project_id: formData.projectId || null,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          start_date: formData.useStartDate ? formData.startDate || null : null,
          end_date: formData.useEndDate ? formData.endDate || null : null,
          creator_role: user.role ?? 'client',
        }).select();

        if (error) {
          console.error('[RequestForm] Error creating ticket:', error);
          alert('Hubo un error al guardar la solicitud: ' + error.message);
          setIsSubmitting(false);
          return;
        }

        console.log('[RequestForm] Ticket created successfully:', data);
        await persistMaterialsForTicket(data[0].id);
        await refreshBudgetRequests();
        alert('Solicitud creada correctamente.');
      }
    } catch (err) {
      console.error('[RequestForm] Unexpected error:', err);
      alert('Ocurrió un error inesperado: ' + (err as Error).message);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onClose();
  };

  // CSS Vars
  const vars: ReactCSS.CSSProperties = {
    ['--neon' as any]: NEON,
    ['--tx' as any]: LIGHT_TEXT,
    ['--tx-muted' as any]: LIGHT_MUTED,
    ['--surface' as any]: LIGHT_SURFACE,
    ['--border' as any]: LIGHT_BORDER,
  };

  // Filtrar contactos relevantes según el tipo de solicitud
  const relevantContacts = Array.isArray(contacts) ? contacts.filter((c: any) => {
    if (requestType === 'constructor') {
      return c.category === 'labor';
    } else {
      return c.category === 'materials';
    }
  }) : [];

  return (
    <>
      <RequestFormModalShell
        isOpen={isOpen}
        onClose={onClose}
        editingRequest={editingRequest}
        requestType={requestType}
        LIGHT_BG={LIGHT_BG}
        LIGHT_SURFACE={LIGHT_SURFACE}
        NEON={NEON}
        LIGHT_TEXT={LIGHT_TEXT}
        LIGHT_MUTED={LIGHT_MUTED}
        vars={vars}
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          <TicketMainFieldsSection
            requestType={requestType}
            formType={formData.type}
            title={formData.title}
            description={formData.description}
            onTypeChange={(type) => set('type', type)}
            onTitleChange={(title) => set('title', title)}
            onDescriptionChange={(description) => set('description', description)}
            fieldBase={fieldBase}
            labelBase={labelBase}
          />

          {formData.type === 'materials' && (
            <MaterialsListSection
              materialsListName={materialsListName}
              materialsListDescription={materialsListDescription}
              materials={materials}
              onListNameChange={setMaterialsListName}
              onListDescriptionChange={setMaterialsListDescription}
              onAddRow={addMaterialRow}
              onRemoveRow={removeMaterialRow}
              onUpdateRow={updateMaterialRow}
              fieldBase={fieldBase}
              labelBase={labelBase}
              sectionCard={sectionCard}
              NEON={NEON}
              LIGHT_TEXT={LIGHT_TEXT}
              LIGHT_MUTED={LIGHT_MUTED}
              LIGHT_BORDER={LIGHT_BORDER}
            />
          )}

          <ProjectSelectSection
            projectId={formData.projectId}
            projects={projects}
            onProjectChange={(projectId) => set('projectId', projectId)}
            fieldBase={fieldBase}
            labelBase={labelBase}
            sectionCard={sectionCard}
            NEON={NEON}
          />

          <DatesSection
            dueDate={formData.dueDate}
            useStartDate={formData.useStartDate}
            startDate={formData.startDate}
            useEndDate={formData.useEndDate}
            endDate={formData.endDate}
            onDueDateChange={(date) => set('dueDate', date)}
            onUseStartDateChange={(use) => set('useStartDate', use)}
            onStartDateChange={(date) => set('startDate', date)}
            onUseEndDateChange={(use) => set('useEndDate', use)}
            onEndDateChange={(date) => set('endDate', date)}
            fieldBase={fieldBase}
            labelBase={labelBase}
            sectionCard={sectionCard}
            NEON={NEON}
            LIGHT_MUTED={LIGHT_MUTED}
          />

          <PrioritySection
            priority={formData.priority}
            onPriorityChange={(priority) => set('priority', priority)}
            fieldBase={fieldBase}
            labelBase={labelBase}
            sectionCard={sectionCard}
            NEON={NEON}
            LIGHT_MUTED={LIGHT_MUTED}
          />

          <WhatsAppSection
            editingRequest={editingRequest}
            requestType={requestType}
            onWhatsAppClick={handleWhatsAppBlast}
            fieldBase={fieldBase}
            labelBase={labelBase}
            sectionCard={sectionCard}
            NEON={NEON}
            LIGHT_MUTED={LIGHT_MUTED}
          />

          <div className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 ${divider}`} style={{ borderColor: NEON }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'transparent',
                color: LIGHT_TEXT,
                border: `1px solid ${LIGHT_BORDER}`
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'transparent',
                color: LIGHT_TEXT,
                border: `1px solid ${NEON}`,
                boxShadow: `0 0 5px ${NEON}20`
              }}
            >
              {isSubmitting ? (editingRequest ? 'Guardando…' : 'Guardando…') : (editingRequest ? 'Guardar sin Enviar' : 'Guardar Borrador')}
            </button>
          </div>
        </form>
      </RequestFormModalShell>

      <ContactsPickerModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        relevantContacts={relevantContacts}
        onSend={sendWhatsAppToContacts}
        LIGHT_BG={LIGHT_BG}
        LIGHT_SURFACE={LIGHT_SURFACE}
        NEON={NEON}
        LIGHT_TEXT={LIGHT_TEXT}
        LIGHT_MUTED={LIGHT_MUTED}
        vars={vars}
      />
    </>
  );
};

export default RequestForm;
