import React from 'react';
import { Table, Card, Button } from 'react-bootstrap';

const casosEjemplo = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    tipoVisa: 'Asilo',
    esRenovacion: false,
    estatus: 'CASO EN PROCESO',
    fechaInicio: '2025-06-01',
    fechaCierre: '2025-10-01',
    preparador: 'Ana Gómez'
  },
  {
    id: 2,
    cliente: 'María Torres',
    tipoVisa: 'Visa EB2 NIW',
    esRenovacion: true,
    estatus: 'APROBADO',
    fechaInicio: '2025-03-15',
    fechaCierre: '2025-07-10',
    preparador: 'Carlos Díaz'
  },
  {
    id: 3,
    cliente: 'Luis Romero',
    tipoVisa: 'VAWA',
    esRenovacion: false,
    estatus: 'RFE',
    fechaInicio: '2025-05-20',
    fechaCierre: '',
    preparador: 'Sofía Martínez'
  }
];

export default function ListaCasos() {
  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">Listado de Casos Migratorios</h4>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Tipo de Visa</th>
              <th>Renovación</th>
              <th>Estatus</th>
              <th>Fecha Inicio</th>
              <th>Fecha Estimada Cierre</th>
              <th>Preparador</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {casosEjemplo.map((caso, i) => (
              <tr key={i}>
                <td>{caso.id}</td>
                <td>{caso.cliente}</td>
                <td>{caso.tipoVisa}</td>
                <td>{caso.esRenovacion ? 'Sí' : 'No'}</td>
                <td>{caso.estatus}</td>
                <td>{caso.fechaInicio}</td>
                <td>{caso.fechaCierre || 'Pendiente'}</td>
                <td>{caso.preparador}</td>
                <td>
                  <Button size="sm" variant="primary" className="me-2">
                    Ver
                  </Button>
                  <Button size="sm" variant="warning">
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
