import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

// react-bootstrap
import { Card, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import logoDark from 'assets/images/logo-dark.svg';

// -----------------------|| SIGNIN ||-----------------------//

export default function SignIn1() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/usuarios/login', {
        email,
        password
      });

      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Normaliza la ruta "from" para evitar duplicar el basename (/Doctrack)
      const appBase = (import.meta.env?.VITE_APP_BASE_NAME || '').replace(/\/+$/, '');
      const rawFrom = location.state?.from?.pathname || '/dashboard/sales';

      let from = rawFrom;
      if (appBase && rawFrom.startsWith(appBase)) {
        from = rawFrom.slice(appBase.length) || '/dashboard/sales';
      }
      if (!from.startsWith('/')) {
        from = `/${from}`;
      }

      navigate(from, { replace: true });
    } catch (err) {
      console.error('Error en login:', err);
      setError('Credenciales inválidas o error del servidor');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <img src={logoDark} alt="" className="img-fluid mb-4" />
                <h4 className="mb-3 f-w-400">Iniciar sesión</h4>

                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={handleLogin}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="mail" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="lock" />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>

                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      className="text-left mb-4 mt-2"
                      label="Recordar credenciales."
                      defaultChecked
                    />
                  </Form.Group>

                  <Button type="submit" className="btn btn-block btn-primary mb-4">
                    Ingresar
                  </Button>
                </Form>

                <p className="mb-2 text-muted">
                  ¿Olvidaste la contraseña?{' '}
                  <NavLink to="#" className="f-w-400">
                    Recuperar
                  </NavLink>
                </p>
                <p className="mb-0 text-muted">
                  ¿No tienes una cuenta?{' '}
                  <NavLink to="/auth/register" className="f-w-400">
                    Registrarse
                  </NavLink>
                </p>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}