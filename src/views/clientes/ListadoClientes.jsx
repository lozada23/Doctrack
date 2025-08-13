import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function ListadoClientes() {
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/clientes/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setClientes(response.data);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('No se pudieron cargar los clientes');
      }
    };

    fetchClientes();
  }, []);

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Listado de Clientes</h4>
          <Link to="/clientes/nuevo">
            <Button variant="primary">Nuevo Cliente</Button>
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre completo</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Pasaporte</th>
              <th>Canal</th>
              <th>Trámite</th>
              <th>Contrato</th>
              <th>Anticipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr key={cliente.id}>
                <td>{index + 1}</td>
                <td>{cliente.nombre_completo}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.pasaporte}</td>
                <td>{cliente.canal_entrada}</td>
                <td>{cliente.tramite_contratado}</td>
                <td>{cliente.contrato_firmado ? 'Sí' : 'No'}</td>
                <td>{cliente.pago_anticipo ? 'Sí' : 'No'}</td>
                <td>{cliente.estado_cliente}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}