import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Datos simulados, reemplaza con fetch a tu backend
const mockClientes = [
  {
    id: 1,
    nombre_completo: 'Carlos Gómez',
    email: 'carlos@example.com',
    telefono: '3121234567',
    estado_cliente: 'activo',
    cantidad_tramites: 2
  },
  {
    id: 2,
    nombre_completo: 'María Torres',
    email: 'maria@example.com',
    telefono: '3109876543',
    estado_cliente: 'evaluando',
    cantidad_tramites: 1
  }
];

export default function SeguimientoCasos() {
  const [clientes, setClientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Aquí deberías hacer fetch al backend para obtener clientes y sus trámites
    setClientes(mockClientes);
  }, []);

  const verSeguimiento = (clienteId) => {
    navigate(`/casos/seguimiento/${clienteId}`);
  };

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">Seguimiento de Casos por Cliente</h4>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Trámites</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre_completo}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <Badge
                      bg={
                        cliente.estado_cliente === 'activo'
                          ? 'success'
                          : cliente.estado_cliente === 'evaluando'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {cliente.estado_cliente.toUpperCase()}
                    </Badge>
                  </td>
                  <td>{cliente.cantidad_tramites}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => verSeguimiento(cliente.id)}>
                      Seguimiento
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}