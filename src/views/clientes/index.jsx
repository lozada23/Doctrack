import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';

const API_BASE = 'http://localhost:3001';

const initialForm = {
  nombre_completo: '',
  pasaporte: '',
  email: '',
  telefono: '',
  canal_entrada: '',
  cita_pagada: false,
  tramite_contratado: '',
  contrato_firmado: false,
  pago_anticipo: false,
  estado_cliente: 'evaluando',
  preparador_id: ''
};

export default function ClienteFormulario() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Usuario actual y lista de posibles asignables
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [usuariosAsignables, setUsuariosAsignables] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const canales = ['Facebook', 'Instagram', 'Referido', 'Otro'];
  const tramites = ['inicial', 'renovacion'];
  const estados = ['evaluando', 'prospecto', 'activo', 'cerrado'];

  const isAdmin = useMemo(() => usuarioActual?.rol === 'administrador', [usuarioActual]);
  const isPreparador = useMemo(() => usuarioActual?.rol === 'preparador', [usuarioActual]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setField(name, type === 'checkbox' ? checked : value);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token || ''}`
    };
  };

  // Helper: normaliza y decide si un usuario es asignable (admin/prep y no inactivo explícito)
  const normaliza = (u) => ({
    ...u,
    rol: String(u?.rol || '').toLowerCase()
  });
  const esAsignable = (u) => {
    const rolOk = u.rol === 'administrador' || u.rol === 'preparador';
    // Si el backend NO manda "activo", lo consideramos activo; solo excluimos si viene false/0 explícito
    const activoOk = !(u.hasOwnProperty('activo')) || u.activo === true || u.activo === 1;
    return rolOk && activoOk;
  };

  // Cargar usuario desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('usuario');
      if (raw) {
        const u = JSON.parse(raw);
        setUsuarioActual(u || null);
        if (u?.rol === 'preparador' && u?.id) {
          setForm((prev) => ({ ...prev, preparador_id: String(u.id) }));
        }
      }
    } catch (e) {
      console.warn('No fue posible leer usuario de localStorage:', e);
    }
  }, []);

  // Si es admin, cargar lista de usuarios asignables (solo admin/prep)
  useEffect(() => {
    const fetchUsuariosAsignables = async () => {
      if (!isAdmin) return;

      setLoadingUsuarios(true);
      setServerError('');

      try {
        // 1) Intento con filtros (si tu backend lo soporta)
        const primary = await axios.get(
          `${API_BASE}/usuarios?roles=administrador,preparador`,
          { headers: getAuthHeaders() }
        );
        const data = Array.isArray(primary.data) ? primary.data.map(normaliza) : [];
        const filtrados = data.filter(esAsignable);
        if (filtrados.length > 0 || Array.isArray(primary.data)) {
          setUsuariosAsignables(filtrados);
        } else {
          throw new Error('Sin resultados con filtros, probando fallback');
        }
      } catch {
        try {
          // 2) Fallback: traer todos y filtrar aquí
          const all = await axios.get(`${API_BASE}/usuarios`, { headers: getAuthHeaders() });
          const list = Array.isArray(all.data) ? all.data.map(normaliza) : [];
          setUsuariosAsignables(list.filter(esAsignable));
        } catch (e2) {
          console.error('Error cargando usuarios asignables:', e2);
          setServerError('No fue posible cargar la lista de usuarios. Verifica el endpoint /usuarios.');
        }
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuariosAsignables();
  }, [isAdmin]);

  const validate = () => {
    const newErrors = {};
    if (!form.nombre_completo?.trim()) newErrors.nombre_completo = 'Requerido';
    if (!form.email?.trim()) newErrors.email = 'Requerido';

    if (isAdmin) {
      if (!form.preparador_id || isNaN(Number(form.preparador_id))) {
        newErrors.preparador_id = 'Selecciona un usuario válido';
      }
    } else if (isPreparador) {
      if (!form.preparador_id || isNaN(Number(form.preparador_id))) {
        newErrors.preparador_id = 'No se detectó el ID del usuario logueado';
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    const val = validate();
    if (Object.keys(val).length > 0) {
      setErrors(val);
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setServerError('No hay token en la sesión. Inicia sesión nuevamente.');
        setSubmitting(false);
        return;
      }

      let preparadorIdFinal = form.preparador_id;
      if (isPreparador && usuarioActual?.id) {
        preparadorIdFinal = usuarioActual.id;
      }

      const payload = {
        nombre_completo: form.nombre_completo,
        pasaporte: form.pasaporte || null,
        email: form.email,
        telefono: form.telefono || null,
        canal_entrada: form.canal_entrada || null,
        cita_pagada: Boolean(form.cita_pagada),
        tramite_contratado: form.tramite_contratado || null,
        contrato_firmado: Boolean(form.contrato_firmado),
        pago_anticipo: Boolean(form.pago_anticipo),
        estado_cliente: form.estado_cliente || 'evaluando',
        ...(preparadorIdFinal ? { preparador_id: Number(preparadorIdFinal) } : {})
      };

      await axios.post(`${API_BASE}/clientes/`, payload, {
        headers: getAuthHeaders()
      });

      setSuccessMsg('Cliente creado correctamente.');
      setForm(
        isPreparador && usuarioActual?.id
          ? { ...initialForm, preparador_id: String(usuarioActual.id) }
          : initialForm
      );
    } catch (err) {
      console.error('Error creando cliente:', err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Ocurrió un error al crear el cliente.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Campo Preparador según rol
  const renderCampoPreparador = () => {
    if (isPreparador) {
      return (
        <Form.Group>
          <Form.Label>Preparador</Form.Label>
          <Form.Control
            plaintext
            readOnly
            value={usuarioActual?.nombre_completo || 'Usuario actual'}
          />
          <input type="hidden" name="preparador_id" value={form.preparador_id} />
        </Form.Group>
      );
    }

    if (isAdmin) {
      const listaFiltradaOrdenada = usuariosAsignables
        .map(normaliza)
        .filter(esAsignable)
        .sort((a, b) =>
          String(a.nombre_completo || '').localeCompare(String(b.nombre_completo || ''))
        );

      return (
        <Form.Group>
          <Form.Label>Preparador / Administrador (asignado) *</Form.Label>
          <Form.Select
            name="preparador_id"
            value={form.preparador_id}
            onChange={handleChange}
            isInvalid={!!errors.preparador_id}
            disabled={loadingUsuarios}
          >
            <option value="">{loadingUsuarios ? 'Cargando...' : 'Seleccione...'}</option>
            {listaFiltradaOrdenada.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre_completo} — {u.rol}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.preparador_id}
          </Form.Control.Feedback>
        </Form.Group>
      );
    }

    return null;
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">Registrar Cliente</Card.Title>
      </Card.Header>
      <Card.Body>
        {serverError && (
          <Alert variant="danger" className="mb-3">
            {serverError}
          </Alert>
        )}
        {successMsg && (
          <Alert variant="success" className="mb-3">
            {successMsg}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nombre completo *</Form.Label>
                <Form.Control
                  name="nombre_completo"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  isInvalid={!!errors.nombre_completo}
                  placeholder="Ej: Samantha Cardona"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre_completo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  placeholder="samantha@example.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="3057239561"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pasaporte</Form.Label>
                <Form.Control
                  name="pasaporte"
                  value={form.pasaporte}
                  onChange={handleChange}
                  placeholder="YP123F567"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Canal de entrada</Form.Label>
                <Form.Select
                  name="canal_entrada"
                  value={form.canal_entrada}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {canales.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Trámite contratado</Form.Label>
                <Form.Select
                  name="tramite_contratado"
                  value={form.tramite_contratado}
                  onChange={handleChange}
                >
                  <option value="">Seleccione...</option>
                  {tramites.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Check
                type="switch"
                id="cita_pagada"
                label="Cita pagada"
                name="cita_pagada"
                checked={form.cita_pagada}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="contrato_firmado"
                label="Contrato firmado"
                name="contrato_firmado"
                checked={form.contrato_firmado}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                id="pago_anticipo"
                label="Pago anticipo"
                name="pago_anticipo"
                checked={form.pago_anticipo}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Estado del cliente</Form.Label>
                <Form.Select
                  name="estado_cliente"
                  value={form.estado_cliente}
                  onChange={handleChange}
                >
                  {estados.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>{renderCampoPreparador()}</Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button
              type="button"
              variant="outline-secondary"
              onClick={() => {
                setErrors({});
                setServerError('');
                setSuccessMsg('');
                if (isPreparador && usuarioActual?.id) {
                  setForm({ ...initialForm, preparador_id: String(usuarioActual.id) });
                } else {
                  setForm(initialForm);
                }
              }}
              disabled={submitting}
            >
              Limpiar
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                'Guardar Cliente'
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}