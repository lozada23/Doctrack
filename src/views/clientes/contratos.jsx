import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Row, Col } from 'react-bootstrap';

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoContrato, setNuevoContrato] = useState({
    cliente_id: '',
    fecha_firma: '',
    monto_total: '',
    firma: ''
  });

  const clientes = [
    { id: 1, nombre: 'Carlos Gómez' },
    { id: 2, nombre: 'María Torres' }
    // Reemplaza por fetch al backend en producción
  ];

  useEffect(() => {
    // Simular datos de contratos existentes
    setContratos([
      {
        id: 1,
        cliente_id: 1,
        cliente_nombre: 'Carlos Gómez',
        fecha_firma: '2025-08-01',
        monto_total: 1500,
        firma: 'https://firmas.ejemplo.com/contrato1.pdf'
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoContrato((prev) => ({ ...prev, [name]: value }));
  };

  const guardarContrato = () => {
    const cliente = clientes.find((c) => c.id.toString() === nuevoContrato.cliente_id);
    const nuevo = {
      id: contratos.length + 1,
      ...nuevoContrato,
      cliente_nombre: cliente?.nombre
    };
    setContratos([...contratos, nuevo]);
    setShowModal(false);
    setNuevoContrato({ cliente_id: '', fecha_firma: '', monto_total: '', firma: '' });
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Contratos</h4>
          <Button onClick={() => setShowModal(true)}>Nuevo Contrato</Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha de Firma</th>
              <th>Monto</th>
              <th>Enlace Firma</th>
            </tr>
          </thead>
          <tbody>
            {contratos.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No hay contratos registrados.
                </td>
              </tr>
            ) : (
              contratos.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.cliente_nombre}</td>
                  <td>{c.fecha_firma}</td>
                  <td>${parseFloat(c.monto_total).toLocaleString()}</td>
                  <td>
                    <a href={c.firma} target="_blank" rel="noopener noreferrer">
                      Ver Firma
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Contrato</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    name="cliente_id"
                    value={nuevoContrato.cliente_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Fecha de Firma</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_firma"
                    value={nuevoContrato.fecha_firma}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Monto Total</Form.Label>
              <Form.Control
                type="number"
                name="monto_total"
                value={nuevoContrato.monto_total}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Enlace Firma (Zoho Sign)</Form.Label>
              <Form.Control
                type="url"
                name="firma"
                value={nuevoContrato.firma}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarContrato}>
            Guardar Contrato
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
