import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  CheckCircle,
  XCircle,
  Calendar,
  AlertTriangle,
  Clock,
  MessageCircle,
  Edit,
  Send,
  Trash2,
} from 'lucide-react';

const NEON = '#00FFA3';

interface Ticket {
  id: string;
  title: string;
  description: string;
  type: 'labor' | 'materials' | 'combined';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  due_date: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  project_id: string | null;
  created_by?: string | null;
}

interface Recipient {
  id: string;
  ticket_id: string;
  status: string;
  recipient_phone: string | null;
  recipient_email: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  recipient_profile_id?: string | null;
  ticket_creator_id?: string | null;
  offer_amount?: number | null;
  offer_message?: string | null;
  offer_estimated_days?: number | null;
}

interface MaterialsList {
  id: string;
  ticket_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface MaterialItem {
  id: string;
  list_id: string;
  position: number | null;
  material: string;
  quantity: number | null;
  unit: string | null;
  spec: string | null;
  comment: string | null;
}

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();

  // ⚠️ Importante: users puede o no existir en el contexto según implementación.
  // Lo tomamos con fallback seguro.
  const app: any = useApp();
  const user = app?.user;
  const isAuthenticated = app?.isAuthenticated;
  const authLoading = app?.loading;
  const users = Array.isArray(app?.users) ? app.users : [];

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [materialsList, setMaterialsList] = useState<MaterialsList | null>(null);
  const [materialsItems, setMaterialsItems] = useState<MaterialItem[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [offerDays, setOfferDays] = useState<string>('');

  // ✅ Delete UX
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletedNotice, setShowDeletedNotice] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  console.log('[TicketDetail] MOUNTED', ticketId, 'global role:', user?.role);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      localStorage.setItem('pending_ticket_link', window.location.href);
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      if (!ticketId || !user?.id) {
        setError('Link inválido: falta información.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // limpiar materiales al cambiar de ticket
        setMaterialsList(null);
        setMaterialsItems([]);

        console.log('[TicketDetail] Loading ticket for user:', user.id, 'ticket:', ticketId);

        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .maybeSingle();

        if (ticketError) {
          console.error('[TicketDetail] Ticket load error:', ticketError?.message || ticketError);
          setError(`Error al cargar el ticket: ${ticketError.message || 'Error desconocido'}`);
          setLoading(false);
          return;
        }

        if (!ticketData) {
          console.error('[TicketDetail] Ticket not found or no permission');
          setError('No tenés permiso para ver este ticket o no existe.');
          setLoading(false);
          return;
        }

        setTicket(ticketData);

        const shouldLoadMaterials = ticketData.type === 'materials' || ticketData.type === 'combined';

        if (shouldLoadMaterials) {
          const { data: listData, error: listError } = await supabase
            .from('material_lists')
            .select('id,ticket_id,name,description,created_at')
            .eq('ticket_id', ticketId)
            .maybeSingle();

          if (listError) {
            console.error('[TicketDetail] Error loading material_lists:', listError);
          } else if (listData) {
            setMaterialsList(listData);

            const { data: itemsData, error: itemsError } = await supabase
              .from('material_items')
              .select('id,list_id,position,material,quantity,unit,spec,comment')
              .eq('list_id', listData.id)
              .order('position', { ascending: true, nullsFirst: false });

            if (itemsError) {
              console.error('[TicketDetail] Error loading material_items:', itemsError);
            } else {
              setMaterialsItems(itemsData || []);
            }
          }
        }

        const isOriginatorLocal = (ticketData as any).created_by === user.id;

        if (isOriginatorLocal) {
          const { data: allRecipients, error: recipientsError } = await supabase
            .from('ticket_recipients')
            .select(`
              id,
              status,
              accepted_at,
              rejected_at,
              recipient_profile_id,
              recipient_phone,
              recipient_email,
              offer_amount,
              offer_message,
              offer_estimated_days,
              profiles:recipient_profile_id ( name )
            `)
            .eq('ticket_id', ticketId);

          if (recipientsError) {
            console.error('[TicketDetail] recipientsError:', recipientsError?.message || recipientsError);
          } else {
            setRecipients(allRecipients || []);
          }

          setRecipient(null);
          setLoading(false);
          return;
        }

        const { data: myRecipient, error: myRecipientError } = await supabase
          .from('ticket_recipients')
          .select('*')
          .eq('ticket_id', ticketId)
          .eq('recipient_profile_id', user.id)
          .maybeSingle();

        if (myRecipientError) {
          console.error('[TicketDetail] myRecipientError:', myRecipientError?.message || myRecipientError);
          setError(`Error al cargar tu respuesta: ${myRecipientError.message || 'Error desconocido'}`);
          setLoading(false);
          return;
        }

        let recipientRow = myRecipient;

        if (!recipientRow) {
          console.log('[TicketDetail] No recipient row found for bidder. Creating one...');

          const { data: createdRecipient, error: createRecipientError } = await supabase
            .from('ticket_recipients')
            .insert({
              ticket_id: ticketId,
              ticket_creator_id: (ticketData as any).created_by ?? null,
              recipient_profile_id: user.id,
              status: 'sent',
              recipient_phone: null,
              recipient_email: null,
            })
            .select('*')
            .maybeSingle();

          if (createRecipientError) {
            console.error('[TicketDetail] createRecipientError:', createRecipientError?.message || createRecipientError);
            setError(
              `No se pudo crear tu respuesta: ${createRecipientError.message || 'Error desconocido'}. Revisá policies de ticket_recipients.`
            );
            setLoading(false);
            return;
          }

          if (!createdRecipient) {
            console.error('[TicketDetail] No data returned after insert');
            setError('No se pudo crear tu respuesta para este ticket (no data). Revisá policies de ticket_recipients.');
            setLoading(false);
            return;
          }

          recipientRow = createdRecipient;
        }

        setRecipient(recipientRow);
        setRecipients([]);
        setLoading(false);
      } catch (err) {
        console.error('[TicketDetail] Unexpected error:', err);
        setError('Ocurrió un error inesperado.');
        setLoading(false);
      }
    };

    fetchData();
  }, [ticketId, isAuthenticated, authLoading, navigate, user?.id]);

  const isOriginator = !!ticket && !!user?.id && (ticket.created_by ?? null) === user.id;
  const isBidder = !!ticket && !!user?.id && !isOriginator;

  const safeUpdateRecipient = async (recipientId: string, payload: Record<string, any>) => {
    const { error } = await supabase.from('ticket_recipients').update(payload).eq('id', recipientId);
    return error;
  };

  const handleMarkInReview = async () => {
    if (!recipient) return;
    setSubmitting(true);
    try {
      const error = await safeUpdateRecipient(recipient.id, {
        status: 'in_review',
        accepted_at: null,
        rejected_at: null,
      });

      if (error) {
        console.error('[TicketDetail] Error marking in_review:', error);
        alert(`Hubo un error al marcar en revisión: ${error.message || 'Error desconocido'}`);
        return;
      }

      setRecipient({ ...recipient, status: 'in_review', accepted_at: null, rejected_at: null });
      setActionCompleted(true);
    } catch (err) {
      console.error('[TicketDetail] Unexpected error:', err);
      alert('Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!recipient) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();

      const error = await safeUpdateRecipient(recipient.id, {
        status: 'rejected',
        rejected_at: now,
        accepted_at: null,
      });

      if (error) {
        console.error('[TicketDetail] Error rejecting ticket:', error);
        alert(`Hubo un error al rechazar la solicitud: ${error.message || 'Error desconocido'}`);
        return;
      }

      setRecipient({ ...recipient, status: 'rejected', rejected_at: now, accepted_at: null });
      setActionCompleted(true);
    } catch (err) {
      console.error('[TicketDetail] Unexpected error:', err);
      alert('Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenOfferModal = () => {
    if (!recipient) return;
    setOfferAmount(recipient.offer_amount != null ? String(recipient.offer_amount) : '');
    setOfferMessage(recipient.offer_message ?? '');
    setOfferDays(recipient.offer_estimated_days != null ? String(recipient.offer_estimated_days) : '');
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async () => {
    if (!recipient) return;

    const amountNumber = offerAmount.trim() === '' ? null : Number(offerAmount.replace(',', '.'));
    if (amountNumber !== null && (Number.isNaN(amountNumber) || amountNumber < 0)) {
      alert('El monto no es válido.');
      return;
    }

    const daysNumber = offerDays.trim() === '' ? null : Number(offerDays.replace(',', '.'));
    if (daysNumber !== null && (Number.isNaN(daysNumber) || daysNumber < 0)) {
      alert('Los días estimados no son válidos.');
      return;
    }

    setSubmitting(true);
    try {
      let error = await safeUpdateRecipient(recipient.id, {
        status: 'offered',
        accepted_at: null,
        rejected_at: null,
        offer_amount: amountNumber,
        offer_message: offerMessage.trim() || null,
        offer_estimated_days: daysNumber,
      });

      if (error) {
        console.warn('[TicketDetail] Offer fields update failed. Retrying with status only. Error:', error);

        const retryError = await safeUpdateRecipient(recipient.id, {
          status: 'offered',
          accepted_at: null,
          rejected_at: null,
        });

        if (retryError) {
          console.error('[TicketDetail] Error offering (retry) :', retryError);
          alert(`Hubo un error al enviar la oferta: ${retryError.message || 'Error desconocido'}`);
          return;
        }

        alert('Oferta enviada, pero el monto/mensaje no se pudieron guardar (faltan columnas en ticket_recipients).');
        setRecipient({ ...recipient, status: 'offered', accepted_at: null, rejected_at: null });
      } else {
        setRecipient({
          ...recipient,
          status: 'offered',
          accepted_at: null,
          rejected_at: null,
          offer_amount: amountNumber ?? undefined,
          offer_message: offerMessage.trim() || undefined,
          offer_estimated_days: daysNumber ?? undefined,
        });
      }

      setActionCompleted(true);
      setShowOfferModal(false);
    } catch (err) {
      console.error('[TicketDetail] Unexpected error:', err);
      alert('Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF4444';
      case 'high':
        return '#FF9944';
      case 'medium':
        return '#FFD644';
      case 'low':
        return '#44FF88';
      default:
        return NEON;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'labor':
        return 'Mano de Obra';
      case 'materials':
        return 'Materiales';
      case 'combined':
        return 'Mano de Obra + Materiales';
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  const getRecipientStatusMeta = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'offered') return { label: 'Oferta enviada', color: NEON };
    if (s === 'in_review') return { label: 'En revisión', color: '#FFD644' };
    if (s === 'accepted') return { label: 'Aceptado', color: NEON };
    if (s === 'rejected') return { label: 'Rechazado', color: '#FF4444' };
    if (s === 'sent') return { label: 'Pendiente de respuesta', color: '#888888' };
    return { label: status, color: '#888888' };
  };

  const cleanDigits = (v: string) => (v || '').replace(/\D/g, '');

  // ✅ Resolver teléfono de un recipient (para WhatsApp):
  // 1) recipient_phone
  // 2) users[recipient_profile_id].phone
  const resolveRecipientPhone = useMemo(() => {
    const byId = new Map<string, any>();
    for (const u of users) {
      if (u?.id) byId.set(String(u.id), u);
    }

    return (r: any): string | null => {
      const direct = r?.recipient_phone ? cleanDigits(String(r.recipient_phone)) : '';
      if (direct) return direct;

      const pid = r?.recipient_profile_id ? String(r.recipient_profile_id) : '';
      if (!pid) return null;

      const u = byId.get(pid);
      const p = u?.phone ? cleanDigits(String(u.phone)) : '';
      return p || null;
    };
  }, [users]);

  const handleOpenWhatsApp = (phone: string) => {
    const p = cleanDigits(phone);
    if (!p) return;
    window.open(`https://wa.me/${p}`, '_blank');
  };

  // ✅ Eliminar (mover a eliminados) — sin asumir schema: intentamos deleted_at, si falla intentamos status='deleted'
  const handleConfirmDelete = async () => {
    if (!ticketId) return;
    if (!isOriginator) return;

    setDeleteBusy(true);
    try {
      const now = new Date().toISOString();

      // intento 1: deleted_at (soft delete típico)
      const { error: e1 } = await supabase.from('tickets').update({ deleted_at: now }).eq('id', ticketId);

      if (e1) {
        // intento 2: status='deleted' (fallback)
        const { error: e2 } = await supabase.from('tickets').update({ status: 'deleted' }).eq('id', ticketId);

        if (e2) {
          console.error('[TicketDetail] Delete failed:', e1, e2);
          alert(`No se pudo eliminar la solicitud: ${e2.message || e1.message || 'Error desconocido'}`);
          setDeleteBusy(false);
          return;
        }
      }

      setShowDeleteConfirm(false);
      setShowDeletedNotice(true);
    } catch (err) {
      console.error('[TicketDetail] Unexpected delete error:', err);
      alert('Ocurrió un error inesperado al eliminar.');
    } finally {
      setDeleteBusy(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" style={{ color: '#FF4444' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: NEON,
              color: '#0a0a0a',
              boxShadow: `0 0 20px ${NEON}40`,
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" style={{ color: '#FF4444' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ticket no encontrado</h1>
          <p className="text-white/70 mb-6">No se pudo cargar la información del ticket.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: NEON,
              color: '#0a0a0a',
              boxShadow: `0 0 20px ${NEON}40`,
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const alreadyResponded = recipient ? (recipient.status || 'sent') !== 'sent' : false;
  const canRespond = isBidder && !!recipient && !actionCompleted;

  const shouldShowMaterials = ticket.type === 'materials' || ticket.type === 'combined';

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            borderColor: `${NEON}33`,
            boxShadow: `0 0 30px ${NEON}15`,
          }}
        >
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{ticket.title}</h1>
              <span
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${getPriorityColor(ticket.priority)}20`,
                  color: getPriorityColor(ticket.priority),
                  border: `1px solid ${getPriorityColor(ticket.priority)}40`,
                }}
              >
                {getPriorityLabel(ticket.priority)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <span
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${NEON}15`,
                  color: NEON,
                }}
              >
                {getTypeLabel(ticket.type)}
              </span>

              <span className="text-white/40">
                {isOriginator ? 'Vista: Originador (tu licitación)' : 'Vista: Oferente (licitación de otro)'}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-sm font-medium text-white/70 mb-2">Descripción</h2>
            <p className="text-white whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Lista de Materiales */}
          {shouldShowMaterials && materialsList && (
            <>
              {materialsItems.length > 0 ? (
                <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-white mb-1">{materialsList.name}</h2>
                    {materialsList.description && <p className="text-sm text-white/60">{materialsList.description}</p>}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 text-white/70 font-medium">Material / Producto</th>
                          <th className="text-left py-3 px-2 text-white/70 font-medium">Cantidad</th>
                          <th className="text-left py-3 px-2 text-white/70 font-medium">Unidad</th>
                          <th className="text-left py-3 px-2 text-white/70 font-medium">Especificación</th>
                          <th className="text-left py-3 px-2 text-white/70 font-medium">Comentario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materialsItems.map((item, idx) => (
                          <tr key={item.id} className={idx !== materialsItems.length - 1 ? 'border-b border-white/5' : ''}>
                            <td className="py-3 px-2 text-white">{item.material}</td>
                            <td className="py-3 px-2 text-white/80">{item.quantity ?? '-'}</td>
                            <td className="py-3 px-2 text-white/80">{item.unit ?? '-'}</td>
                            <td className="py-3 px-2 text-white/80">{item.spec ?? '-'}</td>
                            <td className="py-3 px-2 text-white/60">{item.comment ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
                    Total de items: {materialsItems.length}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <h2 className="text-lg font-semibold text-white mb-2">{materialsList.name}</h2>
                  {materialsList.description && <p className="text-sm text-white/60 mb-3">{materialsList.description}</p>}
                  <p className="text-white/50">No hay materiales en esta lista.</p>
                </div>
              )}
            </>
          )}

          {shouldShowMaterials && !materialsList && (
            <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-white/50">No se encontró lista de materiales para este ticket.</p>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ticket.start_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha de Inicio</div>
                  <div className="text-white font-medium">{new Date(ticket.start_date).toLocaleDateString('es-AR')}</div>
                </div>
              </div>
            )}
            {ticket.end_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha de Fin</div>
                  <div className="text-white font-medium">{new Date(ticket.end_date).toLocaleDateString('es-AR')}</div>
                </div>
              </div>
            )}
            {ticket.due_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha Límite</div>
                  <div className="text-white font-medium">{new Date(ticket.due_date).toLocaleDateString('es-AR')}</div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ ORIGINADOR: lista de ofertas/respuestas */}
          {isOriginator && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Ofertas / Respuestas recibidas</h2>

                {recipients.length === 0 ? (
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-white/60">Todavía no hay respuestas para esta licitación.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recipients.map((r: any) => {
                      const meta = getRecipientStatusMeta(r.status);
                      const resolvedPhone = resolveRecipientPhone(r);

                      return (
                        <div
                          key={r.id}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                        >
                          <div className="flex-1 pr-4">
                            <h3 className="font-medium text-white">
                              {r.profiles?.name || r.recipient_email || r.recipient_phone || 'Oferente'}
                            </h3>

                            {(r.offer_amount != null || r.offer_message) && (
                              <div className="mt-2 text-sm text-white/70">
                                {r.offer_amount != null && (
                                  <div>
                                    <span className="text-white/50">Monto: </span>
                                    <span className="font-semibold">${r.offer_amount}</span>
                                  </div>
                                )}
                                {r.offer_message && (
                                  <div className="mt-1 whitespace-pre-wrap">
                                    <span className="text-white/50">Mensaje: </span>
                                    {r.offer_message}
                                  </div>
                                )}
                              </div>
                            )}

                            {(r.accepted_at || r.rejected_at) && (
                              <p className="text-xs text-white/60 mt-2">
                                {r.accepted_at
                                  ? `Aceptado el ${new Date(r.accepted_at).toLocaleDateString('es-AR')}`
                                  : `Rechazado el ${new Date(r.rejected_at).toLocaleDateString('es-AR')}`}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => resolvedPhone && handleOpenWhatsApp(resolvedPhone)}
                              disabled={!resolvedPhone}
                              className={`p-2 rounded-lg transition-all ${resolvedPhone ? 'hover:scale-110' : 'opacity-40 cursor-not-allowed'}`}
                              style={{
                                backgroundColor: `${NEON}15`,
                                color: NEON,
                                border: `1px solid ${NEON}40`,
                              }}
                              title={resolvedPhone ? 'Contactar por WhatsApp' : 'Sin teléfono'}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            <span
                              className="px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: `${meta.color}20`,
                                color: meta.color,
                                border: `1px solid ${meta.color}40`,
                              }}
                            >
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ✅ Acciones Originador */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => ticketId && navigate(`/budget-management?edit=${encodeURIComponent(ticketId)}`)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <Edit className="w-5 h-5" />
                  Editar solicitud
                </button>

                <button
                  onClick={() =>
                    ticketId && navigate(`/budget-management?edit=${encodeURIComponent(ticketId)}&send=1`)
                  }
                  className="flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: NEON,
                    color: '#0a0a0a',
                    boxShadow: `0 0 20px ${NEON}40`,
                  }}
                >
                  <Send className="w-5 h-5" />
                  Enviar a más contactos
                </button>
              </div>

              {/* ✅ Eliminar (solo originador) */}
              <div className="mb-8">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: 'rgba(255,68,68,0.08)',
                    color: '#FF6B6B',
                    borderColor: 'rgba(255,68,68,0.25)',
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar (mover a Eliminados)
                </button>
              </div>
            </>
          )}

          {/* ✅ OFERENTE: estado actual */}
          {isBidder && recipient && (
            <div
              className="mb-6 p-4 rounded-xl border text-center"
              style={{
                backgroundColor: `${NEON}10`,
                borderColor: `${NEON}40`,
                color: NEON,
              }}
            >
              <p className="text-sm">
                Tu estado en esta licitación:{' '}
                <span className="font-semibold">{getRecipientStatusMeta(recipient.status).label}</span>
              </p>
              {recipient.offer_amount != null && (
                <p className="text-xs mt-1 text-white/70">
                  Monto enviado: <span className="font-semibold">${recipient.offer_amount}</span>
                </p>
              )}
            </div>
          )}

          {/* ✅ OFERENTE: acciones */}
          {canRespond && recipient && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={handleMarkInReview}
                  disabled={submitting}
                  className="py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,214,68,0.08)',
                    color: '#FFD644',
                    borderColor: 'rgba(255,214,68,0.25)',
                  }}
                >
                  <Clock className="w-5 h-5" />
                  {submitting ? 'Guardando...' : 'En revisión'}
                </button>

                <button
                  onClick={handleOpenOfferModal}
                  disabled={submitting}
                  className="py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: NEON,
                    color: '#0a0a0a',
                    boxShadow: `0 0 20px ${NEON}40`,
                  }}
                >
                  <CheckCircle className="w-6 h-6" />
                  {submitting ? 'Procesando...' : 'Ofertar'}
                </button>

                <button
                  onClick={handleReject}
                  disabled={submitting}
                  className="py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: 'rgba(255,68,68,0.1)',
                    color: '#FF4444',
                    borderColor: '#FF444440',
                  }}
                >
                  <XCircle className="w-6 h-6" />
                  {submitting ? 'Enviando...' : 'Rechazar'}
                </button>
              </div>

              {alreadyResponded && (
                <div className="text-center text-xs text-white/50">
                  Ya registraste una acción. Si necesitás cambiarla, por ahora podés volver a ofertar.
                </div>
              )}
            </div>
          )}

          {/* Modal oferta */}
          {showOfferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70" onClick={() => !submitting && setShowOfferModal(false)} />
              <div
                className="relative w-full max-w-lg rounded-2xl border p-6"
                style={{
                  backgroundColor: 'rgba(10,10,10,0.95)',
                  borderColor: `${NEON}33`,
                  boxShadow: `0 0 30px ${NEON}20`,
                }}
              >
                <h3 className="text-xl font-bold mb-4">Enviar oferta</h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/60">Monto propuesto</label>
                    <input
                      type="text"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Ej: 250000"
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60">Días estimados (opcional)</label>
                    <input
                      type="text"
                      value={offerDays}
                      onChange={(e) => setOfferDays(e.target.value)}
                      placeholder="Ej: 10"
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60">Mensaje (opcional)</label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Condiciones, materiales incluidos/excluidos, forma de pago, etc."
                      rows={4}
                      className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowOfferModal(false)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSubmitOffer}
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: NEON,
                      color: '#0a0a0a',
                      boxShadow: `0 0 20px ${NEON}40`,
                    }}
                  >
                    {submitting ? 'Enviando...' : 'Enviar oferta'}
                  </button>
                </div>

                <p className="mt-3 text-xs text-white/40">
                  Si el monto/mensaje no se guarda, revisá que existan las columnas <b>offer_amount</b> / <b>offer_message</b> en{' '}
                  <b>ticket_recipients</b>.
                </p>
              </div>
            </div>
          )}

          {/* ✅ Botón volver más grande */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition-all border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderColor: `${NEON}22`,
                boxShadow: `0 0 18px ${NEON}12`,
              }}
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal confirm delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => !deleteBusy && setShowDeleteConfirm(false)} />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{
              backgroundColor: 'rgba(10,10,10,0.95)',
              borderColor: 'rgba(255,255,255,0.12)',
              boxShadow: `0 0 30px rgba(0,255,163,0.12)`,
            }}
          >
            <h3 className="text-lg font-bold mb-2">¿Mover a Eliminados?</h3>
            <p className="text-sm text-white/70">
              Esta solicitud se moverá a <b>Eliminados</b>. Podés restaurarla más adelante desde esa sección.
            </p>

            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleteBusy}
                className="px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(255,68,68,0.15)',
                  color: '#FF6B6B',
                  border: '1px solid rgba(255,68,68,0.35)',
                }}
              >
                {deleteBusy ? 'Moviendo…' : 'Mover a Eliminados'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal deleted notice */}
      {showDeletedNotice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{
              backgroundColor: 'rgba(10,10,10,0.95)',
              borderColor: `${NEON}33`,
              boxShadow: `0 0 30px ${NEON}18`,
            }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: NEON }}>
              Solicitud movida a Eliminados
            </h3>
            <p className="text-sm text-white/70">Podés verla (y restaurarla) desde la sección “Eliminados”.</p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => navigate('/budget-management?tab=deleted')}
                className="px-5 py-3 rounded-xl font-semibold transition-all border w-full sm:w-auto"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                Ver Eliminados
              </button>

              <button
                onClick={() => navigate('/budget-management')}
                className="px-5 py-3 rounded-xl font-semibold transition-all w-full sm:w-auto"
                style={{
                  backgroundColor: NEON,
                  color: '#0a0a0a',
                  boxShadow: `0 0 20px ${NEON}40`,
                }}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
