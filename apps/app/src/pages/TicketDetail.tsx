import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Calendar, AlertTriangle, Clock } from 'lucide-react';

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

  // OJO: dejamos string para permitir nuevos estados sin romper TS
  status: string;

  recipient_phone: string | null;
  recipient_email: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  recipient_profile_id?: string | null;
  ticket_creator_id?: string | null;

  // Opcionales (si existen en DB)
  offer_amount?: number | null;
  offer_message?: string | null;
  offer_estimated_days?: number | null;
}

const TicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useApp();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  // Modal oferta
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [offerDays, setOfferDays] = useState<string>('');

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

        const isOriginator = (ticketData as any).created_by === user.id;

        // ✅ ORIGINADOR: ve TODAS las respuestas/ofertas
        if (isOriginator) {
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

        // ✅ OFERENTE: busca (o crea) su fila en ticket_recipients
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

  // Helpers de contexto por ticket
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

  // “Rechazar” (ofertante)
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

  // Abrir modal de oferta
  const handleOpenOfferModal = () => {
    if (!recipient) return;
    setOfferAmount(recipient.offer_amount != null ? String(recipient.offer_amount) : '');
    setOfferMessage(recipient.offer_message ?? '');
    setOfferDays(recipient.offer_estimated_days != null ? String(recipient.offer_estimated_days) : '');
    setShowOfferModal(true);
  };

  // Enviar oferta (ofertante)
  const handleSubmitOffer = async () => {
    if (!recipient) return;

    const amountNumber =
      offerAmount.trim() === '' ? null : Number(offerAmount.replace(',', '.'));

    if (amountNumber !== null && (Number.isNaN(amountNumber) || amountNumber < 0)) {
      alert('El monto no es válido.');
      return;
    }

    const daysNumber =
      offerDays.trim() === '' ? null : Number(offerDays.replace(',', '.'));

    if (daysNumber !== null && (Number.isNaN(daysNumber) || daysNumber < 0)) {
      alert('Los días estimados no son válidos.');
      return;
    }

    setSubmitting(true);
    try {
      // Intento 1: guardar oferta + status
      let error = await safeUpdateRecipient(recipient.id, {
        status: 'offered',
        accepted_at: null,
        rejected_at: null,
        offer_amount: amountNumber,
        offer_message: offerMessage.trim() || null,
        offer_estimated_days: daysNumber,
      });

      // Si falla por columnas inexistentes, reintento guardando SOLO status
      if (error) {
        console.warn(
          '[TicketDetail] Offer fields update failed. Retrying with status only. Error:',
          error
        );

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

        alert(
          'Oferta enviada, pero el monto/mensaje no se pudieron guardar (faltan columnas en ticket_recipients).'
        );
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

  // Ahora el “ya respondió” aplica a cualquier no-originador
  const alreadyResponded = recipient ? (recipient.status || 'sent') !== 'sent' : false;
  const canRespond = isBidder && !!recipient && !actionCompleted;

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

              {/* Contexto visible */}
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

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ticket.start_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha de Inicio</div>
                  <div className="text-white font-medium">
                    {new Date(ticket.start_date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            )}
            {ticket.end_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha de Fin</div>
                  <div className="text-white font-medium">
                    {new Date(ticket.end_date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            )}
            {ticket.due_date && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <Clock className="w-5 h-5" style={{ color: NEON }} />
                <div>
                  <div className="text-xs text-white/60">Fecha Límite</div>
                  <div className="text-white font-medium">
                    {new Date(ticket.due_date).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ ORIGINADOR: lista de ofertas/respuestas */}
          {isOriginator && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Ofertas / Respuestas recibidas</h2>

              {recipients.length === 0 ? (
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-white/60">Todavía no hay respuestas para esta licitación.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recipients.map((r: any) => {
                    const meta = getRecipientStatusMeta(r.status);
                    return (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex-1 pr-4">
                          <h3 className="font-medium text-white">
                            {r.profiles?.name || r.recipient_phone || r.recipient_email || 'Oferente'}
                          </h3>

                          {/* Monto/Mensaje si existen */}
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
                    );
                  })}
                </div>
              )}
            </div>
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

              {/* Si ya respondió y vuelve a entrar, dejamos que pueda re-ofertar (por ahora no bloqueamos). */}
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
                  Si el monto/mensaje no se guarda, revisá que existan las columnas <b>offer_amount</b> / <b>offer_message</b> en <b>ticket_recipients</b>.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
