-- Crear la base de datos
CREATE DATABASE doctrack;
\c doctrack;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    password_hash TEXT NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('administrador', 'preparador', 'cliente')) NOT NULL,
    foto_url TEXT,
    token TEXT,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    pasaporte TEXT,
    email TEXT,
    telefono TEXT,
    canal_entrada TEXT,
    cita_pagada BOOLEAN,
    tramite_contratado VARCHAR(20) CHECK (tramite_contratado IN ('inicial', 'renovacion')),
    contrato_firmado BOOLEAN,
    pago_anticipo BOOLEAN,
    estado_cliente VARCHAR(20) CHECK (estado_cliente IN ('nuevo', 'evaluando', 'activo', 'cerrado')) DEFAULT 'nuevo',
    preparador_id INTEGER REFERENCES usuarios(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipos_visa (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE tramites (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    tipo_visa_id INTEGER REFERENCES tipos_visa(id),
    es_renovacion BOOLEAN,
    estatus TEXT,
    fecha_inicio DATE,
    fecha_estimado_cierre DATE,
    preparador_id INTEGER REFERENCES usuarios(id),
    observaciones TEXT,
    archivo_1 TEXT,
    archivo_2 TEXT,
    archivo_3 TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE checklist (
    id SERIAL PRIMARY KEY,
    tramite_id INTEGER REFERENCES tramites(id) ON DELETE CASCADE,
    nombre_paso TEXT NOT NULL,
    obligatorio BOOLEAN DEFAULT TRUE,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_proceso', 'completado')) DEFAULT 'pendiente',
    instrucciones TEXT
);

CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    tramite_id INTEGER REFERENCES tramites(id),
    subido_por VARCHAR(20) CHECK (subido_por IN ('cliente', 'preparador')),
    tipo_archivo TEXT,
    estado_archivo VARCHAR(20) CHECK (estado_archivo IN ('aprobado', 'rechazado', 'pendiente')) DEFAULT 'pendiente',
    notas TEXT,
    archivo_url TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    fecha_firma DATE,
    monto_total NUMERIC(10,2),
    firma TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    fecha DATE NOT NULL,
    monto NUMERIC(10,2),
    medio_pago TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion TEXT,
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
    leida BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trigger_clientes BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trigger_tramites BEFORE UPDATE ON tramites FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre_completo, email, telefono, password_hash, rol, foto_url)
VALUES 
('Carlos Admin', 'admin@doctrack.com', '3010001111', 'admin123', 'administrador', 'https://example.com/fotos/admin.jpg'),
('Laura Prep', 'preparador@doctrack.com', '3020002222', 'prep123', 'preparador', 'https://example.com/fotos/preparador.jpg'),
('Juan Cliente', 'cliente@doctrack.com', '3030003333', 'cliente123', 'cliente', 'https://example.com/fotos/cliente.jpg');

INSERT INTO tipos_visa (nombre) VALUES
('Asilo'), ('Ajuste de Estatus'), ('Petición Familiar'), ('Visa U'),
('Visa T'), ('VAWA'), ('Visa E-2'), ('Visa E-1'),
('Visa H1B'), ('Visa H1B1'), ('Visa L'), ('Visa O'),
('Visa EB2 NIW'), ('Visa EB2 (con Certificación Laboral)'), ('Visa EB3 (con Certificación Laboral)');
