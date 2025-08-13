import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

export default function NuevoCasoMigratorio() {
  const [form, setForm] = useState({
    cliente_id: '',
    preparador_id: '',
    tipo_visa_id: '',
    es_renovacion: false,
    estatus: '',
    fecha_inicio: '',
    fecha_estimado_cierre: '',
    observaciones: '',
    archivo_1: null,
    archivo_2: null,
    archivo_3: null
  });

  const estatusDelCaso = [
    'CASO EN PROCESO',
    'CASO EN REVISION',
    'CASO ENVIADO',
    'RFE',
    'ENVIO RFE',
    'APROBADO',
    'RECHAZADO'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', form);
    // Aquí va la lógica de envío al backend
  };

  const handleReset = () => {
    setForm({
      cliente_id: '',
      preparador_id: '',
      tipo_visa_id: '',
      es_renovacion: false,
      estatus: '',
      fecha_inicio: '',
      fecha_estimado_cierre: '',
      observaciones: '',
      archivo_1: null,
      archivo_2: null,
      archivo_3: null
    });
  };

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">Registrar Nuevo Caso Migratorio</h4>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Cliente ID</Form.Label>
                <Form.Control
                  name="cliente_id"
                  value={form.cliente_id}
                  onChange={handleChange}
                  placeholder="Ej: 1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Preparador ID</Form.Label>
                <Form.Control
                  name="preparador_id"
                  value={form.preparador_id}
                  onChange={handleChange}
                  placeholder="Ej: 2"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tipo de Visa ID</Form.Label>
                <Form.Control
                  name="tipo_visa_id"
                  value={form.tipo_visa_id}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>¿Es renovación?</Form.Label>
                <Form.Check
                  type="checkbox"
                  name="es_renovacion"
                  checked={form.es_renovacion}
                  onChange={handleChange}
                  label="Sí"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estatus</Form.Label>
                <Form.Select name="estatus" value={form.estatus} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {estatusDelCaso.map((estado, i) => (
                    <option key={i} value={estado}>
                      {estado}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha de inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={form.fecha_inicio}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Fecha estimada de cierre</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_estimado_cierre"
                  value={form.fecha_estimado_cierre}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Observaciones</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Archivo 1</Form.Label>
                <Form.Control type="file" name="archivo_1" onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Archivo 2</Form.Label>
                <Form.Control type="file" name="archivo_2" onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Archivo 3</Form.Label>
                <Form.Control type="file" name="archivo_3" onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleReset}>
              Reiniciar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Caso
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
